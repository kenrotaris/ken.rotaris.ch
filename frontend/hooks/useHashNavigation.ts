import { useState, useEffect } from 'react';

/**
 * Hook to sync component state with URL hash for navigation
 * Returns [activeId, setActiveId] similar to useState
 */
export function useHashNavigation(
  validIds: string[],
  defaultId?: string
): [string, (id: string) => void] {
  const [activeId, setActiveId] = useState<string>(defaultId || validIds[0] || '');

  useEffect(() => {
    // Initialize from hash and listen for changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && validIds.includes(hash)) {
        setActiveId(hash);
      }
    };

    // Initialize on mount
    handleHashChange();

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [validIds]);

  return [activeId, setActiveId];
}
