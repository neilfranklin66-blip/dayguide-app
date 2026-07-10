import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from './App';
import { signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';

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

// Stub the authenticated app so the test asserts the Login <-> DayGuide swap
// without mounting DayGuide's real (geo/API-dependent) subtree. The stub reads
// the real auth context and wires its logout button the same way the real
// header does (await inside a try/catch), so the context -> signOut path is
// exercised end-to-end while the heavy subtree stays out of the way.
jest.mock('./DayGuide', () => {
  const React = require('react');
  const { useAuth } = require('./AuthContext');
  return function DayGuideStub() {
    const { logout } = useAuth();
    const [logoutError, setLogoutError] = React.useState(null);
    const handleLogout = async () => {
      setLogoutError(null);
      try {
        await logout();
      } catch {
        setLogoutError('header.logoutFailed');
      }
    };
    return (
      <div data-testid="dayguide-stub">
        DayGuide
        <button onClick={handleLogout}>header.logout</button>
        {logoutError && <p role="alert">{logoutError}</p>}
      </div>
    );
  };
});

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
  signOut.mockResolvedValue(undefined);
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

describe('App — logout end-to-end (Packet 124)', () => {
  // Puts the app in the authenticated state a logged-in user sees.
  async function signIn(user = { uid: 'user-1', email: 'real@example.com' }) {
    render(<App />);
    await fireAuthState(user);
    expect(screen.getByTestId('dayguide-stub')).toBeInTheDocument();
  }

  const clickLogout = () =>
    fireEvent.click(screen.getByRole('button', { name: 'header.logout' }));

  test('clicking logout calls Firebase signOut with auth', async () => {
    await signIn();

    clickLogout();

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(signOut).toHaveBeenCalledWith(expect.objectContaining({ __tag: 'auth' }));
  });

  test('a guest user can log out through the same path', async () => {
    await signIn({ uid: 'guest-1', email: null });

    clickLogout();

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(signOut).toHaveBeenCalledWith(expect.objectContaining({ __tag: 'auth' }));
  });

  test('the app stays in the authenticated view until Firebase reports signed out', async () => {
    await signIn();

    clickLogout();
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));

    // signOut has been requested but the auth-state listener has not fired yet;
    // the app must not blank out or half-render Login in the meantime.
    expect(screen.getByTestId('dayguide-stub')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'login.guestSignIn' }),
    ).not.toBeInTheDocument();
  });

  test('when auth state becomes signed out the app returns to the Login screen', async () => {
    await signIn();

    clickLogout();
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));

    // Firebase then reports the signed-out state.
    await fireAuthState(null);

    expect(screen.getByRole('button', { name: 'login.guestSignIn' })).toBeInTheDocument();
    expect(screen.queryByTestId('dayguide-stub')).not.toBeInTheDocument();
    expect(localStorage.getItem('dayguide_user_email')).toBeNull();
  });

  // The clearest evidence the app is not stuck: the Login screen it returns to
  // is fully interactive, not a disabled or in-progress shell.
  test('the Login screen after logout is interactive and can sign in again', async () => {
    await signIn();

    clickLogout();
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    await fireAuthState(null);

    const guestButton = screen.getByRole('button', { name: 'login.guestSignIn' });
    expect(guestButton).toBeEnabled();

    // A second sign-in works, so no stale in-progress state survived logout.
    fireEvent.click(guestButton);
    await waitFor(() => expect(signInAnonymously).toHaveBeenCalledTimes(1));

    await fireAuthState({ uid: 'guest-1', email: null });

    expect(screen.getByTestId('dayguide-stub')).toBeInTheDocument();
  });
});

describe('App — logout failure end-to-end (Packet 125)', () => {
  const networkFailure = () => Object.assign(new Error('network'), {
    code: 'auth/network-request-failed',
  });

  async function signIn(user = { uid: 'user-1', email: 'real@example.com' }) {
    render(<App />);
    await fireAuthState(user);
  }

  const clickLogout = () =>
    act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'header.logout' }));
    });

  test('a failed signOut keeps the user in the authenticated app', async () => {
    signOut.mockRejectedValue(networkFailure());
    await signIn();

    await clickLogout();

    // No auth-state change arrives, so the session survives and Login stays away.
    expect(screen.getByTestId('dayguide-stub')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'login.guestSignIn' }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem('dayguide_user_email')).toBe('real@example.com');
    expect(screen.getByRole('alert')).toHaveTextContent('header.logoutFailed');
  });

  test('the user can retry after a failed logout and reach the Login screen', async () => {
    signOut.mockRejectedValueOnce(networkFailure()).mockResolvedValueOnce(undefined);
    await signIn();

    await clickLogout();
    expect(screen.getByTestId('dayguide-stub')).toBeInTheDocument();

    // The button is still live, so a second attempt goes through.
    await clickLogout();
    expect(signOut).toHaveBeenCalledTimes(2);

    await fireAuthState(null);

    expect(screen.getByRole('button', { name: 'login.guestSignIn' })).toBeInTheDocument();
    expect(screen.queryByTestId('dayguide-stub')).not.toBeInTheDocument();
    expect(localStorage.getItem('dayguide_user_email')).toBeNull();
  });
});
