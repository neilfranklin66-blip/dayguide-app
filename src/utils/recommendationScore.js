/**
 * recommendationScore
 * - Scores and ranks place/restaurant cards against the user's planning context
 *   (selected cuisines, selected budget, children in party).
 * - Pure functions over data already on the PlaceCard; no fetching, no side effects.
 * - Simple additive points per signal so weights stay easy to read and adjust.
 * - Thresholds mirror recommendationReason.js so scoring and "Why this fits"
 *   wording agree on what counts as highly rated / nearby.
 */

const HIGH_RATING_THRESHOLD = 4.5;
const GOOD_RATING_THRESHOLD = 4.0;
const SHORT_WALK_MINUTES = 15;
const NEARBY_KM = 2;

const POINTS = {
  cuisineMatch: 30, // the user's own cuisine pick is the strongest personal signal
  priceMatch: 20,
  highRating: 15,
  goodRating: 8,
  nearby: 10,
  familyFriendly: 12, // only counts when children are in the party
};

function hasCuisineMatch(cardCuisines, selectedCuisines) {
  if (!Array.isArray(cardCuisines) || !Array.isArray(selectedCuisines)) return false;
  return cardCuisines.some(c => selectedCuisines.includes(c));
}

function isNearby(card) {
  if (typeof card.walkingTimeMinutes === 'number' && card.walkingTimeMinutes <= SHORT_WALK_MINUTES) return true;
  if (typeof card.distanceKm === 'number' && card.distanceKm <= NEARBY_KM) return true;
  return false;
}

/**
 * Score a card for how well it fits the user's current planning context.
 * Higher is better; an empty or invalid card scores 0.
 *
 * @param {object} card - PlaceCard-shaped object (cuisine, rating, priceRange,
 *   walkingTimeMinutes, distanceKm, metadata.isFamilyFriendly).
 * @param {object} context - { selectedCuisines, selectedPriceRange, hasChildren }
 * @returns {number} additive fit score
 */
export function scoreRecommendation(card, context = {}) {
  if (!card || typeof card !== 'object') return 0;

  const { selectedCuisines, selectedPriceRange, hasChildren } = context;
  let score = 0;

  if (hasCuisineMatch(card.cuisine, selectedCuisines)) {
    score += POINTS.cuisineMatch;
  }

  if (selectedPriceRange && card.priceRange === selectedPriceRange) {
    score += POINTS.priceMatch;
  }

  if (typeof card.rating === 'number') {
    if (card.rating >= HIGH_RATING_THRESHOLD) {
      score += POINTS.highRating;
    } else if (card.rating >= GOOD_RATING_THRESHOLD) {
      score += POINTS.goodRating;
    }
  }

  if (isNearby(card)) {
    score += POINTS.nearby;
  }

  if (hasChildren === true && card.metadata?.isFamilyFriendly === true) {
    score += POINTS.familyFriendly;
  }

  return score;
}

/**
 * Return a new array of cards ordered best-fit first.
 * Ties keep their incoming order, so any upstream variety (e.g. shuffle) is preserved.
 *
 * @param {Array<object>} cards - PlaceCard-shaped objects
 * @param {object} context - { selectedCuisines, selectedPriceRange, hasChildren }
 * @returns {Array<object>} new sorted array; input is not mutated
 */
export function rankRecommendations(cards, context = {}) {
  if (!Array.isArray(cards)) return [];
  return [...cards].sort(
    (a, b) => scoreRecommendation(b, context) - scoreRecommendation(a, context)
  );
}

const recommendationScore = {
  scoreRecommendation,
  rankRecommendations,
};

export default recommendationScore;
