import { useState, useCallback } from 'react';
import type { Participant } from '../types';

interface ParticipantTableProps {
  participants: Omit<Participant, 'id' | 'is_winner'>[];
  onChange: (participants: Omit<Participant, 'id' | 'is_winner'>[]) => void;
  editable?: boolean;
}

function ParticipantTable({ participants, onChange, editable = true }: ParticipantTableProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editTickets, setEditTickets] = useState('');

  const totalTickets = participants.reduce((sum, p) => sum + p.ticket_count, 0);

  const startEdit = useCallback((idx: number) => {
    const p = participants[idx];
    setEditingIdx(idx);
    setEditName(p.name);
    setEditTickets(String(p.ticket_count));
  }, [participants]);

  const saveEdit = useCallback(() => {
    if (editingIdx === null) return;
    
    const name = editName.trim();
    const tickets = parseInt(editTickets, 10);
    
    if (!name || tickets < 1 || tickets > 1000) return;

    const updated = [...participants];
    updated[editingIdx] = { name, ticket_count: tickets };
    onChange(updated);
    setEditingIdx(null);
  }, [editingIdx, editName, editTickets, participants, onChange]);

  const cancelEdit = useCallback(() => {
    setEditingIdx(null);
  }, []);

  const removeParticipant = useCallback((idx: number) => {
    const updated = participants.filter((_, i) => i !== idx);
    onChange(updated);
  }, [participants, onChange]);

  const addParticipant = useCallback(() => {
    const updated = [...participants, { name: '', ticket_count: 1 }];
    onChange(updated);
    startEdit(updated.length - 1);
  }, [participants, onChange, startEdit]);

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-apple-gray">
        <p>Ingen deltakere ennå. Legg til ovenfor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-apple-gray">
          {participants.length} deltaker{participants.length !== 1 ? 'e' : ''} · {totalTickets} lodd
        </span>
        {editable && (
          <button
            onClick={addParticipant}
            className="text-apple-blue hover:underline font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Legg til
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Navn</th>
              <th className="w-24 text-center">Lodd</th>
              <th className="w-20 text-center">Sjanse</th>
              {editable && <th className="w-20"></th>}
            </tr>
          </thead>
          <tbody>
            {participants.map((p, idx) => {
              const isEditing = editingIdx === idx;
              const chance = ((p.ticket_count / totalTickets) * 100).toFixed(1);

              return (
                <tr key={idx} className={isEditing ? 'bg-apple-lightgray dark:bg-gray-800' : ''}>
                  <td className="text-apple-gray text-sm">{idx + 1}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="input py-1.5"
                        autoFocus
                        maxLength={100}
                      />
                    ) : (
                      <span className="font-medium">{p.name || <em className="text-apple-gray">Tom</em>}</span>
                    )}
                  </td>
                  <td className="text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editTickets}
                        onChange={(e) => setEditTickets(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="input py-1.5 text-center w-20"
                        min={1}
                        max={1000}
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm bg-apple-lightgray dark:bg-gray-800 text-apple-black dark:text-white font-medium">
                        {p.ticket_count}
                      </span>
                    )}
                  </td>
                  <td className="text-center text-sm text-apple-gray">
                    {chance}%
                  </td>
                  {editable && (
                    <td className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={saveEdit}
                            className="p-1.5 text-apple-green hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                            title="Lagre"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-apple-gray hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            title="Avbryt"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(idx)}
                            className="p-1.5 text-apple-gray hover:text-apple-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            title="Rediger"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeParticipant(idx)}
                            className="p-1.5 text-apple-gray hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Fjern"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ParticipantTable;
