import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParticipantTemplate, Participant } from '../types';

interface TemplateManagerProps {
  templates: ParticipantTemplate[];
  currentParticipants: Omit<Participant, 'id' | 'is_winner'>[];
  onLoad: (participants: Omit<Participant, 'id' | 'is_winner'>[]) => void;
  onSave: (name: string, participants: Omit<Participant, 'id' | 'is_winner'>[]) => void;
  onDelete: (id: string) => void;
}

function TemplateManager({
  templates,
  currentParticipants,
  onLoad,
  onSave,
  onDelete,
}: TemplateManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSave = () => {
    if (!newName.trim() || currentParticipants.length === 0) return;
    onSave(newName.trim(), currentParticipants);
    setNewName('');
    setIsSaving(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        Maler
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute right-0 top-full mt-2 w-72 card z-50 overflow-hidden shadow-xl"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-apple-black dark:text-white">
                  Deltakermaler
                </h3>
                <p className="text-xs text-apple-gray mt-1">
                  Lagre og gjenbruk deltakerlister
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {templates.length === 0 ? (
                  <p className="p-4 text-sm text-apple-gray text-center">
                    Ingen lagrede maler
                  </p>
                ) : (
                  <ul>
                    {templates.map((template) => (
                      <li
                        key={template.id}
                        className="flex items-center justify-between p-3 hover:bg-apple-lightgray dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 last:border-b-0 transition-colors"
                      >
                        <button
                          onClick={() => {
                            onLoad(template.participants);
                            setIsOpen(false);
                          }}
                          className="flex-1 text-left"
                        >
                          <span className="font-medium text-apple-black dark:text-white">
                            {template.name}
                          </span>
                          <span className="text-xs text-apple-gray ml-2">
                            ({template.participants.length})
                          </span>
                        </button>
                        <button
                          onClick={() => onDelete(template.id)}
                          className="p-1.5 text-apple-gray hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Slett mal"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-apple-lightgray dark:bg-gray-800">
                {isSaving ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      placeholder="Malnavn"
                      className="input py-2 text-sm flex-1"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      disabled={!newName.trim() || currentParticipants.length === 0}
                      className="btn btn-primary py-2 px-3 text-sm disabled:opacity-50"
                    >
                      Lagre
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSaving(true)}
                    disabled={currentParticipants.length === 0}
                    className="w-full text-sm text-apple-blue hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                  >
                    + Lagre gjeldende som mal
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TemplateManager;
