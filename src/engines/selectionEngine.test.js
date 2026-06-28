import { createSwipeSelection, toggleIdSelection } from './selectionEngine';

test('createSwipeSelection appends the current item when liked', () => {
  const selectedItems = [{ id: 'existing' }];
  const currentItem = { id: 'new' };

  expect(createSwipeSelection({
    liked: true,
    currentItem,
    selectedItems,
  })).toEqual([
    { id: 'existing' },
    { id: 'new' },
  ]);
});

test('createSwipeSelection returns the original selection when not liked', () => {
  const selectedItems = [{ id: 'existing' }];
  const currentItem = { id: 'new' };

  expect(createSwipeSelection({
    liked: false,
    currentItem,
    selectedItems,
  })).toBe(selectedItems);
});

test('createSwipeSelection returns the original selection when there is no current item', () => {
  const selectedItems = [{ id: 'existing' }];

  expect(createSwipeSelection({
    liked: true,
    currentItem: undefined,
    selectedItems,
  })).toBe(selectedItems);
});

test('toggleIdSelection adds an id when it is not selected', () => {
  expect(toggleIdSelection(['museums'], 'parks')).toEqual(['museums', 'parks']);
});

test('toggleIdSelection removes an id when it is already selected', () => {
  expect(toggleIdSelection(['museums', 'parks'], 'museums')).toEqual(['parks']);
});
