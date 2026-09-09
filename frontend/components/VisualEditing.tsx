'use client';

import { useEffect } from 'react';

/**
 * Boots the Directus visual-editing overlay, but only when the page is being
 * framed by the Directus Studio. Ordinary visitors never load the library:
 * the import is dynamic and sits behind the iframe check.
 */
export default function VisualEditing({ directusUrl }: { directusUrl?: string }) {
  useEffect(() => {
    if (!directusUrl) return;
    // Not framed -> a normal visit, nothing to do.
    if (window.self === window.top) return;

    let disable: (() => void) | undefined;

    import('@directus/visual-editing')
      .then(({ apply }) => {
        const result = apply({
          directusUrl,
          onSaved: () => {
            // The page is statically cached, so a plain reload can still show
            // the old value. The Directus publish flow revalidates on save;
            // this brief wait lets that land before we re-fetch.
            setTimeout(() => window.location.reload(), 1200);
          },
        }) as unknown as { disable?: () => void } | undefined;
        disable = result?.disable;
      })
      .catch((err) => console.error('[visual-editing] failed to init:', err));

    return () => disable?.();
  }, [directusUrl]);

  return null;
}
