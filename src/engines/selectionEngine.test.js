import { createSwipeSelection } from './selectionEngine';

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
