import { useState, useEffect, useCallback, useRef } from 'react';

const useGeolocation = (triggers = []) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const watchIdRef = useRef(null);
  const triggersRef = useRef(triggers);

  useEffect(() => {
    triggersRef.current = triggers;
  }, [triggers]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('location.notSupported');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        setPosition(coords);
        setIsLoading(false);

        // Fire registered geolocation triggers
        triggersRef.current.forEach(({ condition, callback }) => {
          try {
            if (condition(coords)) callback(coords);
          } catch (_) {}
        });
      },
      (err) => {
        setError(err.code === 1 ? 'location.denied' : 'location.unavailable');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }, []);

  const refresh = useCallback(() => {
    stopWatching();
    startWatching();
  }, [stopWatching, startWatching]);

  useEffect(() => {
    startWatching();
    return stopWatching;
  }, [startWatching, stopWatching]);

  return { position, error, isLoading, refresh };
};

export default useGeolocation;
