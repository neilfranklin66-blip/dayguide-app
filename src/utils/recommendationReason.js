/**
 * recommendationReason
 * - Builds a concise assistant-style "Why this fits" line for a place/restaurant card.
 * - Pure function over data already on the PlaceCard plus the user's planning context
 *   (selected cuisines, selected budget, children in party).
 * - Keeps wording short and practical; always returns a non-empty string via fallback.
 */

const HIGH_RATING_THRESHOLD = 4.5;
const GOOD_RATING_THRESHOLD = 4.0;
const SHORT_WALK_MINUTES = 15;
const NEARBY_KM = 2;
const MAX_FRAGMENTS = 2;

const FALLBACK_REASON = 'A well-regarded option near you';

/** 'middleEastern' -> 'Middle Eastern' */
function formatCuisineLabel(cuisineId) {
  if (typeof cuisineId !== 'string' || cuisineId.length === 0) return null;
  const spaced = cuisineId.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function findCuisineMatch(cardCuisines, selectedCuisines) {
  if (!Array.isArray(cardCuisines) || !Array.isArray(selectedCuisines)) return null;
  return cardCuisines.find(c => selectedCuisines.includes(c)) ?? null;
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Build a short "Why this fits" reason string for a card.
 *
 * @param {object} card - PlaceCard-shaped object (cuisine, rating, priceRange,
 *   walkingTimeMinutes, distanceKm, metadata.isFamilyFriendly).
 * @param {object} context - { selectedCuisines, selectedPriceRange, hasChildren }
 * @returns {string} concise reason, e.g. "Matches your Italian pick - fits your $$ budget"
 */
export function buildRecommendationReason(card, context = {}) {
  if (!card || typeof card !== 'object') return FALLBACK_REASON;

  const { selectedCuisines, selectedPriceRange, hasChildren } = context;
  const fragments = [];

  // Priority 1: the user's own cuisine choice is the strongest personal signal.
  const cuisineMatch = findCuisineMatch(card.cuisine, selectedCuisines);
  if (cuisineMatch) {
    fragments.push(`matches your ${formatCuisineLabel(cuisineMatch)} pick`);
  }

  // Priority 2: budget alignment with the selected price range.
  if (selectedPriceRange && card.priceRange === selectedPriceRange) {
    fragments.push(`fits your ${card.priceRange} budget`);
  }

  // Priority 3: family fit, only when we actually know it and it matters.
  if (hasChildren === true && card.metadata?.isFamilyFriendly === true) {
    fragments.push('good with children');
  }

  // Priority 4: rating strength.
  if (typeof card.rating === 'number' && fragments.length < MAX_FRAGMENTS) {
    if (card.rating >= HIGH_RATING_THRESHOLD) {
      fragments.push(`highly rated at ${card.rating} stars`);
    } else if (card.rating >= GOOD_RATING_THRESHOLD) {
      fragments.push(`well rated at ${card.rating} stars`);
    }
  }

  // Priority 5: closeness - walking time first, distance as backup.
  if (fragments.length < MAX_FRAGMENTS) {
    if (typeof card.walkingTimeMinutes === 'number' && card.walkingTimeMinutes <= SHORT_WALK_MINUTES) {
      fragments.push(`just a ${card.walkingTimeMinutes}-min walk away`);
    } else if (typeof card.distanceKm === 'number' && card.distanceKm <= NEARBY_KM) {
      fragments.push(`only ${card.distanceKm} km from you`);
    }
  }

  if (fragments.length === 0) return FALLBACK_REASON;

  return capitalizeFirst(fragments.slice(0, MAX_FRAGMENTS).join(' - '));
}

const recommendationReason = {
  buildRecommendationReason,
};

export default recommendationReason;
