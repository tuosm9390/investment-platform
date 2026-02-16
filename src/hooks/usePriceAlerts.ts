import { useState, useEffect, useCallback } from 'react';

export interface PriceAlert {
  id: string; // symbol-timestamp
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  isActive: boolean;
}

const ALERTS_KEY = 'invesight_price_alerts';

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ALERTS_KEY);
      if (saved) {
        setAlerts(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load price alerts', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever alerts change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  }, [alerts, isLoaded]);

  const addAlert = useCallback((symbol: string, targetPrice: number, currentPrice: number) => {
    const condition = targetPrice > currentPrice ? 'above' : 'below';
    const newAlert: PriceAlert = {
      id: `${symbol}-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      targetPrice,
      condition,
      createdAt: Date.now(),
      isActive: true,
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  }, []);

  // Browser Notification Permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return { alerts, addAlert, removeAlert, toggleAlert, requestPermission, isLoaded };
};
