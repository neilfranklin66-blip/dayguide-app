import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import useGeolocation from './useGeolocation';
import mockRestaurantData from './mockRestaurantData.json';
import mockActivityData from './mockActivityData.json';
import { searchRestaurants } from './api/placesApi';
import { getActivitiesForInterests as getFilteredActivitiesForInterests } from './engines/filterEngine';
import { resolveRestaurantSearchOutcome } from './engines/restaurantEngine';
import { createSwipeSelection, toggleIdSelection } from './engines/selectionEngine';
import {
  getInitialSelectionRoute,
  getRouteAfterActivities,
  getRouteAfterRestaurants,
} from './engines/itineraryRouteEngine';
import {
  buildTimelineEntries,
  updateTimelineItemDuration,
} from './engines/timelineEngine';
import {
  getPopupYesAction,
  getRestaurantSuggestionKey,
  getTimelinePopupSuggestion,
} from './engines/popupEngine';
import TimelineShareQRModal from './components/TimelineShareQRModal';
import PopupModal from './components/PopupModal';
import WelcomeStage from './components/WelcomeStage';
import LocationStage from './components/LocationStage';
import InterestsStage from './components/InterestsStage';
import ActivitiesStage from './components/ActivitiesStage';
import MealPromptStage from './components/MealPromptStage';
import RestaurantsStage from './components/RestaurantsStage';
import TimelineStage from './components/TimelineStage';
import { savePlan, loadPlan, clearPlan } from './utils/planStorage';
import { getRestaurantSearchRequestOutcome } from './utils/restaurantSearchRequest';
import {
  createPlanPayload,
  getRestoredPlanState,
  summarizeSavedPlan,
} from './utils/planLifecycle';
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
  const [savedPlanSummary, setSavedPlanSummary] = useState(() => summarizeSavedPlan(loadPlan()));

  // Popup state
  const [activePopup, setActivePopup] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const popupCooldowns = useRef({});
  const activePopupRef = useRef(null);
  const popupActivityReturnRef = useRef(false);

  // Mirror of selectedRestaurants in a ref so goToRestaurants always reads
  // the current list regardless of closure capture timing.
  const selectedRestaurantsRef = useRef([]);

  // Restaurants skipped during swiping should not be re-suggested later by
  // the nearby restaurant popup in the same plan.
  const dismissedRestaurantKeysRef = useRef(new Set());

  // True while showing a resumed saved plan. Resumed plans do not restore
  // selections or queues, so popup actions would rebuild the timeline from
  // empty selections and overwrite the saved plan — suppress popups instead.
  const isResumedPlanRef = useRef(false);

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

  const rememberDismissedNearbyRestaurant = (popup) => {
    if (popup?.type !== 'nearbyRestaurant') return;

    const restaurantKey = getRestaurantSuggestionKey(popup.restaurant);

    if (restaurantKey) {
      dismissedRestaurantKeysRef.current.add(restaurantKey);
    }
  };

  const closePopup = (popup = activePopupRef.current) => {
    rememberDismissedNearbyRestaurant(popup);
    dismissPopup();
  };

  const skipNearbyRestaurantPopup = (popup) => {
    rememberDismissedNearbyRestaurant(popup);
    dismissPopup();
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
    if (isResumedPlanRef.current) return;

    const timer = setTimeout(() => {
      if (activePopupRef.current) return;

      const popup = getTimelinePopupSuggestion({
        // Only live search results may back the "restaurant nearby" popup;
        // mock/fallback venues would claim a nearby restaurant that isn't.
        restaurants: restaurantSource === 'live' ? (restaurantQueue || []) : [],
        timeline,
        activityCategories: ACTIVITY_CATEGORIES,
        canShowPopup,
        dismissedRestaurantKeys: dismissedRestaurantKeysRef.current,
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

  // Auto-advance past the location screen once geolocation resolves
  // (success or error both end the loading state).
  useEffect(() => {
    if (stage === 'location' && !locationLoading) {
      setStage('interests');
    }
  }, [stage, locationLoading]);

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
    dismissedRestaurantKeysRef.current = new Set();
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
    popupCooldowns.current = {};
    setShowQR(false);
    setIsRestaurantsLoading(false);
    setRestaurantSource(null);
    setNearestHint(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    isResumedPlanRef.current = false;
    clearPlan();
    setSavedPlanSummary(null);
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
      hasChildren,
    });

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

  const goToActivities = (interestsOverride = selectedInterests) => {
    const activities = getActivitiesForInterests(interestsOverride);
    setActivityQueue(activities);
    setCurrentActivityIndex(0);
    setStage('activities');
  };

  const goToRestaurants = async (cuisineOverride = selectedCuisines, priceOverride = selectedPriceRange) => {
    setIsRestaurantsLoading(true);
    setRestaurantSource(null);
    setNearestHint(null);
    setRestaurantQueue(null);
    setCurrentRestaurantIndex(0);
    setStage('restaurants');

    // Reads selectedRestaurantsRef at invocation time so dedupe always sees
    // the current list, matching the pre-extraction closure behaviour.
    const resolveOutcome = (searchOutcome) =>
      resolveRestaurantSearchOutcome({
        ...searchOutcome,
        mockRestaurants: mockRestaurantData,
        selectedRestaurants: selectedRestaurantsRef.current,
        cuisines: cuisineOverride,
        price: priceOverride,
        hasChildren,
      });

    const applyOutcome = ({ queue, source, nearestHint: hint }) => {
      setRestaurantQueue(queue);
      setRestaurantSource(source);
      setNearestHint(hint);
    };

    const searchOutcome = await getRestaurantSearchRequestOutcome({
      position,
      cuisines: cuisineOverride,
      price: priceOverride,
      searchRestaurantsFn: searchRestaurants,
    });

    applyOutcome(resolveOutcome(searchOutcome));
    setIsRestaurantsLoading(false);
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

    const restaurantKey = getRestaurantSuggestionKey(currentRestaurant);

    if (!liked && restaurantKey) {
      dismissedRestaurantKeysRef.current.add(restaurantKey);
    }

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

  // Persist the finished plan (timeline plus the settings TimelineStage needs)
  // so a refresh never loses a built plan. Queues, selections, and geolocation
  // are deliberately not saved.
  const persistPlan = (newTimeline) => {
    if (!Array.isArray(newTimeline) || newTimeline.length === 0) return;

    const plan = createPlanPayload({
      timeline: newTimeline,
      startTime,
      availableTime,
      hasChildren,
      selectedCuisines,
      selectedPriceRange,
      selectedDate,
      startWith,
    });

    savePlan(plan);
    setSavedPlanSummary(summarizeSavedPlan(plan));
  };

  const resumePlan = () => {
    const saved = loadPlan();
    if (!saved) {
      setSavedPlanSummary(null);
      return;
    }

    const restored = getRestoredPlanState(saved);

    setSavedPlanSummary(restored.summary);
    setTimeline(restored.timeline);
    setStartTime(restored.startTime);
    if (typeof restored.availableTime === 'number') setAvailableTime(restored.availableTime);
    setHasChildren(restored.hasChildren);
    setSelectedCuisines(restored.selectedCuisines);
    setSelectedPriceRange(restored.selectedPriceRange);
    if (restored.selectedDate) setSelectedDate(restored.selectedDate);
    if (restored.startWith) setStartWith(restored.startWith);
    isResumedPlanRef.current = true;
    setStage('timeline');
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
    persistPlan(newTimeline);
    isResumedPlanRef.current = false;
    setStage('timeline');
  };

  const updateActivityDuration = (index, newDuration) => {
    const updated = updateTimelineItemDuration(timeline, index, newDuration, startTime);
    setTimeline(updated);
    persistPlan(updated);
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
          savedPlanSummary={savedPlanSummary}
          onResume={resumePlan}
        />
      );
    }

    if (stage === 'location') {
      return <LocationStage t={t} />;
    }

    if (stage === 'interests') {
      return (
        <InterestsStage
          interestCategories={interestCategories}
          selectedInterests={selectedInterests}
          toggleInterest={toggleInterest}
          cuisineCategories={cuisineCategories}
          selectedCuisines={selectedCuisines}
          toggleCuisine={toggleCuisine}
          selectedPriceRange={selectedPriceRange}
          setSelectedPriceRange={setSelectedPriceRange}
          availableTime={availableTime}
          setAvailableTime={setAvailableTime}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          startTime={startTime}
          setStartTime={setStartTime}
          hasChildren={hasChildren}
          setHasChildren={setHasChildren}
          startWith={startWith}
          setStartWith={setStartWith}
          goToNextSelectionStage={goToNextSelectionStage}
          t={t}
        />
      );
    }

    if (stage === 'activities') {
      return (
        <ActivitiesStage
          activityQueue={activityQueue}
          currentActivityIndex={currentActivityIndex}
          selectedInterests={selectedInterests}
          goToActivities={goToActivities}
          setStage={setStage}
          continueAfterActivities={continueAfterActivities}
          startWith={startWith}
          swipeActivity={swipeActivity}
          t={t}
        />
      );
    }

    if (stage === 'meal-prompt') {
      return (
        <MealPromptStage
          goToRestaurants={goToRestaurants}
          continueAfterRestaurants={continueAfterRestaurants}
          t={t}
        />
      );
    }

    if (stage === 'restaurants') {
      return (
        <RestaurantsStage
          isRestaurantsLoading={isRestaurantsLoading}
          restaurantQueue={restaurantQueue}
          selectedCuisines={selectedCuisines}
          selectedPriceRange={selectedPriceRange}
          nearestHint={nearestHint}
          setSelectedCuisines={setSelectedCuisines}
          setSelectedPriceRange={setSelectedPriceRange}
          goToRestaurants={goToRestaurants}
          continueAfterRestaurants={continueAfterRestaurants}
          selectedRestaurants={selectedRestaurants}
          currentRestaurantIndex={currentRestaurantIndex}
          restaurantSource={restaurantSource}
          hasChildren={hasChildren}
          startWith={startWith}
          swipeRestaurant={swipeRestaurant}
          t={t}
        />
      );
    }

    if (stage === 'timeline') {
      return (
        <TimelineStage
          timeline={timeline}
          startTime={startTime}
          availableTime={availableTime}
          hasChildren={hasChildren}
          selectedCuisines={selectedCuisines}
          selectedPriceRange={selectedPriceRange}
          selectedDate={selectedDate}
          startWith={startWith}
          updateActivityDuration={updateActivityDuration}
          resetState={resetState}
          setShowQR={setShowQR}
          t={t}
        />
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
        onClose={closePopup}
        onYes={handlePopupYes}
        onSkip={skipNearbyRestaurantPopup}
        t={t}
      />
      <TimelineShareQRModal
        showQR={showQR}
        onClose={() => setShowQR(false)}
        timeline={timeline}
        selectedDate={selectedDate}
        t={t}
      />
    </>
  );
};

export default DayGuide;
