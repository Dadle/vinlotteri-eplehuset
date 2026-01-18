import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { winesApi } from '../api/client';
import type { WineListItem, WineType } from '../types';

interface WineSelectorProps {
  value: number | null;
  onChange: (wineId: number | null, wine: WineListItem | null) => void;
}

const wineTypeColors: Record<WineType, string> = {
  red: 'bg-red-500',
  white: 'bg-yellow-200',
  rose: 'bg-pink-300',
  sparkling: 'bg-amber-100',
  dessert: 'bg-amber-400',
  fortified: 'bg-amber-700',
};

const wineTypeLabels: Record<WineType, string> = {
  red: 'Rødvin',
  white: 'Hvitvin',
  rose: 'Rosévin',
  sparkling: 'Musserende',
  dessert: 'Dessertvin',
  fortified: 'Sterkvin',
};

function WineSelector({ value, onChange }: WineSelectorProps) {
  const [wines, setWines] = useState<WineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    winesApi.list()
      .then(setWines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const selectedWine = wines.find(w => w.id === value);
  
  const filteredWines = wines.filter(w => 
    w.display_name.toLowerCase().includes(search.toLowerCase()) ||
    w.producer.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (wine: WineListItem) => {
    onChange(wine.id, wine);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null, null);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-apple-lightgray dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="label">Vinpremie</label>
      
      {/* Selected wine display / trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input text-left flex items-center justify-between gap-3"
      >
        {selectedWine ? (
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${wineTypeColors[selectedWine.wine_type]}`} />
            <span className="truncate font-medium">{selectedWine.display_name}</span>
            {selectedWine.producer && (
              <span className="text-apple-gray text-sm hidden sm:inline">fra {selectedWine.producer}</span>
            )}
          </div>
        ) : (
          <span className="text-apple-gray">Velg en vin...</span>
        )}
        <svg className={`w-5 h-5 text-apple-gray flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown - rendered via portal to escape stacking contexts */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{ 
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                maxWidth: '28rem',
                maxHeight: '320px',
                zIndex: 9999,
              }}
            >
              {/* Search input */}
              <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Søk etter viner..."
                  className="input py-2 text-sm"
                  autoFocus
                />
              </div>

              {/* Wine list */}
              <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
                {/* Clear option */}
                <button
                  onClick={handleClear}
                  className="w-full px-4 py-3 text-left hover:bg-apple-lightgray dark:hover:bg-gray-800 text-apple-gray text-sm transition-colors"
                >
                  Ingen vin valgt
                </button>

                {filteredWines.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-apple-gray">Ingen viner funnet</p>
                ) : (
                  filteredWines.map((wine) => (
                    <button
                      key={wine.id}
                      onClick={() => handleSelect(wine)}
                      className={`w-full px-4 py-3 text-left hover:bg-apple-lightgray dark:hover:bg-gray-800 transition-colors flex items-center gap-3 ${
                        wine.id === value ? 'bg-apple-lightgray dark:bg-gray-800' : ''
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${wineTypeColors[wine.wine_type]}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-apple-black dark:text-white truncate">
                          {wine.display_name}
                        </p>
                        <p className="text-sm text-apple-gray truncate">
                          {wine.producer} · {wineTypeLabels[wine.wine_type]}
                        </p>
                      </div>
                      {wine.id === value && (
                        <svg className="w-5 h-5 text-apple-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default WineSelector;
