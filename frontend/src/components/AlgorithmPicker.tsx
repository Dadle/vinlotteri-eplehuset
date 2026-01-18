import { useEffect, useState } from 'react';
import { algorithmsApi } from '../api/client';
import type { Algorithm, AlgorithmKey } from '../types';

interface AlgorithmPickerProps {
  value: AlgorithmKey;
  onChange: (value: AlgorithmKey) => void;
}

function AlgorithmPicker({ value, onChange }: AlgorithmPickerProps) {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    algorithmsApi.list()
      .then(setAlgorithms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedAlgo = algorithms.find(a => a.key === value);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-apple-lightgray dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="label">Trekningsalgoritme</label>
      
      {!expanded ? (
        <div className="flex items-center gap-2">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as AlgorithmKey)}
            className="select flex-1"
          >
            {algorithms.map((algo) => (
              <option key={algo.key} value={algo.key}>
                {algo.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setExpanded(true)}
            className="p-3 text-apple-gray hover:text-apple-black dark:hover:text-white hover:bg-apple-lightgray dark:hover:bg-gray-800 rounded-xl transition-colors"
            title="Vis beskrivelser"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {algorithms.map((algo) => {
            const isSelected = algo.key === value;
            return (
              <button
                key={algo.key}
                onClick={() => onChange(algo.key)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-apple-black dark:border-white bg-apple-lightgray dark:bg-gray-800'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-apple-black dark:border-white bg-apple-black dark:bg-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white dark:text-apple-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isSelected ? 'text-apple-black dark:text-white' : 'text-apple-gray'}`}>
                      {algo.name}
                    </p>
                    <p className="text-sm text-apple-gray mt-0.5">
                      {algo.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
          <button
            onClick={() => setExpanded(false)}
            className="text-sm text-apple-gray hover:text-apple-black dark:hover:text-white"
          >
            Skjul
          </button>
        </div>
      )}

      {!expanded && selectedAlgo && (
        <p className="text-sm text-apple-gray">
          {selectedAlgo.description}
        </p>
      )}
    </div>
  );
}

export default AlgorithmPicker;
