import { render, screen, fireEvent } from '@testing-library/react';
import DayGuide from './DayGuide';
import useGeolocation from './useGeolocation';

jest.mock('./useGeolocation');

jest.mock('./AuthContext', () => ({
  useAuth: () => ({
    currentUser: { email: 'test@example.com' },
    logout: jest.fn(),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

const loadingGeo = {
  position: null,
  error: null,
  isLoading: true,
  refresh: jest.fn(),
};

const resolvedGeo = {
  position: { lat: 51.50722, lng: -0.1275, accuracy: 12 },
  error: null,
  isLoading: false,
  refresh: jest.fn(),
};

const erroredGeo = {
  position: null,
  error: 'location.denied',
  isLoading: false,
  refresh: jest.fn(),
};

test('shows location loading copy when planning starts while geolocation is loading', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(screen.getByText('welcome.findingLocation')).toBeInTheDocument();
});

test('advances to interests when geolocation finishes loading', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  const { rerender } = render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  expect(screen.getByText('welcome.findingLocation')).toBeInTheDocument();

  useGeolocation.mockReturnValue(resolvedGeo);
  rerender(<DayGuide />);

  expect(screen.getByText('interests.title')).toBeInTheDocument();
  expect(screen.queryByText('welcome.findingLocation')).not.toBeInTheDocument();
});

test('advances to interests when loading ends with a geolocation error', () => {
  useGeolocation.mockReturnValue(loadingGeo);
  const { rerender } = render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));
  expect(screen.getByText('welcome.findingLocation')).toBeInTheDocument();

  useGeolocation.mockReturnValue(erroredGeo);
  rerender(<DayGuide />);

  expect(screen.getByText('interests.title')).toBeInTheDocument();
});

test('skips the location stage when geolocation is already resolved', () => {
  useGeolocation.mockReturnValue(resolvedGeo);
  render(<DayGuide />);

  fireEvent.click(screen.getByText('welcome.startPlanning'));

  expect(screen.getByText('interests.title')).toBeInTheDocument();
  expect(screen.queryByText('welcome.findingLocation')).not.toBeInTheDocument();
});
