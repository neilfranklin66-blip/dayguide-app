import { render, screen } from '@testing-library/react';
import LocationStage from './LocationStage';

const t = (key) => key;

test('renders location loading copy', () => {
  render(<LocationStage t={t} />);

  expect(screen.getByText('welcome.findingLocation')).toBeInTheDocument();
  expect(screen.getByText('welcome.gettingCoordinates')).toBeInTheDocument();
});
