import { useState, useRef, useCallback } from 'react';
import type { Participant } from '../types';

interface ParticipantInputProps {
  onParticipantsLoaded: (participants: Omit<Participant, 'id' | 'is_winner'>[]) => void;
}

function ParticipantInput({ onParticipantsLoaded }: ParticipantInputProps) {
  const [inputMode, setInputMode] = useState<'paste' | 'csv'>('paste');
  const [textValue, setTextValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseParticipants = useCallback((text: string): Omit<Participant, 'id' | 'is_winner'>[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const participants: Omit<Participant, 'id' | 'is_winner'>[] = [];
    const seenNames = new Map<string, number>();

    for (const line of lines) {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      const name = parts[0];
      
      if (!name || name.length === 0) continue;
      if (name.length > 100) {
        throw new Error(`Name too long (max 100 chars): "${name.substring(0, 20)}..."`);
      }

      let ticketCount = 1;
      if (parts.length > 1 && parts[1]) {
        const parsed = parseInt(parts[1], 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 1000) {
          throw new Error(`Invalid ticket count for "${name}": must be 1-1000`);
        }
        ticketCount = parsed;
      }

      const normalizedName = name.toLowerCase();
      if (seenNames.has(normalizedName)) {
        const existingIdx = seenNames.get(normalizedName)!;
        participants[existingIdx].ticket_count += ticketCount;
      } else {
        seenNames.set(normalizedName, participants.length);
        participants.push({ name, ticket_count: ticketCount });
      }
    }

    return participants;
  }, []);

  const handleTextSubmit = useCallback(() => {
    setParseError(null);
    try {
      const participants = parseParticipants(textValue);
      if (participants.length === 0) {
        setParseError('No valid participants found');
        return;
      }
      onParticipantsLoaded(participants);
      setTextValue('');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse input');
    }
  }, [textValue, parseParticipants, onParticipantsLoaded]);

  const handleFileRead = useCallback((file: File) => {
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const participants = parseParticipants(text);
        if (participants.length === 0) {
          setParseError('No valid participants found in file');
          return;
        }
        onParticipantsLoaded(participants);
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse file');
      }
    };
    reader.onerror = () => setParseError('Failed to read file');
    reader.readAsText(file);
  }, [parseParticipants, onParticipantsLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'text/plain')) {
      handleFileRead(file);
    } else {
      setParseError('Please drop a CSV or text file');
    }
  }, [handleFileRead]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  }, [handleFileRead]);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-apple-lightgray dark:bg-gray-800 rounded-full w-fit">
        <button
          onClick={() => setInputMode('paste')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            inputMode === 'paste'
              ? 'bg-white dark:bg-gray-700 text-apple-black dark:text-white shadow-sm'
              : 'text-apple-gray hover:text-apple-black dark:hover:text-white'
          }`}
        >
          Lim inn tekst
        </button>
        <button
          onClick={() => setInputMode('csv')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            inputMode === 'csv'
              ? 'bg-white dark:bg-gray-700 text-apple-black dark:text-white shadow-sm'
              : 'text-apple-gray hover:text-apple-black dark:hover:text-white'
          }`}
        >
          Last opp CSV
        </button>
      </div>

      {/* Error message */}
      {parseError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {parseError}
        </div>
      )}

      {/* Paste mode */}
      {inputMode === 'paste' && (
        <div className="space-y-3">
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={`Skriv inn deltakere (én per linje):\nOla Nordmann, 2\nKari Hansen, 1\nPer Olsen`}
            rows={8}
            className="textarea font-mono text-sm"
          />
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-apple-gray leading-relaxed">
              Format: Navn, lodd (lodd valgfritt, standard 1)
            </p>
            <button
              onClick={handleTextSubmit}
              disabled={!textValue.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              Last inn deltakere
            </button>
          </div>
        </div>
      )}

      {/* CSV mode */}
      {inputMode === 'csv' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-apple-blue bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-apple-blue text-white' : 'bg-apple-lightgray dark:bg-gray-800 text-apple-gray'
            }`}>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
            <p className="font-medium text-apple-black dark:text-white">
              Slipp CSV-fil her eller klikk for å bla
            </p>
            <p className="text-sm text-apple-gray mt-1">
              Støtter CSV med kolonner: Navn, Lodd
            </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipantInput;
