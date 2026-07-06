export const createSwipeSelection = ({
  liked,
  currentItem,
  selectedItems = [],
}) =>
  liked && currentItem
    ? [...selectedItems, currentItem]
    : selectedItems;

export const toggleIdSelection = (selectedIds = [], id) =>
  selectedIds.includes(id)
    ? selectedIds.filter(x => x !== id)
    : [...selectedIds, id];
