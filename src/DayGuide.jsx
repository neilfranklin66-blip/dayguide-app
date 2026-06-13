import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from './AuthContext';
import useGeolocation from './useGeolocation';
import mockRestaurantData from './mockRestaurantData.json';
import mockActivityData from './mockActivityData.json';
import { searchRestaurants } from './api/placesApi';
import { mapFromMockArray, mapFromPlacesArray } from './adapters/placeCardAdapter';
import './DayGuide.css';

const CUISINE_EMOJI = {
  italian: '🍝', indian: '🍛', british: '🍖', japanese: '🍣',
  mexican: '🌮', mediterranean: '🥗', spanish: '🥘', french: '🥐',
  chinese: '🥢', asian: '🍜', american: '🍔', middleEastern: '🧆',
  cafe: '☕',
};

const getCuisineEmoji = (cuisines) => {
  const arr = Array.isArray(cuisines) ? cuisines : [cuisines];
  for (const c of arr) {
    if (CUISINE_EMOJI[c]) return CUISINE_EMOJI[c];
  }
  return '🍽️';
};

const ACTIVITY_CATEGORIES = new Set([
  'museums', 'galleries', 'parks', 'shopping', 'theater', 'liveMusic',
  'sportsEvents', 'nightlife', 'historicalSites', 'foodMarkets', 'cinema', 'comedy',
]);

const SOURCE_BANNER_KEY = {
  live: 'liveResults',
  no_key: 'noKeyWarning',
  quota: 'quotaWarning',
  no_location: 'noLocationWarning',
  no_results: 'noResultsWarning',
  error: 'errorWarning',
};

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

  const transportOptions = [
    { mode: 'walk', time: 15, cost: '£0', emoji: '🚶' },
    { mode: 'taxi', time: 8, cost: '£7', emoji: '🚕' },
    { mode: 'tube', time: 5, cost: '£2.80', emoji: '🚇' },
    { mode: 'bus', time: 12, cost: '£1.75', emoji: '🚌' },
  ];

  const getSmartTransportOptions = (distance) => {
    if (distance < 0.5) return transportOptions.filter(opt => ['walk', 'taxi'].includes(opt.mode));
    if (distance > 1.5) return transportOptions.filter(opt => opt.mode !== 'walk');
    return transportOptions;
  };

  const interestCategories = [
    { id: 'museums', label: t('interests.museums'), icon: '🏛️' },
    { id: 'galleries', label: t('interests.galleries'), icon: '🎨' },
    { id: 'parks', label: t('interests.parks'), icon: '🌳' },
    { id: 'shopping', label: t('interests.shopping'), icon: '🛍️' },
    { id: 'theater', label: t('interests.theater'), icon: '🎭' },
    { id: 'liveMusic', label: t('interests.liveMusic'), icon: '🎵' },
    { id: 'sportsEvents', label: t('interests.sportsEvents'), icon: '🏟️' },
    { id: 'nightlife', label: t('interests.nightlife'), icon: '🍸' },
    { id: 'historicalSites', label: t('interests.historicalSites'), icon: '🏰' },
    { id: 'foodMarkets', label: t('interests.foodMarkets'), icon: '🥕' },
    { id: 'cinema', label: t('interests.cinema'), icon: '🎬' },
    { id: 'comedy', label: t('interests.comedy'), icon: '😂' },
  ];

  const cuisineCategories = Object.entries(CUISINE_EMOJI).map(([id, icon]) => ({ id, icon }));

  const priceOptions = [
    { value: '$', labelKey: 'priceRange.budget' },
    { value: '$$', labelKey: 'priceRange.moderate' },
    { value: '$$$', labelKey: 'priceRange.expensive' },
  ];

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
    return !last || Date.now() - last > 3600000;
  };

  // Popup triggers: fire once after entering timeline with a populated plan
  useEffect(() => {
    if (stage !== 'timeline' || timeline.length === 0) return;

    const timer = setTimeout(() => {
      if (activePopupRef.current) return;

      // Trigger 1: highly-rated restaurant within 500m not already in plan
      if (canShowPopup('nearbyRestaurant')) {
        const nearby = mockRestaurantData.find(r =>
          r.distance <= 0.5 &&
          r.rating >= 4.3 &&
          !timeline.some(t => t.activity === r.name)
        );
        if (nearby) {
          showPopup('nearbyRestaurant', { restaurant: nearby });
          return;
        }
      }

      // Trigger 3: 2+ consecutive hours of activities without a food break
      if (canShowPopup('coffeeBreak')) {
        let consecutive = 0;
        for (const item of timeline) {
          if (ACTIVITY_CATEGORIES.has(item.category)) {
            consecutive += item.duration;
            if (consecutive >= 2) { showPopup('coffeeBreak'); return; }
          } else {
            consecutive = 0;
          }
        }
      }

      // Trigger 2: plan has restaurants but zero activities — only when 2+ items (single restaurant is intentional)
      if (canShowPopup('activityBreak')) {
        const hasActivities = timeline.some(item => ACTIVITY_CATEGORIES.has(item.category));
        if (!hasActivities && timeline.length >= 2) { showPopup('activityBreak'); }
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
    setAvailableTime(4);
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
    setSelectedInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleCuisine = (id) =>
    setSelectedCuisines(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getActivitiesForInterests = (interests = selectedInterests) => {
    const seen = new Set();
    const all = [];
    const cats = interests.length > 0 ? interests : Object.keys(mockActivityData);
    cats.forEach(interest => {
      (mockActivityData[interest] || []).forEach(a => {
        if (!seen.has(a.id)) { all.push(a); seen.add(a.id); }
      });
    });
    const filtered = all.filter(a => !selectedActivities.some(s => s.id === a.id));
    const pool = filtered.length > 0 ? filtered : all;
    return pool.sort(() => Math.random() - 0.5).slice(0, 10);
  };

  const buildRestaurantQueue = (cuisines = selectedCuisines, price = selectedPriceRange) => {
    const alreadySelected = selectedRestaurantsRef.current;
    const normalized = mapFromMockArray(mockRestaurantData);
    const filtered = normalized.filter(r => {
      if (r.distance > 5) return false;
      if (cuisines.length > 0 && !r.cuisine.some(c => cuisines.includes(c))) return false;
      if (price && r.priceRange !== price) return false;
      if (alreadySelected.some(s => s.id === r.id || s.name === r.name)) return false;
      return true;
    });
    return filtered.sort(() => Math.random() - 0.5).slice(0, 8);
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
      const alreadySelected = selectedRestaurantsRef.current;
      const deduped = placeCards.filter(r => !alreadySelected.some(s => s.id === r.id || s.name === r.name));
      if (deduped.length > 0) {
        setRestaurantQueue(deduped);
        setRestaurantSource('live');
      } else {
        setRestaurantQueue(buildRestaurantQueue(cuisineOverride, priceOverride));
        setRestaurantSource('no_results');
      }
    } catch (err) {
      setRestaurantQueue(buildRestaurantQueue(cuisineOverride, priceOverride));
      const msg = err.message;
      if (msg === 'NO_API_KEY') setRestaurantSource('no_key');
      else if (msg === 'QUOTA_EXCEEDED') setRestaurantSource('quota');
      else if (msg === 'NO_LOCATION') setRestaurantSource('no_location');
      else setRestaurantSource('error');
    } finally {
      setIsRestaurantsLoading(false);
    }
  };

  const swipeActivity = (liked) => {
    const currentActivity = activityQueue[currentActivityIndex];
    const newSelected = liked && currentActivity
      ? [...selectedActivities, currentActivity]
      : selectedActivities;

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
        setStage('meal-prompt');
      }
    }
  };

  const swipeRestaurant = (liked) => {
    const currentRestaurant = restaurantQueue[currentRestaurantIndex];
    const newSelected = liked && currentRestaurant
      ? [...selectedRestaurants, currentRestaurant]
      : selectedRestaurants;

    if (liked && currentRestaurant) {
      selectedRestaurantsRef.current = newSelected;
      setSelectedRestaurants(newSelected);
    }

    if (currentRestaurantIndex < restaurantQueue.length - 1) {
      setCurrentRestaurantIndex(i => i + 1);
    } else {
      buildTimeline(newSelected);
    }
  };

  const buildTimeline = (restaurants = selectedRestaurants, activities = selectedActivities) => {
    let currentTime = startTime;
    const allItems = [...activities, ...restaurants];
    const newTimeline = allItems.map((item, index) => {
      const entry = {
        id: `${index}-${item.id}`,
        time: `${Math.floor(currentTime)}:${String(Math.round((currentTime % 1) * 60)).padStart(2, '0')}`,
        activity: item.name,
        duration: item.duration,
        distance: item.distance,
        category: item.category || (Array.isArray(item.cuisine) ? item.cuisine[0] : item.cuisine),
        icon: item.category ? item.image : getCuisineEmoji(item.cuisine),
        address: item.address,
        rating: item.rating,
      };
      currentTime += item.duration + 0.25;
      return entry;
    });
    setTimeline(newTimeline);
    setStage('timeline');
  };

  const updateActivityDuration = (index, newDuration) => {
    setTimeline(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], duration: newDuration };
      return updated;
    });
  };

  // --- Popup action handlers ---

  const handlePopupYes = (popup) => {
    dismissPopup();
    if (popup.type === 'nearbyRestaurant' || popup.type === 'coffeeBreak') {
      goToRestaurants();
    } else if (popup.type === 'activityBreak') {
      popupActivityReturnRef.current = true;
      goToActivities();
    }
  };

  const handlePopupNo = () => dismissPopup();
  const handlePopupSkip = () => dismissPopup();

  // --- Render helpers ---

  const renderPopup = () => {
    if (!activePopup) return null;

    const icons = {
      nearbyRestaurant: '🍽️',
      activityBreak: '🎭',
      coffeeBreak: '☕',
    };

    const getMessage = () => {
      if (activePopup.type === 'nearbyRestaurant' && activePopup.restaurant) {
        const r = activePopup.restaurant;
        const cuisineLabel = r.cuisine.map(c => t(`cuisine.${c}`)).join('/');
        const distanceM = Math.round(r.distance * 1000);
        return t('popups.nearbyRestaurant.message', {
          cuisine: cuisineLabel,
          name: r.name,
          distance: distanceM,
        });
      }
      return t(`popups.${activePopup.type}.message`);
    };

    return (
      <div className="popup-overlay" onClick={handlePopupNo}>
        <div className="popup-card" onClick={e => e.stopPropagation()}>
          <button className="popup-close" onClick={handlePopupNo} aria-label="Close">✕</button>
          <div className="popup-icon">{icons[activePopup.type]}</div>
          <h3 className="popup-title">{t(`popups.${activePopup.type}.title`)}</h3>
          <p className="popup-message">{getMessage()}</p>
          <div className="popup-buttons">
            <button className="popup-btn popup-btn-yes" onClick={() => handlePopupYes(activePopup)}>
              {t(`popups.${activePopup.type}.yes`)}
            </button>
            <button className="popup-btn popup-btn-no" onClick={handlePopupNo}>
              {t(`popups.${activePopup.type}.no`)}
            </button>
            {activePopup.type === 'nearbyRestaurant' && (
              <button className="popup-btn popup-btn-skip" onClick={handlePopupSkip}>
                {t('popups.nearbyRestaurant.skip')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

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
              {priceOptions.map(opt => (
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

            <button
              onClick={goToActivities}
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
              <button onClick={() => setStage('meal-prompt')} className="btn-primary">
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
              <button onClick={() => buildTimeline([])} className="btn-secondary">
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
                <button onClick={() => buildTimeline([])} className="btn-secondary">
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
              <button onClick={() => buildTimeline(selectedRestaurants)} className="btn-primary">
                {t('restaurants.buildItinerary')}
              </button>
            </div>
          </div>
        );
      }

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
              <p className="rating">⭐ {currentRestaurant.rating}</p>
              <p className="details">💷 {currentRestaurant.priceRange}</p>
              <p className="details">{t('restaurants.kmAway', { distance: currentRestaurant.distance })}</p>
              <p className="details">{t('restaurants.duration', { duration: currentRestaurant.duration })}</p>
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
      const totalDuration = timeline.reduce((sum, item) => sum + item.duration, 0)
        + Math.max(0, timeline.length - 1) * 0.25;
      const isOverTime = timeline.length > 0 && totalDuration > availableTime;

      return (
        <div className="dayguide-container">
          <div className="card timeline-card">
            <h2>{t('timeline.title')}</h2>
            {isOverTime && (
              <p className="over-time-warning">
                {t('timeline.overTime', { hours: availableTime })}
              </p>
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
                            {ACTIVITY_CATEGORIES.has(item.category)
                              ? t(`interests.${item.category}`)
                              : t(`cuisine.${item.category}`, item.category)}
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
                          {getSmartTransportOptions(item.distance).map((option, i) => (
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

  const buildQRContent = () => {
    const lines = [`DayGuide — ${t('timeline.title')}`, ''];
    timeline.forEach(item => {
      const catLabel = ACTIVITY_CATEGORIES.has(item.category)
        ? t(`interests.${item.category}`)
        : t(`cuisine.${item.category}`, item.category);
      lines.push(`${item.time}  ${item.icon} ${catLabel}: ${item.activity} (${item.duration}h)`);
    });
    return lines.join('\n');
  };

  const renderQRModal = () => {
    if (!showQR) return null;
    return (
      <div className="popup-overlay" onClick={() => setShowQR(false)}>
        <div className="popup-card qr-modal" onClick={e => e.stopPropagation()}>
          <button className="popup-close" onClick={() => setShowQR(false)} aria-label="Close">✕</button>
          <div className="popup-icon">📲</div>
          <h3 className="popup-title">{t('timeline.shareTitle')}</h3>
          <div className="qr-wrapper">
            <QRCodeSVG value={buildQRContent()} size={200} />
          </div>
          <p className="popup-message qr-hint">{t('timeline.shareHint')}</p>
        </div>
      </div>
    );
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
      {renderPopup()}
      {renderQRModal()}
    </>
  );
};

export default DayGuide;

