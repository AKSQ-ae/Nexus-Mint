import { useState, useEffect, useCallback } from 'react';

interface FormDraft {
  id: string;
  formType: string;
  data: Record<string, any>;
  lastSaved: number;
  userId?: string;
}

export function useFormDrafts(formType: string, formId?: string) {
  const [draft, setDraft] = useState<FormDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const draftKey = `nexus_draft_${formType}_${formId || 'default'}`;

  // Load existing draft
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setDraft(parsed);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    } finally {
      setIsLoading(false);
    }
  }, [draftKey]);

  // Save draft
  const saveDraft = useCallback((data: Record<string, any>) => {
    try {
      const newDraft: FormDraft = {
        id: formId || `${formType}_${Date.now()}`,
        formType,
        data,
        lastSaved: Date.now(),
        userId: undefined // Could be enhanced with user ID
      };

      localStorage.setItem(draftKey, JSON.stringify(newDraft));
      setDraft(newDraft);
      
      console.log(`💾 Draft saved for ${formType}`);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [draftKey, formType, formId]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setDraft(null);
      console.log(`🗑️ Draft cleared for ${formType}`);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [draftKey, formType]);

  // Auto-save with debouncing
  const autoSave = useCallback((data: Record<string, any>, delay: number = 2000) => {
    const timeoutId = setTimeout(() => {
      saveDraft(data);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [saveDraft]);

  // Get time since last save
  const getTimeSinceLastSave = useCallback(() => {
    if (!draft) return null;
    
    const timeDiff = Date.now() - draft.lastSaved;
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }, [draft]);

  return {
    draft,
    isLoading,
    saveDraft,
    clearDraft,
    autoSave,
    getTimeSinceLastSave,
    hasDraft: !!draft
  };
}