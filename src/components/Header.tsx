'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Search, Moon, Sun, X } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check system preference or saved theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search/${encodeURIComponent(keyword)}`);
      setIsSearchOpen(false);
      setKeyword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <TrendingUp size={24} />
        <span>Invesight</span>
      </Link>

      <nav className={styles.nav}>
        <Link href="/search/stock" className={styles.navLink}>
          주식 (Stocks)
        </Link>
        <Link href="/search/crypto" className={styles.navLink}>
          암호화폐 (Crypto)
        </Link>
      </nav>

      <div className={styles.actions}>
        <form className={styles.searchWrapper} onSubmit={handleSearch}>
          <input
            ref={inputRef}
            type="text"
            className={`${styles.searchInput} ${isSearchOpen ? styles.open : ''}`}
            placeholder="Search topic..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Search"
            onClick={isSearchOpen && !keyword ? toggleSearch : (!isSearchOpen ? toggleSearch : undefined)}
          // If open and has keyword, default submit behavior works if button type is submit, but here it's button.
          // Let's make the Search icon submit if open, or just toggle if closed/empty.
          // Simplified: Button always toggles open/close, Enter key submits.
          // Or better: If open, click does nothing (submit handled by enter or separate button? No, let's keep it simple)
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </form>

        <button
          className={styles.iconButton}
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
}
