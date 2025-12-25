import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchBar } from '../components/search/SearchBar';
import { DrugCard } from '../components/search/DrugCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { searchDrugs } from '../services/openfda';
import type { DrugSearchResult } from '../services/openfda';

export function SearchResults() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<DrugSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchDrugs(query, 20);
        setResults(data);
      } catch (err) {
        setError(t('common.error'));
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, t]);

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar initialQuery={query} onSearch={handleSearch} />
      </div>

      {/* Results Header */}
      {query && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('search.resultsFor')} "{query}"
          </h1>
          {!loading && results.length > 0 && (
            <p className="text-gray-600 mt-1">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">{t('search.loading')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={() => handleSearch(query)}
            className="text-blue-600 hover:underline"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && query && results.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('search.noResults')}
          </h2>
          <p className="text-gray-600">{t('search.tryDifferent')}</p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((drug) => (
            <DrugCard key={drug.id} drug={drug} />
          ))}
        </div>
      )}

      {/* Initial State */}
      {!query && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('nav.search')}
          </h2>
          <p className="text-gray-600">{t('home.searchPlaceholder')}</p>
        </div>
      )}
    </div>
  );
}
