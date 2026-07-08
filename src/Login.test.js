import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

// Auth methods are shared jest.fns the tests can drive per-case.
const mockSignInWithGoogle = jest.fn();
const mockSignInWithEmail = jest.fn();
const mockSignUpWithEmail = jest.fn();
const mockSignInAsGuest = jest.fn();

jest.mock('./AuthContext', () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    signInWithEmail: mockSignInWithEmail,
    signUpWithEmail: mockSignUpWithEmail,
    signInAsGuest: mockSignInAsGuest,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Login — guest / demo sign-in (Packet 121)', () => {
  test('renders the guest sign-in button', () => {
    render(<Login />);
    expect(
      screen.getByRole('button', { name: 'login.guestSignIn' }),
    ).toBeInTheDocument();
  });

  test('existing sign-in options still render alongside the guest button', () => {
    render(<Login />);
    // Google + email tabs + submit remain intact.
    expect(
      screen.getByRole('button', { name: /login\.googleSignIn/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'login.createAccount' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'login.guestSignIn' }),
    ).toBeInTheDocument();
  });

  test('clicking the guest button calls the anonymous sign-in path', async () => {
    mockSignInAsGuest.mockResolvedValueOnce({ user: { uid: 'guest-1', email: null } });
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: 'login.guestSignIn' }));

    await waitFor(() => expect(mockSignInAsGuest).toHaveBeenCalledTimes(1));
    // Other auth paths are untouched.
    expect(mockSignInWithGoogle).not.toHaveBeenCalled();
    expect(mockSignInWithEmail).not.toHaveBeenCalled();
  });

  test('successful guest sign-in shows no error (proceeds into authenticated flow)', async () => {
    mockSignInAsGuest.mockResolvedValueOnce({ user: { uid: 'guest-1', email: null } });
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: 'login.guestSignIn' }));

    await waitFor(() => expect(mockSignInAsGuest).toHaveBeenCalled());
    // Navigation is handled by AuthProvider's auth-state listener; the Login
    // component's only job on success is to surface no error.
    expect(screen.queryByText('login.errors.guestFailed')).not.toBeInTheDocument();
  });

  test('failed guest sign-in displays an error and does not crash', async () => {
    mockSignInAsGuest.mockRejectedValueOnce(new Error('network-request-failed'));
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: 'login.guestSignIn' }));

    expect(
      await screen.findByText('login.errors.guestFailed'),
    ).toBeInTheDocument();
  });
});
