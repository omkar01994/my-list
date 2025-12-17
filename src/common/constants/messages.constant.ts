// Standardized error messages for consistent API responses
export const ERROR_MESSAGES = {
  MOVIE_NOT_FOUND: 'Movie not found',
  TV_SHOW_NOT_FOUND: 'TV Show not found',
  ITEM_ALREADY_EXISTS: 'Item already in your list',
  ITEM_NOT_FOUND: 'Item not found in your list',
} as const;

// Standardized success messages for consistent API responses
export const SUCCESS_MESSAGES = {
  ITEM_REMOVED: 'Item removed from list',
  ITEM_ADDED: 'Item added to list successfully',
} as const;