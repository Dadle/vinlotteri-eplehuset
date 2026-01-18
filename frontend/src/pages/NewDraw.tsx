import { useState, useCallback } from 'react';
import ParticipantInput from '../components/ParticipantInput';
import ParticipantTable from '../components/ParticipantTable';
import AlgorithmPicker from '../components/AlgorithmPicker';
import TemplateManager from '../components/TemplateManager';
import WineSelector from '../components/WineSelector';
import ConfirmModal from '../components/ConfirmModal';
import WinnerReveal from '../components/WinnerReveal';
import { drawsApi } from '../api/client';
import { useTemplates } from '../hooks/useTemplates';
import { useToastContext } from '../App';
import type { Participant, AlgorithmKey, Draw, WineListItem } from '../types';

function NewDraw() {
  const [participants, setParticipants] = useState<Omit<Participant, 'id' | 'is_winner'>[]>([]);
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>('pure_random');
  const [drawName, setDrawName] = useState('');
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [selectedWine, setSelectedWine] = useState<WineListItem | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [completedDraw, setCompletedDraw] = useState<Draw | null>(null);
  const [previewWinner, setPreviewWinner] = useState<string | null>(null);

  const { templates, addTemplate, deleteTemplate } = useTemplates();
  const toast = useToastContext();

  const handleParticipantsLoaded = useCallback((loaded: Omit<Participant, 'id' | 'is_winner'>[]) => {
    const merged = [...participants];
    const existingNames = new Map(participants.map((p, i) => [p.name.toLowerCase(), i]));

    for (const p of loaded) {
      const normalizedName = p.name.toLowerCase();
      if (existingNames.has(normalizedName)) {
        const idx = existingNames.get(normalizedName)!;
        merged[idx].ticket_count += p.ticket_count;
      } else {
        existingNames.set(normalizedName, merged.length);
        merged.push(p);
      }
    }

    setParticipants(merged);
    toast.success(`Lastet inn ${loaded.length} deltaker(e)`);
  }, [participants, toast]);

  const handleClearParticipants = useCallback(() => {
    setParticipants([]);
    setShowClearConfirm(false);
    toast.info('Deltakere fjernet');
  }, [toast]);

  const handleWineChange = useCallback((wineId: number | null, wine: WineListItem | null) => {
    setSelectedWineId(wineId);
    setSelectedWine(wine);
  }, []);

  const handlePreview = useCallback(async () => {
    if (participants.length === 0) return;

    setIsLoading(true);
    try {
      const draw = await drawsApi.create({
        name: drawName || undefined,
        algorithm_used: algorithm,
        wine: selectedWineId,
        participants: participants.filter(p => p.name.trim()),
      });

      const result = await drawsApi.preview(draw.id, { algorithm });
      setPreviewWinner(result.winner_name);
      toast.info(`Forhåndsvisning: ${result.winner_name} ville vunnet`);

      await drawsApi.delete(draw.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Forhåndsvisning feilet');
    } finally {
      setIsLoading(false);
    }
  }, [participants, algorithm, drawName, selectedWineId, toast]);

  const handleExecuteDraw = useCallback(async () => {
    if (participants.length === 0) return;

    setIsLoading(true);
    try {
      const draw = await drawsApi.create({
        name: drawName || undefined,
        algorithm_used: algorithm,
        wine: selectedWineId,
        participants: participants.filter(p => p.name.trim()),
      });

      const result = await drawsApi.perform(draw.id, { algorithm });
      setCompletedDraw(result);
      setShowReveal(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Trekning feilet');
    } finally {
      setIsLoading(false);
    }
  }, [participants, algorithm, drawName, selectedWineId, toast]);

  const handleRevealClose = useCallback(() => {
    setShowReveal(false);
    setParticipants([]);
    setDrawName('');
    setSelectedWineId(null);
    setSelectedWine(null);
    setCompletedDraw(null);
    setPreviewWinner(null);
    toast.success('Trekning fullført!');
  }, [toast]);

  const validParticipants = participants.filter(p => p.name.trim());

  return (
    <div className="space-y-10">
      {/* Header with Eplehuset branding */}
      <div className="text-center relative">
        {/* Decorative floating particles - blue and gold mix */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full animate-float ${i % 3 === 0 ? 'bg-blue-400/40' : 'bg-gold-400/40'}`}
              style={{
                left: `${8 + i * 10}%`,
                top: `${12 + (i % 5) * 18}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Eplehuset apple icon with wine glass overlay - blue gradient */}
        <div className="inline-block mb-6 relative">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-2xl animate-float" style={{
            boxShadow: '0 20px 60px rgba(0, 113, 227, 0.4)'
          }}>
            {/* Apple shape */}
            <svg className="w-14 h-14" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 6C20 6 17 4 14 6C11 8 10 11 10 14C10 17 11 20 13 23C15 26 17 28 20 28C23 28 25 26 27 23C29 20 30 17 30 14C30 11 29 8 26 6C23 4 20 6 20 6Z"
                className="fill-white"
              />
              <path
                d="M20 6C20 6 21 3 24 2"
                className="stroke-white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Wine glass silhouette inside apple */}
              <path
                d="M20 10C20 10 17 14 17 18C17 21 18.5 23 20 23C21.5 23 23 21 23 18C23 14 20 10 20 10Z"
                className="fill-gold-400"
              />
              <path
                d="M20 23V26M18 26H22"
                className="stroke-gold-400"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Blue glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-blue-500/40 blur-3xl animate-pulse" />
        </div>

        {/* Title with blue gradient accent */}
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          <span className="text-apple-black dark:text-white">Vin</span>
          <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-gold-500 bg-clip-text text-transparent">lotteri</span>
        </h1>
        <p className="text-apple-gray mt-3 text-lg">
          Legg til deltakere og snurr for å vinne
        </p>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left column - Participants */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-apple-black dark:text-white">
                Deltakere
              </h2>
              <TemplateManager
                templates={templates}
                currentParticipants={participants}
                onLoad={setParticipants}
                onSave={addTemplate}
                onDelete={deleteTemplate}
              />
            </div>
            <ParticipantInput onParticipantsLoaded={handleParticipantsLoaded} />
          </div>

          {participants.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-apple-black dark:text-white">
                  Deltakerliste
                </h2>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Fjern alle
                </button>
              </div>
              <ParticipantTable
                participants={participants}
                onChange={setParticipants}
              />
            </div>
          )}
        </div>

        {/* Right column - Draw settings */}
        <div className="space-y-6">
          <div className="card p-6 space-y-6">
            <h2 className="text-xl font-semibold text-apple-black dark:text-white">
              Trekningsinnstillinger
            </h2>

            <div>
              <label htmlFor="drawName" className="label">
                Navn på trekning
              </label>
              <input
                id="drawName"
                type="text"
                value={drawName}
                onChange={(e) => setDrawName(e.target.value)}
                placeholder="f.eks. Fredagens vintrekning"
                className="input"
              />
            </div>

            {/* Wine Selector */}
            <div className="relative">
              <WineSelector
                value={selectedWineId}
                onChange={handleWineChange}
              />
            </div>

            {/* Selected wine info */}
            {selectedWine && (
              <div className="p-4 rounded-xl bg-apple-lightgray dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-apple-gray">Valgt premie</p>
                <p className="text-lg font-semibold text-apple-black dark:text-white mt-1">
                  {selectedWine.display_name}
                </p>
                {selectedWine.producer && (
                  <p className="text-sm text-apple-gray">fra {selectedWine.producer}</p>
                )}
              </div>
            )}

            <AlgorithmPicker value={algorithm} onChange={setAlgorithm} />
          </div>

          {previewWinner && (
            <div className="card p-5 bg-gold-50 dark:bg-gold-900/20 border-gold-200 dark:border-gold-800">
              <p className="text-sm text-apple-gray">Forhåndsvisningsresultat:</p>
              <p className="text-xl font-semibold text-gold-600 dark:text-gold-400 mt-1">
                {previewWinner}
              </p>
              <p className="text-xs text-apple-gray mt-2">
                Dette er kun en forhåndsvisning — kjør trekningen for å gjøre den offisiell
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePreview}
                disabled={validParticipants.length === 0 || isLoading}
                className="btn btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forhåndsvis
              </button>
              <button
                onClick={handleExecuteDraw}
                disabled={validParticipants.length === 0 || isLoading}
                className={`flex-1 py-4 text-base rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden ${
                  validParticipants.length > 0 && !isLoading
                    ? 'bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 text-apple-black shadow-lg hover:shadow-xl hover:scale-[1.02]'
                    : 'bg-apple-black text-white dark:bg-white dark:text-apple-black'
                }`}
                style={validParticipants.length > 0 && !isLoading ? {
                  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)',
                } : undefined}
              >
                {/* Animated shine effect */}
                {validParticipants.length > 0 && !isLoading && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Trekker...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kjør trekning
                    </>
                  )}
                </span>
              </button>
            </div>
            {validParticipants.length === 0 && (
              <p className="text-sm text-apple-gray text-center mt-4">
                Legg til deltakere for å aktivere trekningen
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Fjern deltakere?"
        message="Dette vil fjerne alle deltakere fra den nåværende trekningen. Denne handlingen kan ikke angres."
        confirmText="Fjern alle"
        danger
        onConfirm={handleClearParticipants}
        onCancel={() => setShowClearConfirm(false)}
      />

      <WinnerReveal
        isOpen={showReveal}
        participants={participants}
        winnerName={completedDraw?.winner_name || null}
        wineName={completedDraw?.wine_name || selectedWine?.display_name}
        onClose={handleRevealClose}
      />
    </div>
  );
}

export default NewDraw;
