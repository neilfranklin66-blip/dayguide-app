import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PopupModal from './PopupModal';

const makeNearbyRestaurantPopup = () => ({
  type: 'nearbyRestaurant',
  restaurant: {
    place_id: 'live-1',
    id: 'live-1',
    name: 'Test Live Bistro',
    cuisine: [],
    distance: 0.2,
  },
});

const renderNearbyPopup = () => {
  const activePopup = makeNearbyRestaurantPopup();
  const onClose = jest.fn();
  const onYes = jest.fn();
  const onSkip = jest.fn();
  const t = key => key;

  const result = render(
    <PopupModal
      activePopup={activePopup}
      onClose={onClose}
      onYes={onYes}
      onSkip={onSkip}
      t={t}
    />
  );

  return {
    ...result,
    activePopup,
    onClose,
    onYes,
    onSkip,
  };
};

test('nearby restaurant skip uses the dedicated skip handler', () => {
  const { activePopup, onClose, onYes, onSkip } = renderNearbyPopup();

  fireEvent.click(screen.getByRole('button', { name: 'popups.nearbyRestaurant.skip' }));

  expect(onSkip).toHaveBeenCalledWith(activePopup);
  expect(onClose).not.toHaveBeenCalled();
  expect(onYes).not.toHaveBeenCalled();
});

test('nearby restaurant no closes with the popup context', () => {
  const { activePopup, onClose, onYes, onSkip } = renderNearbyPopup();

  fireEvent.click(screen.getByRole('button', { name: 'popups.nearbyRestaurant.no' }));

  expect(onClose).toHaveBeenCalledWith(activePopup);
  expect(onYes).not.toHaveBeenCalled();
  expect(onSkip).not.toHaveBeenCalled();
});

test('nearby restaurant close button closes with the popup context', () => {
  const { activePopup, onClose, onYes, onSkip } = renderNearbyPopup();

  fireEvent.click(screen.getByRole('button', { name: 'Close' }));

  expect(onClose).toHaveBeenCalledWith(activePopup);
  expect(onYes).not.toHaveBeenCalled();
  expect(onSkip).not.toHaveBeenCalled();
});

test('nearby restaurant overlay closes with the popup context', () => {
  const { activePopup, container, onClose, onYes, onSkip } = renderNearbyPopup();

  fireEvent.click(container.querySelector('.popup-overlay'));

  expect(onClose).toHaveBeenCalledWith(activePopup);
  expect(onYes).not.toHaveBeenCalled();
  expect(onSkip).not.toHaveBeenCalled();
});
