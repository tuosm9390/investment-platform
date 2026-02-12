'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import styles from './SearchBar.module.css';

// 인기 검색어 & 자동완성 데이터
const SUGGESTIONS = [
  { name: '비트코인', symbol: 'BTC', type: 'crypto' as const },
  { name: '이더리움', symbol: 'ETH', type: 'crypto' as const },
  { name: '솔라나', symbol: 'SOL', type: 'crypto' as const },
  { name: '리플', symbol: 'XRP', type: 'crypto' as const },
  { name: '도지코인', symbol: 'DOGE', type: 'crypto' as const },
  { name: '에이다', symbol: 'ADA', type: 'crypto' as const },
  { name: '아발란체', symbol: 'AVAX', type: 'crypto' as const },
  { name: '폴카닷', symbol: 'DOT', type: 'crypto' as const },
  { name: '체인링크', symbol: 'LINK', type: 'crypto' as const },
  { name: '유니스왑', symbol: 'UNI', type: 'crypto' as const },
  { name: '니어', symbol: 'NEAR', type: 'crypto' as const },
  { name: '앱토스', symbol: 'APT', type: 'crypto' as const },
  { name: '수이', symbol: 'SUI', type: 'crypto' as const },
  { name: '시바이누', symbol: 'SHIB', type: 'crypto' as const },
  { name: '페페', symbol: 'PEPE', type: 'crypto' as const },
  { name: '삼성전자', symbol: '005930', type: 'stock' as const },
  { name: 'SK하이닉스', symbol: '000660', type: 'stock' as const },
  { name: 'LG에너지솔루션', symbol: '373220', type: 'stock' as const },
  { name: '현대자동차', symbol: '005380', type: 'stock' as const },
  { name: 'NAVER', symbol: '035420', type: 'stock' as const },
  { name: '카카오', symbol: '035720', type: 'stock' as const },
  { name: '테슬라', symbol: 'TSLA', type: 'stock' as const },
  { name: '애플', symbol: 'AAPL', type: 'stock' as const },
  { name: '엔비디아', symbol: 'NVDA', type: 'stock' as const },
];

const RECENT_KEY = 'invesight_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  const recent = getRecentSearches().filter(q => q !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 최근 검색어 로드
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 자동완성 필터링 (한국어 이름 + 영문 심볼 모두 검색)
  const filteredSuggestions = query.trim()
    ? SUGGESTIONS.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8)
    : [];

  const showRecent = !query.trim() && recentSearches.length > 0;
  const hasResults = filteredSuggestions.length > 0 || showRecent;

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setRecentSearches(getRecentSearches());
      setIsOpen(false);
      setQuery('');
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
      handleSearch(filteredSuggestions[activeIndex].name);
    } else {
      handleSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = filteredSuggestions.length || recentSearches.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="코인이나 주식을 검색하세요 (예: 비트코인, BTC, 삼성전자)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          검색
        </button>
      </div>

      {/* 자동완성 드롭다운 */}
      {isOpen && hasResults && (
        <div className={styles.dropdown}>
          {/* 검색어 입력 시 자동완성 */}
          {filteredSuggestions.length > 0 && (
            <div className={styles.dropdownSection}>
              {filteredSuggestions.map((item, index) => (
                <button
                  key={`${item.symbol}-${item.name}`}
                  type="button"
                  className={`${styles.dropdownItem} ${index === activeIndex ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleSearch(item.name)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className={styles.suggestionIcon}>
                    {item.type === 'crypto' ? '🪙' : '📈'}
                  </span>
                  <span className={styles.suggestionName}>{item.name}</span>
                  <span className={styles.suggestionSymbol}>{item.symbol}</span>
                  <span className={styles.suggestionType}>
                    {item.type === 'crypto' ? '암호화폐' : '주식'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 검색어 없을 때 최근 검색 */}
          {showRecent && (
            <div className={styles.dropdownSection}>
              <div className={styles.dropdownHeader}>
                <span><Clock size={12} /> 최근 검색</span>
                <button
                  type="button"
                  className={styles.clearRecentBtn}
                  onClick={clearRecent}
                >
                  전체 삭제
                </button>
              </div>
              {recentSearches.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.dropdownItem} ${index === activeIndex ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleSearch(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className={styles.suggestionIcon}><Clock size={14} /></span>
                  <span className={styles.suggestionName}>{item}</span>
                </button>
              ))}
            </div>
          )}

          {/* 인기 종목 */}
          {!query.trim() && (
            <div className={styles.dropdownSection}>
              <div className={styles.dropdownHeader}>
                <span><TrendingUp size={12} /> 인기 종목</span>
              </div>
              {SUGGESTIONS.slice(0, 5).map((item, index) => (
                <button
                  key={`popular-${item.symbol}`}
                  type="button"
                  className={`${styles.dropdownItem} ${(showRecent ? recentSearches.length : 0) + index === activeIndex ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleSearch(item.name)}
                >
                  <span className={styles.suggestionIcon}>🪙</span>
                  <span className={styles.suggestionName}>{item.name}</span>
                  <span className={styles.suggestionSymbol}>{item.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
