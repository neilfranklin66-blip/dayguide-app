import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import useGeolocation from './useGeolocation';
import mockRestaurantData from './mockRestaurantData.json';
import './DayGuide.css';

const CUISINE_EMOJI = {
  italian: '🍝', indian: '🍛', british: '🍖', japanese: '🍣',
  mexican: '🌮', mediterranean: '🥗', spanish: '🥘', french: '🥐',
  chinese: '🥢', asian: '🍜', american: '🍔', middleEastern: '🧆',
};

const getCuisineEmoji = (cuisines) => {
  const arr = Array.isArray(cuisines) ? cuisines : [cuisines];
  for (const c of arr) {
    if (CUISINE_EMOJI[c]) return CUISINE_EMOJI[c];
  }
  return '🍽️';
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
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  // activityQueue is computed once when entering activities stage (avoids re-shuffle on each render)
  const [activityQueue, setActivityQueue] = useState([]);
  // null = not yet entered restaurants stage; [] = entered but filters returned no results
  const [restaurantQueue, setRestaurantQueue] = useState(null);
  const [timeline, setTimeline] = useState([]);

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

  const londonVenues = {
    museums: [
      { id: 1, name: 'British Museum', category: 'museums', duration: 2, distance: 0.5, rating: 4.7, address: 'Great Russell St, London WC1B 3DG', image: '🏛️' },
      { id: 2, name: 'V&A Museum', category: 'museums', duration: 2, distance: 1.2, rating: 4.6, address: 'Cromwell Rd, London SW7 2RL', image: '🎨' },
      { id: 3, name: 'National Gallery', category: 'museums', duration: 2, distance: 0.8, rating: 4.8, address: 'Trafalgar Square, London WC2N 5DN', image: '🖼️' },
    ],
    galleries: [
      { id: 4, name: 'Tate Modern', category: 'galleries', duration: 1.5, distance: 1.5, rating: 4.7, address: 'Bankside, London SE1 9TG', image: '🎭' },
      { id: 5, name: 'Saatchi Gallery', category: 'galleries', duration: 1.5, distance: 2, rating: 4.5, address: 'Duke of York Square, London SW3 4LY', image: '🖌️' },
    ],
    parks: [
      { id: 6, name: 'Hyde Park', category: 'parks', duration: 1, distance: 0.3, rating: 4.6, address: 'London W1K 7AW', image: '🌳' },
      { id: 7, name: 'St James Park', category: 'parks', duration: 1, distance: 0.5, rating: 4.5, address: 'London SW1A 2BJ', image: '🦆' },
      { id: 8, name: 'Regent Park', category: 'parks', duration: 1.5, distance: 1.8, rating: 4.4, address: 'London NW1 4NR', image: '🌲' },
    ],
    shopping: [
      { id: 9, name: 'Oxford Street', category: 'shopping', duration: 2, distance: 0.7, rating: 4.3, address: 'Oxford Street, London W1C 1JN', image: '🛍️' },
      { id: 10, name: 'Covent Garden Market', category: 'shopping', duration: 1.5, distance: 0.6, rating: 4.6, address: 'Covent Garden, London WC2E 8RF', image: '🎪' },
    ],
  };

  const interestCategories = [
    { id: 'museums', label: t('interests.museums'), icon: '🏛️' },
    { id: 'galleries', label: t('interests.galleries'), icon: '🎨' },
    { id: 'parks', label: t('interests.parks'), icon: '🌳' },
    { id: 'shopping', label: t('interests.shopping'), icon: '🛍️' },
  ];

  const cuisineCategories = Object.entries(CUISINE_EMOJI).map(([id, icon]) => ({ id, icon }));

  const priceOptions = [
    { value: '$', labelKey: 'priceRange.budget' },
    { value: '$$', labelKey: 'priceRange.moderate' },
    { value: '$$$', labelKey: 'priceRange.expensive' },
  ];

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
    setAvailableTime(4);
    setCurrentActivityIndex(0);
    setCurrentRestaurantIndex(0);
    setActivityQueue([]);
    setRestaurantQueue(null);
    setTimeline([]);
    setStage('welcome');
  };

  const toggleInterest = (id) =>
    setSelectedInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleCuisine = (id) =>
    setSelectedCuisines(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getActivitiesForInterests = () => {
    const seen = new Set();
    const all = [];
    selectedInterests.forEach(interest => {
      (londonVenues[interest] || []).forEach(a => {
        if (!seen.has(a.id)) { all.push(a); seen.add(a.id); }
      });
    });
    return all.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  const buildRestaurantQueue = () => {
    const filtered = mockRestaurantData.filter(r => {
      if (r.distance > 5) return false;
      if (selectedCuisines.length > 0 && !r.cuisine.some(c => selectedCuisines.includes(c))) return false;
      if (selectedPriceRange && r.priceRange !== selectedPriceRange) return false;
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

  const goToRestaurants = () => {
    const queue = buildRestaurantQueue();
    setRestaurantQueue(queue);
    setCurrentRestaurantIndex(0);
    setStage('restaurants');
  };

  // Fix: use activityQueue (computed once) instead of re-calling getActivitiesForInterests()
  // Fix: compute newSelected synchronously so the last liked activity is included if we
  //      immediately transition (though here we don't call buildTimeline in same cycle — safe)
  const swipeActivity = (liked) => {
    const currentActivity = activityQueue[currentActivityIndex];
    if (liked && currentActivity) {
      setSelectedActivities(prev => [...prev, currentActivity]);
    }
    if (currentActivityIndex < activityQueue.length - 1) {
      setCurrentActivityIndex(i => i + 1);
    } else {
      setStage('meal-prompt');
    }
  };

  // Fix: pass updated restaurant list directly to buildTimeline to avoid async state lag
  // when the last restaurant is liked and we immediately build the timeline
  const swipeRestaurant = (liked) => {
    const currentRestaurant = restaurantQueue[currentRestaurantIndex];
    const newSelected = liked && currentRestaurant
      ? [...selectedRestaurants, currentRestaurant]
      : selectedRestaurants;

    if (liked && currentRestaurant) {
      setSelectedRestaurants(newSelected);
    }

    if (currentRestaurantIndex < restaurantQueue.length - 1) {
      setCurrentRestaurantIndex(i => i + 1);
    } else {
      buildTimeline(newSelected);
    }
  };

  // Accept restaurants as param so swipeRestaurant can pass the up-to-date list
  // without waiting for the async setSelectedRestaurants state update
  const buildTimeline = (restaurants = selectedRestaurants) => {
    let currentTime = 9;
    const allItems = [...selectedActivities, ...restaurants];
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
            <div className="interest-grid">
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

            <button
              onClick={goToActivities}
              disabled={selectedInterests.length === 0}
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
            <div className="card">
              <p className="no-results-msg">{t('activities.noResults')}</p>
              <button onClick={() => setStage('interests')} className="btn-secondary">
                ← {t('interests.title')}
              </button>
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
      // Empty array means filters returned no results
      if (restaurantQueue !== null && restaurantQueue.length === 0) {
        return (
          <div className="dayguide-container">
            <div className="card">
              <p className="no-results-msg">{t('restaurants.noResults')}</p>
              <button onClick={goToRestaurants} className="btn-secondary">
                ← {t('restaurants.adjustFilters')}
              </button>
              <button onClick={() => buildTimeline([])} className="btn-secondary" style={{ marginTop: '10px' }}>
                {t('restaurants.skipAndContinue')}
              </button>
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
            <div className="swipe-item">
              <div className="restaurant-img-wrapper">
                <img
                  src={currentRestaurant.image}
                  alt={currentRestaurant.name}
                  className="restaurant-img"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <h3>{currentRestaurant.name}</h3>
              <p className="cuisine">
                {currentRestaurant.cuisine.map(c => t(`cuisine.${c}`)).join(' · ')}
              </p>
              <p className="city-tag">📍 {currentRestaurant.city}</p>
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
    </>
  );
};

export default DayGuide;
