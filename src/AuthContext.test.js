import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

jest.mock('./firebase', () => ({
  auth: { __tag: 'auth' },
  db: { __tag: 'db' },
  googleProvider: { __tag: 'googleProvider' },
}));

jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'guest-1', email: null } })),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ __tag: 'docRef' })),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  setDoc: jest.fn(() => Promise.resolve()),
}));

jest.mock('./i18n', () => ({ changeLanguage: jest.fn() }));

// Captures the auth-state listener so tests can drive sign-in transitions.
let authStateCallback;
onAuthStateChanged.mockImplementation((authArg, cb) => {
  authStateCallback = cb;
  return jest.fn(); // unsubscribe
});

// Exposes the context value and the resolved currentUser to assertions.
let ctx;
function Consumer() {
  ctx = useAuth();
  const { currentUser } = ctx;
  return <div data-testid="uid">{currentUser ? currentUser.uid : 'none'}</div>;
}

async function fireAuthState(user) {
  await act(async () => {
    authStateCallback(user);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  authStateCallback = undefined;
  ctx = undefined;
  onAuthStateChanged.mockImplementation((authArg, cb) => {
    authStateCallback = cb;
    return jest.fn();
  });
});

describe('AuthContext — guest sign-in (Packet 121)', () => {
  test('signInAsGuest calls Firebase signInAnonymously with auth', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    // Flip loading→false so children (and the context) are available.
    await fireAuthState(null);

    await act(async () => {
      await ctx.signInAsGuest();
    });

    expect(signInAnonymously).toHaveBeenCalledTimes(1);
    expect(signInAnonymously).toHaveBeenCalledWith(expect.objectContaining({ __tag: 'auth' }));
  });

  test('an anonymous user enters the same authenticated flow as other sign-ins', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    // Simulate signInAnonymously resolving -> auth-state listener fires with a
    // guest user whose email is null.
    await fireAuthState({ uid: 'guest-1', email: null });

    // currentUser is set -> App renders the authenticated app (DayGuide) exactly
    // as it does for Google/email users.
    expect(screen.getByTestId('uid')).toHaveTextContent('guest-1');
    // Guest prefs are still loaded under users/{uid}.
    expect(getDoc).toHaveBeenCalled();
  });

  test('does not store the string "null" for a guest user email', async () => {
    localStorage.setItem('dayguide_user_email', 'previous@example.com');
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await fireAuthState({ uid: 'guest-1', email: null });

    expect(localStorage.getItem('dayguide_user_email')).toBeNull();
  });

  test('still stores the email for a normal (email) user', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await fireAuthState({ uid: 'user-1', email: 'real@example.com' });

    expect(localStorage.getItem('dayguide_user_email')).toBe('real@example.com');
  });
});
