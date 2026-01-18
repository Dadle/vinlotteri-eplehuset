/**
 * Hook for managing participant templates in localStorage.
 */

import { useState, useCallback } from 'react';
import type { ParticipantTemplate, Participant } from '../types';

const STORAGE_KEY = 'vinlotteri_templates';

function loadTemplates(): ParticipantTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: ParticipantTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function useTemplates() {
  const [templates, setTemplates] = useState<ParticipantTemplate[]>(loadTemplates);

  const addTemplate = useCallback((
    name: string,
    participants: Omit<Participant, 'id' | 'is_winner'>[]
  ): ParticipantTemplate => {
    const newTemplate: ParticipantTemplate = {
      id: crypto.randomUUID(),
      name,
      participants,
      createdAt: new Date().toISOString(),
    };

    setTemplates(prev => {
      const updated = [...prev, newTemplate];
      saveTemplates(updated);
      return updated;
    });

    return newTemplate;
  }, []);

  const updateTemplate = useCallback((
    id: string,
    updates: Partial<Pick<ParticipantTemplate, 'name' | 'participants'>>
  ): void => {
    setTemplates(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, ...updates } : t
      );
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const deleteTemplate = useCallback((id: string): void => {
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const getTemplate = useCallback((id: string): ParticipantTemplate | undefined => {
    return templates.find(t => t.id === id);
  }, [templates]);

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
  };
}
