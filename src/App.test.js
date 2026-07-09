import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from './App';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Real AuthProvider + Login are exercised; only the external Firebase SDK and
// the heavy DayGuide subtree are stubbed so the test can focus on the
// logged-out -> "Continue as guest" -> authenticated-app transition.
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

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

// Stub the authenticated app so the test asserts the Login -> DayGuide swap
// without mounting DayGuide's real (geo/API-dependent) subtree.
jest.mock('./DayGuide', () => () => <div data-testid="dayguide-stub">DayGuide</div>);

// Captures the Firebase auth-state listener so the test can deliver sign-in
// transitions exactly as the real SDK would.
let authStateCallback;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  authStateCallback = undefined;
  onAuthStateChanged.mockImplementation((authArg, cb) => {
    authStateCallback = cb;
    return jest.fn(); // unsubscribe
  });
  signInAnonymously.mockResolvedValue({ user: { uid: 'guest-1', email: null } });
});

async function fireAuthState(user) {
  await act(async () => {
    authStateCallback(user);
  });
}

test('App component is defined', () => {
  expect(App).toBeDefined();
});

describe('App — guest sign-in end-to-end (Packet 123)', () => {
  test('logged-out user sees the Login screen with an available guest button', async () => {
    render(<App />);
    // Firebase reports "signed out" on init -> Login renders.
    await fireAuthState(null);

    const guestButton = screen.getByRole('button', { name: 'login.guestSignIn' });
    expect(guestButton).toBeInTheDocument();
    expect(guestButton).toBeEnabled();
    // Not yet in the authenticated app.
    expect(screen.queryByTestId('dayguide-stub')).not.toBeInTheDocument();
  });

  test('clicking Continue as guest signs in anonymously and enters DayGuide', async () => {
    render(<App />);
    await fireAuthState(null);

    fireEvent.click(screen.getByRole('button', { name: 'login.guestSignIn' }));

    // Button flips to the in-progress label while the anonymous sign-in runs.
    const pendingButton = await screen.findByRole('button', {
      name: 'login.guestSigningIn',
    });
    expect(pendingButton).toBeDisabled();
    await waitFor(() => expect(signInAnonymously).toHaveBeenCalledTimes(1));

    // Firebase then reports the anonymous user -> App swaps Login for DayGuide.
    await fireAuthState({ uid: 'guest-1', email: null });

    expect(screen.getByTestId('dayguide-stub')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'login.guestSignIn' }),
    ).not.toBeInTheDocument();
  });
});
