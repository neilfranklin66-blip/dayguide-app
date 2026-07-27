import { fireEvent, render, screen } from '@testing-library/react';
import WalkingPreferenceSelector from './WalkingPreferenceSelector';
import {
  DEFAULT_TRAVEL_PREFERENCES,
  WALKING_PACE,
} from '../utils/travelPreferences';

const t = (key, options) =>
  options?.defaultValue ?? (typeof options === 'string' ? options : key);

test('shows typical pace and 45 minutes as the user-controlled defaults', () => {
  render(
    <WalkingPreferenceSelector
      preferences={DEFAULT_TRAVEL_PREFERENCES}
      onChange={() => {}}
      t={t}
    />,
  );

  expect(screen.getByLabelText('Walking pace')).toHaveValue(
    WALKING_PACE.TYPICAL,
  );
  expect(
    screen.getByLabelText('Longest walk DayGuide should normally plan'),
  ).toHaveValue('45');
});

test('reports pace and maximum-walk changes without inferring personal characteristics', () => {
  const onChange = jest.fn();
  render(
    <WalkingPreferenceSelector
      preferences={DEFAULT_TRAVEL_PREFERENCES}
      onChange={onChange}
      t={t}
    />,
  );

  fireEvent.change(screen.getByLabelText('Walking pace'), {
    target: { value: WALKING_PACE.RELAXED },
  });
  fireEvent.change(
    screen.getByLabelText('Longest walk DayGuide should normally plan'),
    { target: { value: '60' } },
  );

  expect(onChange).toHaveBeenNthCalledWith(1, {
    walkingPace: WALKING_PACE.RELAXED,
  });
  expect(onChange).toHaveBeenNthCalledWith(2, {
    maximumWalkingMinutes: 60,
  });
  expect(
    screen.getByText(
      'You control this preference. DayGuide does not infer it from age or weight.',
    ),
  ).toBeInTheDocument();
});
