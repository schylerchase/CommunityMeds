import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { searchDrugs } from '../../services/drugSearch';
import type { DrugSearchResult } from '../../services/drugSearch';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ initialQuery = '', onSearch, autoFocus = false }: SearchBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<DrugSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recent-searches', []);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchDrugs(searchQuery, 5);
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const performSearch = (searchQuery: string) => {
    // Add to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== searchQuery.toLowerCase());
      return [searchQuery, ...filtered].slice(0, 5);
    });

    setShowSuggestions(false);
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions.length > 0 ? suggestions : recentSearches.map((s) => ({ id: s, brandName: s }));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const item = items[selectedIndex];
      if ('brandName' in item && item.id !== item.brandName) {
        navigate(`/drug/${item.id}`);
      } else {
        performSearch(typeof item === 'string' ? item : item.brandName);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={t('home.searchPlaceholder')}
          autoFocus={autoFocus}
          className="w-full h-14 sm:h-16 pl-5 pr-14 text-lg text-gray-900 bg-white rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-gray-400"
          aria-label={t('home.searchPlaceholder')}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
          role="combobox"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors touch-target"
          aria-label={t('home.searchButton')}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {isLoading && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || (query.length === 0 && recentSearches.length > 0)) && (
        <ul
          id="search-suggestions"
          ref={suggestionsRef}
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {query.length === 0 && recentSearches.length > 0 && (
            <>
              <li className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                {t('home.recentSearches')}
              </li>
              {recentSearches.map((search, index) => (
                <li key={search}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedIndex === index}
                    onClick={() => performSearch(search)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors touch-target ${
                      selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-900">{search}</span>
                  </button>
                </li>
              ))}
            </>
          )}

          {suggestions.map((drug, index) => (
            <li key={drug.id}>
              <button
                type="button"
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => navigate(`/drug/${drug.id}`)}
                className={`w-full text-left px-4 py-3 transition-colors touch-target ${
                  selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{drug.brandName}</div>
                {drug.genericName && drug.genericName !== drug.brandName && (
                  <div className="text-sm text-gray-500">{drug.genericName}</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
