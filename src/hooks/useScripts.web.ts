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
      console.error('[useScripts.web] loadScripts error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reactively subscribe to all changes from ScriptStorage
  useEffect(() => {
    const unsubscribe = ScriptStorage.subscribe((updatedList) => {
      setScripts(updatedList);
      setIsLoading(false);
    });

    loadScripts();

    return () => {
      unsubscribe();
    };
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
    return newScript;
  }, []);

  const updateScript = useCallback(
    async (id: string, updates: Partial<Omit<Script, 'id' | 'createdAt'>>): Promise<Script | null> => {
      const updated = await ScriptStorage.update(id, updates);
      return updated;
    },
    []
  );

  const deleteScript = useCallback(async (id: string): Promise<boolean> => {
    return await ScriptStorage.delete(id);
  }, []);

  const duplicateScript = useCallback(async (id: string): Promise<Script | null> => {
    return await ScriptStorage.duplicate(id);
  }, []);

  const resetSampleScript = useCallback(async (): Promise<Script> => {
    return await ScriptStorage.resetSampleScript();
  }, []);

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
