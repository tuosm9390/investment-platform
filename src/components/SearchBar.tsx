'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import styles from './SearchBar.module.css';

import { SUGGESTIONS } from '@/data/suggestions';

// 인기 검색어 & 자동완성 데이터 (removed local declaration)

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
  const params = useParams();
  const topic = typeof params?.topic === 'string' ? decodeURIComponent(params.topic) : '';
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 최근 검색어 로드
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // URL topic 변경 시 검색창 업데이트
  useEffect(() => {
    if (topic) {
      setQuery(topic);
    }
  }, [topic]);

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
      s.type === 'crypto' && (
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.symbol.toLowerCase().includes(query.toLowerCase())
      )
    ).slice(0, 8)
    : [];

  const showRecent = !query.trim() && recentSearches.length > 0;
  const hasResults = filteredSuggestions.length > 0 || showRecent;

  const handleSearch = useCallback((searchQuery: string, symbol?: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setRecentSearches(getRecentSearches());
      setIsOpen(false);
      setQuery('');

      let url = `/search/${encodeURIComponent(searchQuery.trim())}`;

      // 코인 심볼이 특정된 경우 쿼리 파라미터로 전달 (뉴스 페이지로 이동)
      if (symbol) {
        url += `?coin=${symbol.toLowerCase()}`;
      }

      router.push(url);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
      const item = filteredSuggestions[activeIndex];
      handleSearch(item.name, item.symbol);
    } else {
      // 입력된 검색어와 정확히 일치하는 제안이 있는지 확인
      const match = SUGGESTIONS.find(s => s.name.toLowerCase() === query.trim().toLowerCase() || s.symbol.toLowerCase() === query.trim().toLowerCase());
      if (match) {
        handleSearch(match.name, match.symbol);
      } else {
        handleSearch(query);
      }
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
          placeholder="코인을 검색하세요 (예: 비트코인, BTC, 이더리움)"
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
                  onClick={() => handleSearch(item.name, item.symbol)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className={styles.suggestionIcon}>
                    {item.type === 'crypto' ? '🪙' : '📈'}
                  </span>
                  <span className={styles.suggestionName}>{item.name}</span>
                  <span className={styles.suggestionSymbol}>{item.symbol}</span>
                  <span className={styles.suggestionType}>
                    암호화폐
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
              {recentSearches.map((item, index) => {
                const match = SUGGESTIONS.find(s => s.name === item || s.symbol === item);
                return (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.dropdownItem} ${index === activeIndex ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleSearch(item, match?.symbol)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className={styles.suggestionIcon}><Clock size={14} /></span>
                    <span className={styles.suggestionName}>{item}</span>
                  </button>
                );
              })}
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
                  onClick={() => handleSearch(item.name, item.symbol)}
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
