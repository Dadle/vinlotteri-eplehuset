import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { statisticsApi } from '../api/client';
import { useToastContext } from '../App';
import type { Statistics as StatsType, ParticipantStats } from '../types';

function Statistics() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  const toast = useToastContext();

  const loadStats = useCallback(async () => {
    try {
      const data = await statisticsApi.get();
      setStats(data);
    } catch (err) {
      toast.error('Kunne ikke laste statistikk');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleExport = () => {
    window.open(statisticsApi.exportUrl(), '_blank');
  };

  const maxWins = stats ? Math.max(...stats.participants.map(p => p.wins), 1) : 1;

  // Colors for pie chart - gold themed
  const pieColors = [
    '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#78716c', '#57534e', '#44403c', '#292524', '#1c1917',
  ];

  const createConicGradient = (participants: ParticipantStats[]) => {
    if (!participants.length) return 'conic-gradient(#e5e7eb 0deg 360deg)';
    
    const totalWins = participants.reduce((sum, p) => sum + p.wins, 0);
    if (totalWins === 0) return 'conic-gradient(#e5e7eb 0deg 360deg)';

    const segments: string[] = [];
    let currentAngle = 0;

    participants.filter(p => p.wins > 0).forEach((p, i) => {
      const angle = (p.wins / totalWins) * 360;
      const color = pieColors[i % pieColors.length];
      segments.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    });

    return `conic-gradient(${segments.join(', ')})`;
  };

  return (
    <div className="space-y-10">
      {/* Header with decorative chart icon */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-apple-black dark:text-white tracking-tight">
              Statistikk
            </h1>
            <p className="text-apple-gray mt-1 text-lg">
              Gevinstfordeling og analyse
            </p>
          </div>
        </div>

        <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Eksporter CSV
        </button>
      </div>

      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-apple-gray" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : !stats || stats.participants.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-apple-lightgray dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-apple-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-apple-black dark:text-white font-medium">Ingen statistikk ennå</p>
          <p className="text-sm text-apple-gray mt-1">
            Kjør noen trekninger for å se statistikk
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Totalt trekninger', value: stats.totals.total_draws },
              { label: 'Unike deltakere', value: stats.totals.unique_participants },
              { label: 'Totalt deltakelser', value: stats.totals.total_participations },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <p className="text-sm text-apple-gray uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-4xl font-semibold text-apple-black dark:text-white mt-2">
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Bar chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h2 className="text-xl font-semibold text-apple-black dark:text-white mb-6">
                Gevinstfordeling
              </h2>
              
              <div className="space-y-4">
                {stats.participants.slice(0, 10).map((p, i) => (
                  <div key={p.name} className="flex items-center gap-4">
                    <span className="w-28 text-sm text-apple-gray truncate" title={p.name}>
                      {p.name}
                    </span>
                    <div className="flex-1 h-8 bg-apple-lightgray dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.wins / maxWins) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full"
                      />
                    </div>
                    <span className="w-8 text-sm font-semibold text-gold-600 dark:text-gold-400 text-right">
                      {p.wins}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pie chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h2 className="text-xl font-semibold text-apple-black dark:text-white mb-6">
                Vinnerprosent
              </h2>

              <div className="flex flex-col items-center">
                <div
                  className="w-48 h-48 rounded-full shadow-inner"
                  style={{ background: createConicGradient(stats.participants) }}
                />

                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
                  {stats.participants.filter(p => p.wins > 0).slice(0, 8).map((p, i) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: pieColors[i % pieColors.length] }}
                      />
                      <span className="text-sm text-apple-gray truncate" title={p.name}>
                        {p.name}
                      </span>
                      <span className="text-sm font-medium text-apple-black dark:text-white">
                        {p.win_rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Full table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-apple-black dark:text-white">
                Detaljert statistikk
              </h2>
            </div>
            <div className="table-container border-0 rounded-none">
              <table className="table">
                <thead>
                  <tr>
                    <th>Navn</th>
                    <th className="text-center">Gevinster</th>
                    <th className="text-center">Deltakelser</th>
                    <th className="text-center">Lodd</th>
                    <th className="text-center">Vinnerrate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.participants.map((p) => (
                    <tr key={p.name}>
                      <td className="font-medium">{p.name}</td>
                      <td className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 font-semibold">
                          {p.wins}
                        </span>
                      </td>
                      <td className="text-center">{p.total_participations}</td>
                      <td className="text-center">{p.total_tickets}</td>
                      <td className="text-center">
                        <span className="font-medium text-apple-gray">
                          {p.win_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default Statistics;
