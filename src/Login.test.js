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

  test('guest button shows the signing-in label while sign-in is pending', async () => {
    // Keep the promise pending so the loading state stays visible.
    let resolveGuest;
    mockSignInAsGuest.mockReturnValueOnce(
      new Promise((resolve) => { resolveGuest = resolve; }),
    );
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: 'login.guestSignIn' }));

    // The label flips to the in-progress copy and the original is gone.
    expect(
      await screen.findByRole('button', { name: 'login.guestSigningIn' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'login.guestSignIn' }),
    ).not.toBeInTheDocument();

    resolveGuest({ user: { uid: 'guest-1', email: null } });
    await waitFor(() => expect(mockSignInAsGuest).toHaveBeenCalledTimes(1));
  });

  test('guest button is re-enabled after a failed sign-in (not left blocked)', async () => {
    mockSignInAsGuest.mockRejectedValueOnce(new Error('network-request-failed'));
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: 'login.guestSignIn' }));

    // Once the failure surfaces, the button returns to its normal label and is
    // interactive again — guarding against the "stuck / blocked" regression.
    await screen.findByText('login.errors.guestFailed');
    const guestButton = screen.getByRole('button', { name: 'login.guestSignIn' });
    expect(guestButton).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'login.guestSigningIn' }),
    ).not.toBeInTheDocument();

    // And it can be used again: a second attempt re-invokes the sign-in path.
    mockSignInAsGuest.mockResolvedValueOnce({ user: { uid: 'guest-1', email: null } });
    fireEvent.click(guestButton);
    await waitFor(() => expect(mockSignInAsGuest).toHaveBeenCalledTimes(2));
  });

  test('duplicate guest clicks are ignored while sign-in is pending', async () => {
    let resolveGuest;
    mockSignInAsGuest.mockReturnValueOnce(
      new Promise((resolve) => { resolveGuest = resolve; }),
    );
    render(<Login />);

    const guestButton = screen.getByRole('button', { name: 'login.guestSignIn' });
    fireEvent.click(guestButton);

    // Button is disabled while pending; further clicks must not re-invoke.
    const pendingButton = await screen.findByRole('button', {
      name: 'login.guestSigningIn',
    });
    expect(pendingButton).toBeDisabled();
    fireEvent.click(pendingButton);
    fireEvent.click(pendingButton);

    resolveGuest({ user: { uid: 'guest-1', email: null } });
    await waitFor(() => expect(mockSignInAsGuest).toHaveBeenCalledTimes(1));
  });
});
