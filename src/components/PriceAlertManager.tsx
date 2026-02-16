'use client';

import { useEffect } from 'react';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';

export default function PriceAlertManager() {
  const { alerts, removeAlert } = usePriceAlerts();

  useEffect(() => {
    if (alerts.length === 0) return;

    const checkPrices = async () => {
      try {
        // Fetch all prices (lightweight list of symbol+price)
        const res = await fetch('https://api.binance.com/api/v3/ticker/price', { next: { revalidate: 30 } });
        const data = await res.json();

        // Map for quick lookup
        const priceMap = new Map<string, number>();
        data.forEach((item: { symbol: string, price: string }) => {
          priceMap.set(item.symbol, parseFloat(item.price));
        });

        const triggeredAlerts: string[] = [];

        alerts.forEach(alert => {
          if (!alert.isActive) return;

          // Try exact match or append USDT
          let currentPrice = priceMap.get(alert.symbol);
          if (currentPrice === undefined) {
            currentPrice = priceMap.get(`${alert.symbol}USDT`);
          }

          if (currentPrice !== undefined) {
            let triggered = false;

            if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
              triggered = true;
            } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
              triggered = true;
            }

            if (triggered) {
              // Browser Notification
              if (Notification.permission === 'granted') {
                new Notification(`🔔 가격 도달 알림: ${alert.symbol}`, {
                  body: `${alert.symbol} 현재가 $${currentPrice.toLocaleString()}에 도달했습니다.\n(목표가: $${alert.targetPrice.toLocaleString()})`,
                  requireInteraction: true,
                });
              } else {
                // Fallback: alert? or ignore
                console.log(`알림 도달: ${alert.symbol} $${currentPrice}`);
              }
              triggeredAlerts.push(alert.id);
            }
          }
        });

        // Cleanup triggered alerts using local function or helper
        // Since removeAlert depends on state index/filter, doing it in loop might be race-y if state updates batch.
        // We'll just call remove for each.
        triggeredAlerts.forEach(id => removeAlert(id));

      } catch (e) {
        console.error('PriceAlertManager check failed:', e);
      }
    };

    // Check periodically
    const interval = setInterval(checkPrices, 30000); // Check every 30s
    checkPrices(); // Initial check

    return () => clearInterval(interval);
  }, [alerts, removeAlert]);

  return null;
}
