import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import useGeolocation from './useGeolocation';
import mockRestaurantData from './mockRestaurantData.json';
import mockActivityData from './mockActivityData.json';
import { searchRestaurants } from './api/placesApi';
import { mapFromMockArray, mapFromPlacesArray } from './adapters/placeCardAdapter';
import {
  buildRestaurantQueue as buildFilteredRestaurantQueue,
  excludeAlreadySelected,
  getActivitiesForInterests as getFilteredActivitiesForInterests,
} from './engines/filterEngine';
import { selectTransportOptions } from './engines/transportEngine';
import { getRestaurantSourceFromError } from './engines/restaurantEngine';
import { createSwipeSelection, toggleIdSelection } from './engines/selectionEngine';
import {
  getInitialSelectionRoute,
  getRouteAfterActivities,
  getRouteAfterRestaurants,
} from './engines/itineraryRouteEngine';
import {
  buildTimelineEntries,
  calculateTimelineDuration,
  getTimelineCategoryLabel,
  updateTimelineItemDuration,
} from './engines/timelineEngine';
import {
  getPopupYesAction,
  getTimelinePopupSuggestion,
} from './engines/popupEngine';
import TimelineShareQRModal from './components/TimelineShareQRModal';
import PopupModal from './components/PopupModal';
import { buildRecommendationReason } from './utils/recommendationReason';
import { buildDayNarrative } from './utils/dayNarrative';
import { rankRecommendations } from './utils/recommendationScore';
import {
  CUISINE_EMOJI,
  getCuisineEmoji,
  ACTIVITY_CATEGORIES,
  SOURCE_BANNER_KEY,
  TRANSPORT_OPTIONS,
  PRICE_OPTIONS,
  INTEREST_CATEGORY_OPTIONS,
} from './config/dayGuideOptions';
import './DayGuide.css';

const DayGuide = () => {
  const { currentUser, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { position, error: locationError, isLoading: locationLoading, refresh: refreshLocation } = useGeolocation();

  const [stage, setStage] = useState('welcome');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [availableTime, setAvailableTime] = useState(4);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasChildren, setHasChildren] = useState(null);
  const [startWith, setStartWith] = useState('activities');
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
      return now.getHours() + now.getMinutes() / 60;
  });
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [activityQueue, setActivityQueue] = useState([]);
  const [restaurantQueue, setRestaurantQueue] = useState(null);
  const [timeline, setTimeline] = useState([]);

  // Popup state
  const [activePopup, setActivePopup] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const popupCooldowns = useRef({});
    const activePopupRef = useRef(null);
  const popupActivityReturnRef = useRef(false);

  // Mirror of selectedRestaurants in a ref so goToRestaurants/buildRestaurantQueue
  // always read the current list regardless of closure capture timing.
  const selectedRestaurantsRef = useRef([]);

  // Restaurant API state
  const [isRestaurantsLoading, setIsRestaurantsLoading] = useState(false);
  const [restaurantSource, setRestaurantSource] = useState(null);
  const [nearestHint, setNearestHint] = useState(null);

  const interestCategories = INTEREST_CATEGORY_OPTIONS.map(({ id, icon }) => ({
    id,
    label: t(`interests.${id}`),
    icon,
  }));

  const cuisineCategories = Object.entries(CUISINE_EMOJI).map(([id, icon]) => ({ id, icon }));

  // --- Popup helpers ---

  const dismissPopup = () => {
    activePopupRef.current = null;
    setActivePopup(null);
  };

  const showPopup = (type, data = {}) => {
    const popup = { type, ...data };
    popupCooldowns.current[type] = Date.now();
    activePopupRef.current = popup;
    setActivePopup(popup);
  };

  const canShowPopup = (type) => {
    const last = popupCooldowns.current[type];
    return !last || Date.now() - last > 7200000;
  };

  // Popup triggers: fire once after entering timeline with a populated plan
  useEffect(() => {
    if (stage !== 'timeline' || timeline.length === 0) return;

    const timer = setTimeout(() => {
      if (activePopupRef.current) return;

      const popup = getTimelinePopupSuggestion({
        restaurants: mockRestaurantData,
        timeline,
        activityCategories: ACTIVITY_CATEGORIES,
        canShowPopup,
      });

      if (popup) {
        const { type, ...data } = popup;
        showPopup(type, data);
      }
    }, 1500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timeline]);

  // --- Navigation ---

  const handleStartPlanning = () => {
    setStage(locationLoading ? 'location' : 'interests');
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('dayguide_language', lang);
  };

  const resetState = () => {
    setSelectedInterests([]);
    setSelectedCuisines([]);
    setSelectedPriceRange(null);
    setSelectedActivities([]);
    setSelectedRestaurants([]);
    selectedRestaurantsRef.current = [];
    setHasChildren(null);
    setAvailableTime(4);
    setStartWith('activities');
    const now = new Date();
    setStartTime(now.getHours() + now.getMinutes() / 60);
    setCurrentActivityIndex(0);
    setCurrentRestaurantIndex(0);
    setActivityQueue([]);
    setRestaurantQueue(null);
    setTimeline([]);
    setActivePopup(null);
    activePopupRef.current = null;
    popupActivityReturnRef.current = false;
    setShowQR(false);
    setIsRestaurantsLoading(false);
    setRestaurantSource(null);
    setNearestHint(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setStage('welcome');
  };

  const toggleInterest = (id) =>
    setSelectedInterests(prev => toggleIdSelection(prev, id));

  const toggleCuisine = (id) =>
    setSelectedCuisines(prev => toggleIdSelection(prev, id));

  const getActivitiesForInterests = (interests = selectedInterests) =>
    getFilteredActivitiesForInterests({
      activityData: mockActivityData,
      interests,
      selectedActivities,
    });

  const buildRestaurantQueue = (cuisines = selectedCuisines, price = selectedPriceRange) => {
    const normalized = mapFromMockArray(mockRestaurantData);
    const queue = buildFilteredRestaurantQueue({
      restaurants: normalized,
      cuisines,
      price,
      selectedRestaurants: selectedRestaurantsRef.current,
    });
    return rankRecommendations(queue, {
      selectedCuisines: cuisines,
      selectedPriceRange: price,
      hasChildren,
    });
  };

  const goToNextSelectionStage = () => {
    const route = getInitialSelectionRoute({ startWith });

    if (route === 'restaurants') {
      goToRestaurants();
    } else {
      goToActivities();
    }
  };

  const continueAfterRestaurants = (restaurants = selectedRestaurantsRef.current) => {
    const route = getRouteAfterRestaurants({ startWith });

    if (route === 'activities') {
      goToActivities();
    } else {
      buildTimeline(restaurants);
    }
  };

  const continueAfterActivities = (activities = selectedActivities) => {
    const route = getRouteAfterActivities({ startWith });

    if (route === 'timeline') {
      buildTimeline(selectedRestaurantsRef.current, activities);
    } else {
      setStage(route);
    }
  };

  const goToActivities = () => {
    const activities = getActivitiesForInterests();
    setActivityQueue(activities);
    setCurrentActivityIndex(0);
    setStage('activities');
  };

  const goToRestaurants = async (cuisineOverride = selectedCuisines, priceOverride = selectedPriceRange) => {
    setIsRestaurantsLoading(true);
    setRestaurantSource(null);
    setRestaurantQueue(null);
    setCurrentRestaurantIndex(0);
    setStage('restaurants');
    try {
      if (!position?.lat) throw new Error('NO_LOCATION');
      const results = await searchRestaurants(position.lat, position.lng, cuisineOverride, priceOverride);
      const placeCards = mapFromPlacesArray(results);
      const deduped = excludeAlreadySelected(placeCards, selectedRestaurantsRef.current);
      if (deduped.length > 0) {
        setRestaurantQueue(rankRecommendations(deduped, {
          selectedCuisines: cuisineOverride,
          selectedPriceRange: priceOverride,
          hasChildren,
        }));
        setRestaurantSource('live');
      } else {
        setRestaurantQueue(buildRestaurantQueue(cuisineOverride, priceOverride));
        setRestaurantSource('no_results');
      }
    } catch (err) {
      setRestaurantQueue(buildRestaurantQueue(cuisineOverride, priceOverride));
      setRestaurantSource(getRestaurantSourceFromError(err));
    } finally {
      setIsRestaurantsLoading(false);
    }
  };

  const swipeActivity = (liked) => {
    const currentActivity = activityQueue[currentActivityIndex];
    const newSelected = createSwipeSelection({
      liked,
      currentItem: currentActivity,
      selectedItems: selectedActivities,
    });

    if (liked && currentActivity) {
      setSelectedActivities(newSelected);
    }

    if (currentActivityIndex < activityQueue.length - 1) {
      setCurrentActivityIndex(i => i + 1);
    } else {
      if (popupActivityReturnRef.current) {
        popupActivityReturnRef.current = false;
        buildTimeline(selectedRestaurants, newSelected);
      } else {
        continueAfterActivities(newSelected);
      }
    }
  };

  const swipeRestaurant = (liked) => {
    const currentRestaurant = restaurantQueue[currentRestaurantIndex];
    const newSelected = createSwipeSelection({
      liked,
      currentItem: currentRestaurant,
      selectedItems: selectedRestaurants,
    });

    if (liked && currentRestaurant) {
      popupCooldowns.current.nearbyRestaurant = Date.now();
      selectedRestaurantsRef.current = newSelected;
      setSelectedRestaurants(newSelected);
    }

    if (currentRestaurantIndex < restaurantQueue.length - 1) {
      setCurrentRestaurantIndex(i => i + 1);
    } else {
      continueAfterRestaurants(newSelected);
    }
  };

  const buildTimeline = (restaurants = selectedRestaurants, activities = selectedActivities) => {
    const newTimeline = buildTimelineEntries({
      restaurants,
      activities,
      startTime,
      getCuisineEmoji,
      startWith,
    });

    setTimeline(newTimeline);
    setStage('timeline');
  };

  const updateActivityDuration = (index, newDuration) => {
    setTimeline(prev => updateTimelineItemDuration(prev, index, newDuration));
  };

  // --- Popup action handlers ---

  const handlePopupYes = (popup) => {
    dismissPopup();

    const action = getPopupYesAction(popup);

    if (action === 'restaurants') {
      goToRestaurants();
    } else if (action === 'activitiesThenTimeline') {
      popupActivityReturnRef.current = true;
      goToActivities();
    }
  };


  // --- Render helpers ---

  const renderStage = () => {
    if (stage === 'welcome') {
      return (
        <div className="dayguide-container welcome">
          <div className="welcome-card card">
            <h1>🗺️ DayGuide</h1>
            <p>{t('welcome.tagline')}</p>
            <p className="subtitle">{t('welcome.subtitle')}</p>
            <div className={`location-panel ${locationError ? 'location-panel--error' : ''}`}>
              {locationLoading && <p className="location-status">{t('welcome.detectingLocation')}</p>}
              {!locationLoading && locationError && (
                <p className="location-status location-status--error">⚠️ {t(locationError)}</p>
              )}
              {!locationLoading && position && (
                <p className="location-status">
                  📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                  <span className="location-accuracy"> ±{Math.round(position.accuracy)}m</span>
                </p>
              )}
              <button onClick={refreshLocation} className="btn-refresh">{t('welcome.refreshLocation')}</button>
            </div>
            <button onClick={handleStartPlanning} className="btn-primary">{t('welcome.startPlanning')}</button>
          </div>
        </div>
      );
    }

    if (stage === 'location') {
      if (!locationLoading) { setTimeout(() => setStage('interests'), 0); return null; }
      return (
        <div className="dayguide-container">
          <div className="loading">
            <h2>{t('welcome.findingLocation')}</h2>
            <p>{t('welcome.gettingCoordinates')}</p>
          </div>
        </div>
      );
    }

    if (stage === 'interests') {
      return (
        <div className="dayguide-container">
          <div className="card">
            <h2>{t('interests.title')}</h2>
            <p>{t('interests.subtitle')}</p>

            <h3 className="section-title">{t('interests.activitiesTitle')}</h3>
            <div className="interest-grid activities-grid">
              {interestCategories.map(interest => (
                <button
                  key={interest.id}
                  className={`interest-btn ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <span className="icon">{interest.icon}</span>
                  <span>{interest.label}</span>
                </button>
              ))}
            </div>

            <h3 className="section-title">{t('interests.cuisineTitle')}</h3>
            <div className="interest-grid cuisine-grid">
              {cuisineCategories.map(c => (
                <button
                  key={c.id}
                  className={`interest-btn ${selectedCuisines.includes(c.id) ? 'selected' : ''}`}
                  onClick={() => toggleCuisine(c.id)}
                >
                  <span className="icon">{c.icon}</span>
                  <span>{t(`cuisine.${c.id}`)}</span>
                </button>
              ))}
            </div>

            <h3 className="section-title">{t('interests.priceTitle')}</h3>
            <div className="price-options">
              {PRICE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`price-btn ${selectedPriceRange === opt.value ? 'selected' : ''}`}
                  onClick={() => setSelectedPriceRange(selectedPriceRange === opt.value ? null : opt.value)}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>

            <div className="time-selector">
              <label>{t('interests.timeLabel')}</label>
              <input type="range" min="1" max="8" value={availableTime}
                onChange={e => setAvailableTime(parseInt(e.target.value))} className="slider" />
              <span>{t('interests.hours', { count: availableTime })}</span>
            </div>
            <div className="time-selector">
              <label>{t('interests.dateLabel') || 'What date do you want to plan?'}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="date-input"
              />
            </div>
            <div className="time-selector">
              <label>{t('interests.startTimeLabel')}</label>
              <input type="time" value={`${String(Math.floor(startTime)).padStart(2, '0')}:${String(Math.round((startTime % 1) * 60)).padStart(2, '0')}`}
                onChange={e => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  setStartTime(hours + minutes / 60);
                }} className="time-input" />
            </div>

            
            <div className="time-selector">
              <label>Are there children in your party?</label>
              <div className="price-options">
                <button
                  className={`price-btn ${hasChildren === true ? 'selected' : ''}`}
                  onClick={() => setHasChildren(true)}
                >
                  Yes
                </button>
                <button
                  className={`price-btn ${hasChildren === false ? 'selected' : ''}`}
                  onClick={() => setHasChildren(false)}
                >
                  No
                </button>
              </div>
            </div>

            <div className="time-selector start-order-selector">
              <label>{t('interests.startWithTitle')}</label>
              <p className="start-order-hint">{t('interests.startWithHint')}</p>
              <div className="price-options start-order-options">
                <button
                  className={startWith === 'activities' ? 'price-btn start-order-btn selected' : 'price-btn start-order-btn'}
                  onClick={() => setStartWith('activities')}
                >
                  <span className="start-order-icon">🎭</span>
                  <span>{t('interests.startWithActivities')}</span>
                </button>
                <button
                  className={startWith === 'food_drinks' ? 'price-btn start-order-btn selected' : 'price-btn start-order-btn'}
                  onClick={() => setStartWith('food_drinks')}
                >
                  <span className="start-order-icon">🍽️</span>
                  <span>{t('interests.startWithFoodDrinks')}</span>
                </button>
              </div>
            </div>

            <button
              onClick={goToNextSelectionStage}
              disabled={selectedInterests.length === 0 || hasChildren === null}
              className="btn-primary"
            >
              {t('interests.next')}
            </button>
          </div>
        </div>
      );
    }

    if (stage === 'activities') {
      const currentActivity = activityQueue[currentActivityIndex];

      if (activityQueue.length === 0) {
        return (
          <div className="dayguide-container">
            <div className="card no-results-card">
              <div className="no-results-icon">🎭</div>
              <h2>{t('activities.noResultsTitle')}</h2>
              <p className="no-results-msg">{t('activities.noResults')}</p>
              <div className="no-results-actions">
                {selectedInterests.length > 0 && (
                  <button onClick={() => goToActivities([])} className="btn-primary">
                    {t('activities.showAll')}
                  </button>
                )}
                <button onClick={() => setStage('interests')} className="btn-secondary">
                  ← {t('interests.title')}
                </button>
              </div>
            </div>
          </div>
        );
      }

      if (!currentActivity) {
        return (
          <div className="dayguide-container">
            <div className="card">
              <h2>{t('activities.noMore')}</h2>
              <button onClick={() => continueAfterActivities()} className="btn-primary">
                {t('interests.next')}
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="dayguide-container">
          <div className="card swipe-card">
            <h2>{t('activities.title')}</h2>
            <p className="swipe-progress">{currentActivityIndex + 1} / {activityQueue.length}</p>
            <div className="swipe-item">
              <div className="item-icon">{currentActivity.image}</div>
              <p className="card-type-label">{t(`interests.${currentActivity.category}`)}</p>
              <h3>{currentActivity.name}</h3>
              <p className="rating">⭐ {currentActivity.rating}</p>
              <p className="details">{t('activities.kmAway', { distance: currentActivity.distance })}</p>
              <p className="details">{t('activities.duration', { duration: currentActivity.duration })}</p>
              <p className="address">{currentActivity.address}</p>
            </div>
            <div className="swipe-buttons">
              <button onClick={() => swipeActivity(false)} className="btn-reject">{t('activities.skip')}</button>
              <button onClick={() => swipeActivity(true)} className="btn-accept">{t('activities.yes')}</button>
            </div>
          </div>
        </div>
      );
    }

    if (stage === 'meal-prompt') {
      return (
        <div className="dayguide-container">
          <div className="card meal-prompt-card">
            <div className="meal-prompt-icon">🍽️</div>
            <h2>{t('mealPrompt.title')}</h2>
            <p className="meal-prompt-subtitle">{t('mealPrompt.subtitle')}</p>
            <div className="meal-prompt-buttons">
              <button onClick={goToRestaurants} className="btn-primary">
                {t('mealPrompt.yes')}
              </button>
              <button onClick={() => continueAfterRestaurants([])} className="btn-secondary">
                {t('mealPrompt.no')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (stage === 'restaurants') {
      if (isRestaurantsLoading) {
        return (
          <div className="dayguide-container">
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="restaurants-loading-icon">🔍</div>
              <h2>{t('restaurants.searching')}</h2>
            </div>
          </div>
        );
      }

      if (restaurantQueue !== null && restaurantQueue.length === 0) {
        const hasCuisine = selectedCuisines.length > 0;
        const hasPrice = !!selectedPriceRange;
        const hasFilters = hasCuisine || hasPrice;
        return (
          <div className="dayguide-container">
            <div className="card no-results-card">
              <div className="no-results-icon">🍽️</div>
              <h2>{t('restaurants.noResultsTitle')}</h2>
              <p className="no-results-msg">
                {hasFilters ? t('restaurants.noResultsFiltered') : t('restaurants.noResultsArea')}
              </p>
              {nearestHint && (
                <div className="no-results-hint">
                  {t('restaurants.nearestHint', { name: nearestHint.name, distance: nearestHint.distance })}
                </div>
              )}
              <div className="no-results-actions">
                {hasFilters && (
                  <button
                    onClick={() => { setSelectedCuisines([]); setSelectedPriceRange(null); goToRestaurants([], null); }}
                    className="btn-primary"
                  >
                    {t('restaurants.showAllNearby')}
                  </button>
                )}
                {hasCuisine && hasPrice && (
                  <button
                    onClick={() => { setSelectedCuisines([]); goToRestaurants([], selectedPriceRange); }}
                    className="btn-secondary"
                  >
                    {t('restaurants.removeCuisineFilter')}
                  </button>
                )}
                {hasPrice && (
                  <button
                    onClick={() => { setSelectedPriceRange(null); goToRestaurants(selectedCuisines, null); }}
                    className="btn-secondary"
                  >
                    {t('restaurants.removePriceFilter')}
                  </button>
                )}
                <button onClick={() => continueAfterRestaurants([])} className="btn-secondary">
                  {t('restaurants.skipAndContinue')}
                </button>
              </div>
            </div>
          </div>
        );
      }

      const currentRestaurant = restaurantQueue ? restaurantQueue[currentRestaurantIndex] : null;

      if (!currentRestaurant) {
        return (
          <div className="dayguide-container">
            <div className="card">
              <h2>{t('restaurants.noMore')}</h2>
              <button onClick={() => continueAfterRestaurants(selectedRestaurants)} className="btn-primary">
                {t('restaurants.buildItinerary')}
              </button>
            </div>
          </div>
        );
      }

      const recommendationReason = buildRecommendationReason(currentRestaurant, {
        selectedCuisines,
        selectedPriceRange,
        hasChildren,
      });

      return (
        <div className="dayguide-container">
          <div className="card swipe-card">
            <h2>{t('restaurants.title')}</h2>
            <p className="swipe-progress">{currentRestaurantIndex + 1} / {restaurantQueue.length}</p>
            {restaurantSource && SOURCE_BANNER_KEY[restaurantSource] && (
              <div className={`api-source-banner api-source-banner--${restaurantSource === 'live' ? 'live' : 'warning'}`}>
                {t(`restaurants.${SOURCE_BANNER_KEY[restaurantSource]}`)}
              </div>
            )}
            <div className="swipe-item">
              <div className="restaurant-img-wrapper">
                <img
                  src={currentRestaurant.image}
                  alt={currentRestaurant.name}
                  className="restaurant-img"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              {currentRestaurant.cuisine.length > 0 && (
                <p className="card-type-label">
                  {getCuisineEmoji(currentRestaurant.cuisine)}&nbsp;
                  {currentRestaurant.cuisine.map(c => t(`cuisine.${c}`)).join(' · ')}
                </p>
              )}
              <h3>{currentRestaurant.name}</h3>
              {currentRestaurant.city && <p className="city-tag">📍 {currentRestaurant.city}</p>}
              <div className="guide-note">
                <p className="guide-note-label">{t('restaurants.whyThisFits', 'Why this fits')}</p>
                <p className="guide-note-text">{recommendationReason}</p>
              </div>
              <div className="place-facts">
                {typeof currentRestaurant.rating === 'number' && (
                  <div className="place-fact">
                    <span className="place-fact-label">{t('restaurants.ratingLabel', 'Rating')}</span>
                    <span className="place-fact-value">⭐ {currentRestaurant.rating} / 5</span>
                  </div>
                )}
                {currentRestaurant.priceRange && (
                  <div className="place-fact">
                    <span className="place-fact-label">{t('restaurants.priceLabel', 'Price level')}</span>
                    <span className="place-fact-value">💷 {currentRestaurant.priceRange}</span>
                  </div>
                )}
                {typeof currentRestaurant.distance === 'number' && (
                  <div className="place-fact">
                    <span className="place-fact-label">{t('restaurants.distanceLabel', 'Distance')}</span>
                    <span className="place-fact-value">{t('restaurants.kmAway', { distance: currentRestaurant.distance })}</span>
                  </div>
                )}
                {typeof currentRestaurant.duration === 'number' && (
                  <div className="place-fact">
                    <span className="place-fact-label">{t('restaurants.timeLabel', 'Time to allow')}</span>
                    <span className="place-fact-value">{t('restaurants.duration', { duration: currentRestaurant.duration })}</span>
                  </div>
                )}
              </div>
              <p className="address">{currentRestaurant.address}</p>
            </div>
            <div className="swipe-buttons">
              <button onClick={() => swipeRestaurant(false)} className="btn-reject">{t('restaurants.skip')}</button>
              <button onClick={() => swipeRestaurant(true)} className="btn-accept">{t('restaurants.yes')}</button>
            </div>
          </div>
        </div>
      );
    }

    if (stage === 'timeline') {
      const totalDuration = calculateTimelineDuration(timeline);
      const isOverTime = timeline.length > 0 && totalDuration > availableTime;
      const narrativeCopy = {
        foodFirst: t('timeline.dayNarrative.foodFirst', 'begins with food before moving on to the rest of your day'),
        activitiesFirst: t('timeline.dayNarrative.activitiesFirst', 'starts with activities before any food stops'),
        neutralOrder: t('timeline.dayNarrative.neutralOrder', 'moves through your picks one stop at a time'),
        fitsTime: t('timeline.dayNarrative.fitsTime', 'It should fit within your available time'),
        tightTime: t('timeline.dayNarrative.tightTime', 'The schedule may feel tight for your available time, so treat the later stops as flexible'),
        familyFriendlyPacing: t('timeline.dayNarrative.familyFriendlyPacing', 'family-friendly pacing'),
        priceLabels: {
          $: t('timeline.dayNarrative.priceLabels.budget', 'budget-friendly'),
          $$: t('timeline.dayNarrative.priceLabels.moderate', 'moderate'),
          $$$: t('timeline.dayNarrative.priceLabels.higherEnd', 'higher-end'),
        },
        templates: {
          openerWithTime: t('timeline.dayNarrative.templates.openerWithTime', 'Starting around {time}, this {stopLabel} plan {orderText}.'),
          openerWithoutTime: t('timeline.dayNarrative.templates.openerWithoutTime', 'This {stopLabel} plan {orderText}.'),
          fitWithPreferences: t('timeline.dayNarrative.templates.fitWithPreferences', '{fitText}, with {preferences} kept in mind.'),
          fitOnly: t('timeline.dayNarrative.templates.fitOnly', '{fitText}.'),
          preferencesOnly: t('timeline.dayNarrative.templates.preferencesOnly', 'It keeps {preferences} in mind along the way.'),
          cuisinePreference: t('timeline.dayNarrative.templates.cuisinePreference', 'your {cuisines} preferences'),
          budgetPreference: t('timeline.dayNarrative.templates.budgetPreference', 'a {budgetLabel} budget'),
        },
        stopLabelOne: t('timeline.dayNarrative.stopLabelOne', '1-stop'),
        stopLabelOther: t('timeline.dayNarrative.stopLabelOther', '{count}-stop'),
        listTwoSeparator: t('timeline.dayNarrative.listTwoSeparator', ' and '),
        listMiddleSeparator: t('timeline.dayNarrative.listMiddleSeparator', ', '),
        listFinalSeparator: t('timeline.dayNarrative.listFinalSeparator', ', and '),
        cuisineLabels: {
          italian: t('cuisine.italian', 'Italian'),
          indian: t('cuisine.indian', 'Indian'),
          british: t('cuisine.british', 'British'),
          japanese: t('cuisine.japanese', 'Japanese'),
          mexican: t('cuisine.mexican', 'Mexican'),
          mediterranean: t('cuisine.mediterranean', 'Mediterranean'),
          spanish: t('cuisine.spanish', 'Spanish'),
          french: t('cuisine.french', 'French'),
          chinese: t('cuisine.chinese', 'Chinese'),
          asian: t('cuisine.asian', 'Asian'),
          american: t('cuisine.american', 'American'),
          middleEastern: t('cuisine.middleEastern', 'Middle Eastern'),
          cafe: t('cuisine.cafe', 'Cafe'),
        },
      };
      const dayNarrative = buildDayNarrative(
        {
          timeline,
          startTime,
          availableTime,
          totalDuration,
          hasChildren,
          selectedCuisines,
          selectedPriceRange,
          startWith,
        },
        narrativeCopy,
      );

      return (
        <div className="dayguide-container">
          <div className="card timeline-card">
            <h2>{t('timeline.title')}</h2>
            {isOverTime && (
              <p className="over-time-warning">
                {t('timeline.overTime', { hours: availableTime })}
              </p>
            )}
            {dayNarrative && timeline.length > 0 && (
              <div className="guide-note">
                <p className="guide-note-label">{t('timeline.dayGuideLabel', 'Day guide')}</p>
                <p className="guide-note-text">{dayNarrative}</p>
              </div>
            )}
            <div className="timeline">
              {timeline.length === 0 ? (
                <p>{t('timeline.empty')}</p>
              ) : (
                timeline.map((item, index) => (
                  <div key={item.id} className="timeline-group">
                    <div className="timeline-item">
                      <div className="timeline-time">{item.time}</div>
                      <div className="timeline-content">
                        <span className="timeline-icon">{item.icon}</span>
                        <div className="activity-details">
                          <p className="card-type-label timeline-category">
                            {getTimelineCategoryLabel({
                              category: item.category,
                              t,
                              activityCategories: ACTIVITY_CATEGORIES,
                            })}
                          </p>
                          <h4>{item.activity}</h4>
                          <div className="duration-section">
                            <input type="range" min="0.25" max="4" step="0.25" value={item.duration}
                              onChange={e => updateActivityDuration(index, parseFloat(e.target.value))}
                              className="duration-slider" />
                            <div className="duration-display">{t('timeline.hoursDisplay', { duration: item.duration.toFixed(2) })}</div>
                          </div>
                          <p className="duration-hint">{t('timeline.slideToAdjust')}</p>
                          <p className="activity-info">⭐ {item.rating} | 📍 {item.distance}km</p>
                          <p className="address">{item.address}</p>
                        </div>
                      </div>
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="transport-section">
                        <div className="transport-label">{t('timeline.howToGetThere')}</div>
                        <div className="transport-options">
                          {selectTransportOptions(TRANSPORT_OPTIONS, item.distance).map((option, i) => (
                            <div key={i} className="transport-option">
                              <div className="transport-emoji">{option.emoji}</div>
                              <div className="transport-details">
                                <div className="transport-mode">{t(`transport.${option.mode}`)}</div>
                                <div className="transport-time">{t('timeline.minutes', { count: option.time })}</div>
                                <div className="transport-cost">{option.cost}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="action-buttons">
              <button onClick={resetState} className="btn-secondary">{t('timeline.startOver')}</button>
              <button onClick={() => setShowQR(true)} className="btn-secondary share-btn">{t('timeline.share')}</button>
              <button className="btn-primary book-btn">{t('timeline.bookNow')}</button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };


  return (
    <>
      <div className="app-header">
        <span className="user-email-display">👤 {currentUser?.email}</span>
        <div className="header-controls">
          <select
            value={i18n.language.split('-')[0]}
            onChange={e => changeLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="zh">中文</option>
            <option value="vi">Tiếng Việt</option>
          </select>
          <button onClick={logout} className="btn-logout">{t('header.logout')}</button>
        </div>
      </div>
      {renderStage()}
      <PopupModal
        activePopup={activePopup}
        onClose={dismissPopup}
        onYes={handlePopupYes}
        t={t}
      />
      <TimelineShareQRModal
        showQR={showQR}
        onClose={() => setShowQR(false)}
        timeline={timeline}
        t={t}
      />
    </>
  );
};

export default DayGuide;
