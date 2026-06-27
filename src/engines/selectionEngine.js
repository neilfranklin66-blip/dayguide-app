export const createSwipeSelection = ({
  liked,
  currentItem,
  selectedItems = [],
}) =>
  liked && currentItem
    ? [...selectedItems, currentItem]
    : selectedItems;
