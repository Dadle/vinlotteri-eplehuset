import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vinmonopoletApi } from '../api/client';
import type { VinmonopoletWine } from '../types';

interface WineSearchProps {
  onSelectWine: (wine: VinmonopoletWine) => void;
  onClose: () => void;
}

const wineTypeColors: Record<string, string> = {
  red: 'bg-red-500',
  white: 'bg-yellow-200',
  rose: 'bg-pink-300',
  sparkling: 'bg-amber-100',
  dessert: 'bg-amber-400',
  fortified: 'bg-amber-700',
};

const wineTypeLabels: Record<string, string> = {
  red: 'Rødvin',
  white: 'Hvitvin',
  rose: 'Rosévin',
  sparkling: 'Musserende',
  dessert: 'Dessertvin',
  fortified: 'Sterkvin',
};

function WineSearch({ onSelectWine, onClose }: WineSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VinmonopoletWine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const searchWines = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await vinmonopoletApi.search(searchQuery);
      setResults(data.wines);
      setTotalResults(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchWines(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchWines]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="card p-0 shadow-2xl flex flex-col w-full max-w-3xl max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Search icon with blue gradient */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-apple-black dark:text-white">
                    Søk i Vinmonopolet
                  </h2>
                  <p className="text-sm text-apple-gray">
                    Finn viner fra Norges vinkatalog
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-apple-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk etter vinnavn, produsent, region..."
                className="input pl-12 text-lg"
                autoFocus
              />
              {loading && (
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-500 font-medium">{error}</p>
                {error.includes('API') ? (
                  <p className="text-sm text-apple-gray mt-2">
                    Konfigurer VINMONOPOLET_API_KEY miljøvariabelen.<br />
                    <a 
                      href="https://api.vinmonopolet.no/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Få API-nøkkel fra Vinmonopolet →
                    </a>
                  </p>
                ) : (
                  <p className="text-sm text-apple-gray mt-1">Vennligst prøv igjen</p>
                )}
              </div>
            )}

            {!error && query.length < 2 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 8 8 8 13c0 4 2.5 7 4 7s4-3 4-7c0-5-4-11-4-11z" />
                    <path d="M12 20v2M10 22h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-apple-black dark:text-white font-medium">Begynn å skrive for å søke</p>
                <p className="text-sm text-apple-gray mt-1">Søk i Vinmonopolets vinkatalog</p>
              </div>
            )}

            {!error && query.length >= 2 && !loading && results.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-apple-lightgray dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-apple-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-apple-black dark:text-white font-medium">Ingen viner funnet</p>
                <p className="text-sm text-apple-gray mt-1">Prøv et annet søkeord</p>
              </div>
            )}

            {results.length > 0 && (
              <>
                <p className="text-sm text-apple-gray mb-4">
                  Viser {results.length} av {totalResults} resultater
                </p>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {results.map((wine, index) => (
                      <motion.button
                        key={wine.vinmonopolet_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => onSelectWine(wine)}
                        className="w-full text-left p-4 rounded-xl bg-apple-lightgray/50 dark:bg-gray-800/50 hover:bg-apple-lightgray dark:hover:bg-gray-800 border border-transparent hover:border-blue-500/30 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Wine type indicator */}
                          <div className={`w-3 h-12 rounded-full ${wineTypeColors[wine.wine_type] || 'bg-gray-400'} flex-shrink-0`} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-apple-black dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {wine.name}
                                  {wine.vintage && <span className="text-apple-gray ml-2">{wine.vintage}</span>}
                                </h3>
                                {wine.producer && (
                                  <p className="text-sm text-apple-gray truncate">{wine.producer}</p>
                                )}
                              </div>
                              {wine.price && (
                                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                                  {wine.price.toFixed(0)} kr
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2 text-sm text-apple-gray">
                              <span className="px-2 py-0.5 rounded bg-white/50 dark:bg-gray-700/50">
                                {wineTypeLabels[wine.wine_type] || wine.wine_type}
                              </span>
                              {wine.country && <span>{wine.country}</span>}
                              {wine.region && <span>• {wine.region}</span>}
                              {wine.grape_variety && <span>• {wine.grape_variety}</span>}
                            </div>
                          </div>

                          {/* Add button */}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Legg til
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-apple-lightgray/30 dark:bg-gray-800/30">
            <p className="text-xs text-apple-gray text-center">
              Data fra Vinmonopolet • Klikk på en vin for å legge den til i kjelleren
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default WineSearch;
