import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import useGeolocation from './useGeolocation';
import './DayGuide.css';

const DayGuide = () => {
  const { currentUser, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { position, error: locationError, isLoading: locationLoading, refresh: refreshLocation } = useGeolocation();

  const [stage, setStage] = useState('welcome');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [availableTime, setAvailableTime] = useState(4);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [timeline, setTimeline] = useState([]);

  const transportOptions = [
    { mode: 'walk', time: 15, cost: '£0', emoji: '🚶' },
    { mode: 'taxi', time: 8, cost: '£7', emoji: '🚕' },
    { mode: 'tube', time: 5, cost: '£2.80', emoji: '🚇' },
    { mode: 'bus', time: 12, cost: '£1.75', emoji: '🚌' },
  ];

  const getSmartTransportOptions = (distance) => {
    if (distance < 0.5) {
      return transportOptions.filter(opt => ['walk', 'taxi'].includes(opt.mode));
    } else if (distance > 1.5) {
      return transportOptions.filter(opt => opt.mode !== 'walk');
    }
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

  const londonRestaurants = {
    italian: [
      { id: 101, name: 'Polpo', cuisine: 'italian', duration: 1.5, distance: 0.4, rating: 4.5, address: 'Beak Street, London W1F 9SB', priceRange: '£££', image: '🍝' },
      { id: 102, name: 'Lilia', cuisine: 'italian', duration: 1.5, distance: 0.8, rating: 4.6, address: 'Shoreditch, London E1 6LG', priceRange: '£££', image: '🍷' },
    ],
    japanese: [
      { id: 103, name: 'Sushi Samba', cuisine: 'japanese', duration: 1.5, distance: 0.5, rating: 4.7, address: 'Heron Tower, London EC2N 1HP', priceRange: '£££', image: '🍣' },
      { id: 104, name: 'Roka', cuisine: 'japanese', duration: 1.5, distance: 1.2, rating: 4.6, address: 'Charlotte Street, London W1T 4QE', priceRange: '£££', image: '🥢' },
    ],
    mexican: [
      { id: 105, name: 'Wahaca', cuisine: 'mexican', duration: 1, distance: 0.6, rating: 4.4, address: 'Market, London WC2E 8RF', priceRange: '££', image: '🌮' },
      { id: 106, name: 'Chilango', cuisine: 'mexican', duration: 1, distance: 0.9, rating: 4.3, address: 'Brick Lane, London E1 6QL', priceRange: '££', image: '🌯' },
    ],
    british: [
      { id: 107, name: 'Rules', cuisine: 'british', duration: 2, distance: 0.5, rating: 4.5, address: 'Maiden Lane, London WC2E 7LB', priceRange: '£££', image: '🍖' },
      { id: 108, name: 'The Ivy', cuisine: 'british', duration: 2, distance: 0.7, rating: 4.4, address: 'West Street, London WC2H 9NQ', priceRange: '£££', image: '🥩' },
    ],
    cafes: [
      { id: 109, name: 'Flat White', cuisine: 'cafe', duration: 0.5, distance: 0.3, rating: 4.6, address: 'Berners Street, London W1T 3LN', priceRange: '£', image: '☕' },
      { id: 110, name: 'Timberyard', cuisine: 'cafe', duration: 0.5, distance: 0.8, rating: 4.5, address: 'Shoreditch, London E1 6QL', priceRange: '£', image: '🥐' },
    ],
  };

  const interestCategories = [
    { id: 'museums', label: t('interests.museums'), icon: '🏛️' },
    { id: 'galleries', label: t('interests.galleries'), icon: '🎨' },
    { id: 'parks', label: t('interests.parks'), icon: '🌳' },
    { id: 'shopping', label: t('interests.shopping'), icon: '🛍️' },
  ];

  const handleStartPlanning = () => {
    if (locationLoading) {
      setStage('location');
    } else {
      setStage('interests');
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('dayguide_language', lang);
  };

  const toggleInterest = (interestId) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const getActivitiesForInterests = () => {
    const allActivities = [];
    const seenIds = new Set();
    selectedInterests.forEach((interest) => {
      if (londonVenues[interest]) {
        londonVenues[interest].forEach((activity) => {
          if (!seenIds.has(activity.id)) {
            allActivities.push(activity);
            seenIds.add(activity.id);
          }
        });
      }
    });
    return allActivities.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  const swipeActivity = (liked) => {
    const activities = getActivitiesForInterests();
    if (liked && currentActivityIndex < activities.length) {
      setSelectedActivities([...selectedActivities, activities[currentActivityIndex]]);
    }
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
    } else {
      setStage('restaurants');
      setCurrentRestaurantIndex(0);
    }
  };

  const getRestaurantsForPreferences = () => {
    const allRestaurants = [];
    const seenIds = new Set();
    selectedInterests.forEach((interest) => {
      if (londonRestaurants[interest]) {
        londonRestaurants[interest].forEach((restaurant) => {
          if (!seenIds.has(restaurant.id)) {
            allRestaurants.push(restaurant);
            seenIds.add(restaurant.id);
          }
        });
      }
    });
    allRestaurants.push(...londonRestaurants.cafes.filter(r => !seenIds.has(r.id)));
    return allRestaurants.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  const swipeRestaurant = (liked) => {
    const restaurants = getRestaurantsForPreferences();
    if (liked && currentRestaurantIndex < restaurants.length) {
      setSelectedRestaurants([...selectedRestaurants, restaurants[currentRestaurantIndex]]);
    }
    const restaurants2 = getRestaurantsForPreferences();
    if (currentRestaurantIndex < restaurants2.length - 1) {
      setCurrentRestaurantIndex(currentRestaurantIndex + 1);
    } else {
      buildTimeline();
    }
  };

  const buildTimeline = () => {
    const newTimeline = [];
    let currentTime = 9;
    const allItems = [...selectedActivities, ...selectedRestaurants];
    allItems.forEach((item, index) => {
      newTimeline.push({
        id: `${index}-${item.id}`,
        time: `${Math.floor(currentTime)}:${String(Math.round((currentTime % 1) * 60)).padStart(2, '0')}`,
        activity: item.name,
        duration: item.duration,
        distance: item.distance,
        category: item.category || item.cuisine,
        icon: item.image,
        address: item.address,
        rating: item.rating,
      });
      currentTime += item.duration + 0.25;
    });
    setTimeline(newTimeline);
    setStage('timeline');
  };

  const updateActivityDuration = (index, newDuration) => {
    const updatedTimeline = [...timeline];
    updatedTimeline[index].duration = newDuration;
    setTimeline(updatedTimeline);
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
              {locationLoading && (
                <p className="location-status">{t('welcome.detectingLocation')}</p>
              )}
              {!locationLoading && locationError && (
                <p className="location-status location-status--error">⚠️ {t(locationError)}</p>
              )}
              {!locationLoading && position && (
                <p className="location-status">
                  📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                  <span className="location-accuracy"> ±{Math.round(position.accuracy)}m</span>
                </p>
              )}
              <button onClick={refreshLocation} className="btn-refresh">
                {t('welcome.refreshLocation')}
              </button>
            </div>

            <button onClick={handleStartPlanning} className="btn-primary">
              {t('welcome.startPlanning')}
            </button>
          </div>
        </div>
      );
    }

    if (stage === 'location') {
      if (!locationLoading) {
        setTimeout(() => setStage('interests'), 0);
        return null;
      }
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
            <div className="interest-grid">
              {interestCategories.map((interest) => (
                <button key={interest.id} className={`interest-btn ${selectedInterests.includes(interest.id) ? 'selected' : ''}`} onClick={() => toggleInterest(interest.id)}>
                  <span className="icon">{interest.icon}</span>
                  <span>{interest.label}</span>
                </button>
              ))}
            </div>
            <div className="time-selector">
              <label>{t('interests.timeLabel')}</label>
              <input type="range" min="1" max="8" value={availableTime} onChange={(e) => setAvailableTime(parseInt(e.target.value))} className="slider" />
              <span>{t('interests.hours', { count: availableTime })}</span>
            </div>
            <button onClick={() => { setCurrentActivityIndex(0); setStage('activities'); }} disabled={selectedInterests.length === 0} className="btn-primary">
              {t('interests.next')}
            </button>
          </div>
        </div>
      );
    }

    if (stage === 'activities') {
      const activities = getActivitiesForInterests();
      const currentActivity = activities[currentActivityIndex];
      if (!currentActivity) {
        return (
          <div className="dayguide-container">
            <div className="card">
              <h2>{t('activities.noMore')}</h2>
              <button onClick={() => setStage('restaurants')} className="btn-primary">
                {t('activities.continueToRestaurants')}
              </button>
            </div>
          </div>
        );
      }
      return (
        <div className="dayguide-container">
          <div className="card swipe-card">
            <h2>{t('activities.title')}</h2>
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

    if (stage === 'restaurants') {
      const restaurants = getRestaurantsForPreferences();
      const currentRestaurant = restaurants[currentRestaurantIndex];
      if (!currentRestaurant) {
        return (
          <div className="dayguide-container">
            <div className="card">
              <h2>{t('restaurants.noMore')}</h2>
              <button onClick={buildTimeline} className="btn-primary">
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
            <div className="swipe-item">
              <div className="item-icon">{currentRestaurant.image}</div>
              <h3>{currentRestaurant.name}</h3>
              <p className="cuisine">{t(`cuisine.${currentRestaurant.cuisine}`)}</p>
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
      return (
        <div className="dayguide-container">
          <div className="card timeline-card">
            <h2>{t('timeline.title')}</h2>
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
                            <input type="range" min="0.25" max="4" step="0.25" value={item.duration} onChange={(e) => updateActivityDuration(index, parseFloat(e.target.value))} className="duration-slider" />
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
                          {getSmartTransportOptions(item.distance).map((option, optIndex) => (
                            <div key={optIndex} className="transport-option">
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
              <button onClick={() => setStage('welcome')} className="btn-secondary">{t('timeline.startOver')}</button>
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
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
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
