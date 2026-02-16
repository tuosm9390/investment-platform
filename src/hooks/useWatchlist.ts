import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'invesight_watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      if (saved) {
        setWatchlist(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load watchlist', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const toggleWatchlist = (symbol: string) => {
    const uppercaseSymbol = symbol.toUpperCase();
    let newWatchlist;
    if (watchlist.includes(uppercaseSymbol)) {
      newWatchlist = watchlist.filter(id => id !== uppercaseSymbol);
    } else {
      newWatchlist = [uppercaseSymbol, ...watchlist];
    }
    setWatchlist(newWatchlist);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol.toUpperCase());
  };

  return { watchlist, toggleWatchlist, isInWatchlist, isLoaded };
};
