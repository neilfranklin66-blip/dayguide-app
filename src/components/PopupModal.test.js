import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PopupModal from './PopupModal';

test('nearby restaurant skip uses the dedicated skip handler', () => {
  const activePopup = {
    type: 'nearbyRestaurant',
    restaurant: {
      place_id: 'live-1',
      id: 'live-1',
      name: 'Test Live Bistro',
      cuisine: [],
      distance: 0.2,
    },
  };
  const onClose = jest.fn();
  const onYes = jest.fn();
  const onSkip = jest.fn();
  const t = key => key;

  render(
    <PopupModal
      activePopup={activePopup}
      onClose={onClose}
      onYes={onYes}
      onSkip={onSkip}
      t={t}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'popups.nearbyRestaurant.skip' }));

  expect(onSkip).toHaveBeenCalledWith(activePopup);
  expect(onClose).not.toHaveBeenCalled();
  expect(onYes).not.toHaveBeenCalled();
});
