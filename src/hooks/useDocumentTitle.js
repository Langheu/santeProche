import { useEffect } from 'react';
import { SITE } from '../site.js';

export const SITE_TITLE = `${SITE.name} — ${SITE.tagline}`;

// Définit le titre de l'onglet : "<titre> | SantéProche — ..."
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} | ${SITE_TITLE}`;
  }, [title]);
}
