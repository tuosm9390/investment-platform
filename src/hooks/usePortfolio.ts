import { useState, useEffect, useCallback } from 'react';

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  averagePrice: number; // USD
  updatedAt: number;
}

const PORTFOLIO_KEY = 'invesight_portfolio';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PORTFOLIO_KEY);
      if (saved) {
        setPortfolio(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load portfolio', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
    }
  }, [portfolio, isLoaded]);

  const updatePosition = useCallback((symbol: string, quantity: number, averagePrice: number) => {
    setPortfolio(prev => {
      const existing = prev.find(p => p.symbol === symbol.toUpperCase());
      if (existing) {
        // Update existing (Overwrite for now, simplified)
        // Or accumulating? Let's do overwrite/update for simplicity of MVP (User enters total quantity)
        if (quantity <= 0) {
          return prev.filter(p => p.symbol !== symbol.toUpperCase());
        }
        return prev.map(p =>
          p.symbol === symbol.toUpperCase()
            ? { ...p, quantity, averagePrice, updatedAt: Date.now() }
            : p
        );
      } else {
        // Add new
        if (quantity <= 0) return prev;
        return [...prev, {
          symbol: symbol.toUpperCase(),
          quantity,
          averagePrice,
          updatedAt: Date.now()
        }];
      }
    });
  }, []);

  const removePosition = useCallback((symbol: string) => {
    setPortfolio(prev => prev.filter(p => p.symbol !== symbol.toUpperCase()));
  }, []);

  const getPosition = useCallback((symbol: string) => {
    return portfolio.find(p => p.symbol === symbol.toUpperCase());
  }, [portfolio]);

  const getTotalValue = useCallback((currentPrices: Map<string, number>) => {
    return portfolio.reduce((total, item) => {
      const price = currentPrices.get(item.symbol) || item.averagePrice; // Fallback to avg price if current unknown
      return total + (item.quantity * price);
    }, 0);
  }, [portfolio]);

  return { portfolio, updatePosition, removePosition, getPosition, getTotalValue, isLoaded };
};
