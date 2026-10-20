import { useState, useEffect, useCallback, useMemo } from 'react';
import { Script } from '../types/script';
import { ScriptStorage } from '../services/ScriptStorage';

export function useScripts() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadScripts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ScriptStorage.getAll();
      setScripts(data);
    } catch (err) {
      console.error('[useScripts] loadScripts error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const filteredScripts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return scripts;
    return scripts.filter(
      s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [scripts, searchQuery]);

  const createScript = useCallback(async (title: string, content: string): Promise<Script> => {
    const newScript = await ScriptStorage.create(title, content);
    await loadScripts();
    return newScript;
  }, [loadScripts]);

  const updateScript = useCallback(
    async (id: string, updates: Partial<Omit<Script, 'id' | 'createdAt'>>): Promise<Script | null> => {
      const updated = await ScriptStorage.update(id, updates);
      await loadScripts();
      return updated;
    },
    [loadScripts]
  );

  const deleteScript = useCallback(async (id: string): Promise<boolean> => {
    const success = await ScriptStorage.delete(id);
    if (success) {
      await loadScripts();
    }
    return success;
  }, [loadScripts]);

  const duplicateScript = useCallback(async (id: string): Promise<Script | null> => {
    const duplicated = await ScriptStorage.duplicate(id);
    if (duplicated) {
      await loadScripts();
    }
    return duplicated;
  }, [loadScripts]);

  const resetSampleScript = useCallback(async (): Promise<Script> => {
    const sample = await ScriptStorage.resetSampleScript();
    await loadScripts();
    return sample;
  }, [loadScripts]);

  const getScriptById = useCallback(
    (id: string): Script | undefined => {
      return scripts.find(s => s.id === id);
    },
    [scripts]
  );

  return {
    scripts,
    filteredScripts,
    isLoading,
    searchQuery,
    setSearchQuery,
    createScript,
    updateScript,
    deleteScript,
    duplicateScript,
    resetSampleScript,
    getScriptById,
    refresh: loadScripts,
  };
}
