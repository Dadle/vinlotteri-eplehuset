import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { drawsApi } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import { useToastContext } from '../App';
import type { DrawListItem } from '../types';

function History() {
  const [draws, setDraws] = useState<DrawListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeVoided, setIncludeVoided] = useState(false);
  const [voidingDraw, setVoidingDraw] = useState<DrawListItem | null>(null);

  const toast = useToastContext();

  const loadDraws = useCallback(async () => {
    try {
      const data = await drawsApi.list(includeVoided);
      setDraws(data);
    } catch (err) {
      toast.error('Kunne ikke laste trekningshistorikk');
    } finally {
      setLoading(false);
    }
  }, [includeVoided, toast]);

  useEffect(() => {
    loadDraws();
  }, [loadDraws]);

  const handleVoid = useCallback(async () => {
    if (!voidingDraw) return;

    try {
      await drawsApi.void(voidingDraw.id);
      toast.success('Trekning annullert');
      loadDraws();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kunne ikke annullere trekning');
    } finally {
      setVoidingDraw(null);
    }
  }, [voidingDraw, loadDraws, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const algorithmNames: Record<string, string> = {
    pure_random: 'Helt tilfeldig',
    weighted_losses: 'Vektet etter tap',
    round_robin: 'Rettferdig rundgang',
    equal_chance: 'Lik sjanse',
  };

  return (
    <div className="space-y-10">
      {/* Header with clock icon */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-apple-black dark:text-white tracking-tight">
              Historikk
            </h1>
            <p className="text-apple-gray mt-1 text-lg">
              Se tidligere trekninger
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={includeVoided}
            onChange={(e) => setIncludeVoided(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-apple-black focus:ring-apple-blue"
          />
          <span className="text-apple-gray">Vis annullerte trekninger</span>
        </label>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-apple-gray" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : draws.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-apple-lightgray dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-apple-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-apple-black dark:text-white font-medium">Ingen trekninger ennå</p>
          <p className="text-sm text-apple-gray mt-1">
            Kjør din første trekning for å se den her
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((draw, index) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card p-6 ${draw.voided_at ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-apple-black dark:text-white">
                      {draw.name}
                    </h3>
                    {draw.voided_at && (
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        Annullert
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-apple-gray">
                    <span>{formatDate(draw.performed_at || draw.created_at)}</span>
                    <span>{draw.participant_count} deltakere</span>
                    <span>{algorithmNames[draw.algorithm_used]}</span>
                  </div>

                  {(draw.wine_name || draw.wine_details) && (
                    <p className="mt-2 text-sm text-apple-blue">
                      Premie: {draw.wine_details?.display_name || draw.wine_name}
                    </p>
                  )}
                </div>

                {draw.winner_name && !draw.voided_at && (
                  <div className="md:text-right">
                    <p className="text-xs text-apple-gray uppercase tracking-wider">
                      Vinner
                    </p>
                    <p className="text-2xl font-semibold text-gold-600 dark:text-gold-400">
                      {draw.winner_name}
                    </p>
                  </div>
                )}

                {draw.can_void && (
                  <button
                    onClick={() => setVoidingDraw(draw)}
                    className="btn btn-secondary text-sm"
                  >
                    Annuller
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!voidingDraw}
        title="Annullere denne trekningen?"
        message={`Dette vil annullere "${voidingDraw?.name}" og fjerne ${voidingDraw?.winner_name}s seier fra statistikken.`}
        confirmText="Annuller trekning"
        danger
        onConfirm={handleVoid}
        onCancel={() => setVoidingDraw(null)}
      />
    </div>
  );
}

export default History;
