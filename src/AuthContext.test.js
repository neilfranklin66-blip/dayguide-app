import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
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
  signOut.mockResolvedValue(undefined);
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

describe('AuthContext — logout (Packet 124)', () => {
  // Renders the provider and puts it in a signed-in state, so logout is
  // exercised from the same place a real user reaches it.
  async function renderSignedIn(user = { uid: 'user-1', email: 'real@example.com' }) {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await fireAuthState(user);
  }

  test('logout calls Firebase signOut with auth', async () => {
    await renderSignedIn();

    await act(async () => {
      await ctx.logout();
    });

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(expect.objectContaining({ __tag: 'auth' }));
  });

  test('logout signs out a guest user through the same signOut path', async () => {
    await renderSignedIn({ uid: 'guest-1', email: null });

    await act(async () => {
      await ctx.logout();
    });

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(expect.objectContaining({ __tag: 'auth' }));
  });

  // The header wires the button up as `onClick={logout}`, so logout is always
  // invoked with a click event. It must reach signOut with auth alone.
  test('logout ignores an argument passed by an onClick callsite', async () => {
    await renderSignedIn();

    await act(async () => {
      await ctx.logout({ type: 'click', preventDefault: () => {} });
    });

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(expect.objectContaining({ __tag: 'auth' }));
    expect(signOut.mock.calls[0]).toHaveLength(1);
  });

  test('the signed-out auth state clears currentUser and the stored email', async () => {
    await renderSignedIn();
    expect(screen.getByTestId('uid')).toHaveTextContent('user-1');
    expect(localStorage.getItem('dayguide_user_email')).toBe('real@example.com');

    // Firebase reports the post-signOut state.
    await fireAuthState(null);

    expect(screen.getByTestId('uid')).toHaveTextContent('none');
    expect(localStorage.getItem('dayguide_user_email')).toBeNull();
  });

  test('signing out does not re-read user prefs for the departed user', async () => {
    await renderSignedIn();
    expect(getDoc).toHaveBeenCalledTimes(1);

    await fireAuthState(null);

    // No Firestore read is attempted once there is no uid to read for.
    expect(getDoc).toHaveBeenCalledTimes(1);
  });

  test('the provider keeps rendering children after sign-out rather than reverting to the loading gate', async () => {
    await renderSignedIn();

    await fireAuthState(null);

    // `loading` stays false, so children render and the app can show Login
    // instead of an indefinitely blank screen.
    expect(screen.getByTestId('uid')).toBeInTheDocument();
    expect(ctx.logout).toEqual(expect.any(Function));
    expect(ctx.signInAsGuest).toEqual(expect.any(Function));
  });
});
