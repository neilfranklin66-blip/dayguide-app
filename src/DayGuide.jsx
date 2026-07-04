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
  updateTimelineItemDuration,
} from './engines/timelineEngine';
import {
  getPopupYesAction,
  getTimelinePopupSuggestion,
} from './engines/popupEngine';
import TimelineShareQRModal from './components/TimelineShareQRModal';
import PopupModal from './components/PopupModal';
import WelcomeStage from './components/WelcomeStage';
import ChildrenInPartySelector from './components/ChildrenInPartySelector';
import StartOrderSelector from './components/StartOrderSelector';
import PriceRangeSelector from './components/PriceRangeSelector';
import AvailableTimeSelector from './components/AvailableTimeSelector';
import DateSelector from './components/DateSelector';
import StartTimeSelector from './components/StartTimeSelector';
import ActivityInterestGrid from './components/ActivityInterestGrid';
import CuisineInterestGrid from './components/CuisineInterestGrid';
import InterestsNextButton from './components/InterestsNextButton';
import NoMoreActivitiesCard from './components/NoMoreActivitiesCard';
import ActivitySwipeCard from './components/ActivitySwipeCard';
import ActivitiesNoResultsCard from './components/ActivitiesNoResultsCard';
import MealPromptCard from './components/MealPromptCard';
import RestaurantsLoadingCard from './components/RestaurantsLoadingCard';
import NoMoreRestaurantsCard from './components/NoMoreRestaurantsCard';
import RestaurantSwipeCard from './components/RestaurantSwipeCard';
import TimelineActionButtons from './components/TimelineActionButtons';
import TimelineHeaderSummary from './components/TimelineHeaderSummary';
import TimelineItemRow from './components/TimelineItemRow';
import TimelineTransportSection from './components/TimelineTransportSection';
import { buildRecommendationReason } from './utils/recommendationReason';
import { buildDayNarrative } from './utils/dayNarrative';
import { rankRecommendations } from './utils/recommendationScore';
import {
  CUISINE_EMOJI,
  getCuisineEmoji,
  ACTIVITY_CATEGORIES,
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
        <WelcomeStage
          t={t}
          locationLoading={locationLoading}
          locationError={locationError}
          position={position}
          refreshLocation={refreshLocation}
          onStartPlanning={handleStartPlanning}
        />
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

            <ActivityInterestGrid
              interestCategories={interestCategories}
              selectedInterests={selectedInterests}
              onToggle={toggleInterest}
              t={t}
            />

            <CuisineInterestGrid
              cuisineCategories={cuisineCategories}
              selectedCuisines={selectedCuisines}
              onToggle={toggleCuisine}
              t={t}
            />

            <PriceRangeSelector
              selectedPriceRange={selectedPriceRange}
              onChange={setSelectedPriceRange}
              t={t}
            />

            <AvailableTimeSelector
              availableTime={availableTime}
              onChange={setAvailableTime}
              t={t}
            />
            <DateSelector
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              t={t}
            />
            <StartTimeSelector
              startTime={startTime}
              onChange={setStartTime}
              t={t}
            />

            
            <ChildrenInPartySelector
              hasChildren={hasChildren}
              onChange={setHasChildren}
            />

            <StartOrderSelector
              startWith={startWith}
              onChange={setStartWith}
              t={t}
            />

            <InterestsNextButton
              onClick={goToNextSelectionStage}
              disabled={selectedInterests.length === 0 || hasChildren === null}
              t={t}
            />
          </div>
        </div>
      );
    }

    if (stage === 'activities') {
      const currentActivity = activityQueue[currentActivityIndex];

      if (activityQueue.length === 0) {
        return (
          <ActivitiesNoResultsCard
            hasSelectedInterests={selectedInterests.length > 0}
            onShowAll={() => goToActivities([])}
            onBackToInterests={() => setStage('interests')}
            t={t}
          />
        );
      }

      if (!currentActivity) {
        return (
          <NoMoreActivitiesCard
            onContinue={continueAfterActivities}
            t={t}
          />
        );
      }

      return (
        <ActivitySwipeCard
          currentActivity={currentActivity}
          currentActivityIndex={currentActivityIndex}
          activityQueueLength={activityQueue.length}
          onSwipe={swipeActivity}
          t={t}
        />
      );
    }

    if (stage === 'meal-prompt') {
      return (
        <MealPromptCard
          onYes={goToRestaurants}
          onNo={() => continueAfterRestaurants([])}
          t={t}
        />
      );
    }

    if (stage === 'restaurants') {
      if (isRestaurantsLoading) {
        return <RestaurantsLoadingCard t={t} />;
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
          <NoMoreRestaurantsCard
            onContinue={() => continueAfterRestaurants(selectedRestaurants)}
            t={t}
          />
        );
      }

      const recommendationReason = buildRecommendationReason(currentRestaurant, {
        selectedCuisines,
        selectedPriceRange,
        hasChildren,
      });

      return (
        <RestaurantSwipeCard
          currentRestaurant={currentRestaurant}
          currentRestaurantIndex={currentRestaurantIndex}
          restaurantQueueLength={restaurantQueue.length}
          restaurantSource={restaurantSource}
          recommendationReason={recommendationReason}
          onSwipe={swipeRestaurant}
          t={t}
        />
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
            <TimelineHeaderSummary
              isOverTime={isOverTime}
              availableTime={availableTime}
              dayNarrative={dayNarrative}
              hasTimelineItems={timeline.length > 0}
              t={t}
            />
            <div className="timeline">
              {timeline.length === 0 ? (
                <p>{t('timeline.empty')}</p>
              ) : (
                timeline.map((item, index) => (
                  <div key={item.id} className="timeline-group">
                    <TimelineItemRow
                      item={item}
                      index={index}
                      onDurationChange={updateActivityDuration}
                      t={t}
                    />
                    {index < timeline.length - 1 && (
                      <TimelineTransportSection
                        distance={item.distance}
                        t={t}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
            <TimelineActionButtons
              onStartOver={resetState}
              onShare={() => setShowQR(true)}
              t={t}
            />
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
