import { useCallback, useEffect, useRef, useState } from 'react';

function getPosition() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve({});
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Charge une liste paginée triée par proximité de l'utilisateur.
 * `fetchPage({ lat, lng, page, search })` doit renvoyer { current_page, last_page, data }.
 */
export default function usePaginatedList(fetchPage) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const requestNumber = useRef(0);
  const position = useRef(null);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(async (page, term) => {
    if (!position.current) return;
    setLoading(true);
    setError('');
    const number = ++requestNumber.current;
    try {
      const value = await fetchRef.current({ ...position.current, page, search: term });
      if (number === requestNumber.current) setData(value);
    } catch (err) {
      if (number === requestNumber.current) setError(err.message || 'Chargement impossible.');
    } finally {
      if (number === requestNumber.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPosition().then(pos => {
      if (cancelled) return;
      position.current = pos;
      load(1, '');
    });
    return () => {
      cancelled = true;
      requestNumber.current++;
    };
  }, [load]);

  const goToPage = page => {
    if (!data || page < 1 || page > data.last_page) return;
    load(page, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { data, loading, error, search, setSearch, submitSearch: () => load(1, search), goToPage };
}

// Pages affichées dans la pagination : 1 2 3 … 27
export function displayedPages(current = 1, last = 1) {
  if (last <= 8) return Array.from({ length: last }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    for (let i = 1; i <= 8; i++) pages.push(i);
    pages.push('...', last);
  } else if (current >= last - 3) {
    pages.push(1, '...');
    for (let i = last - 7; i <= last; i++) pages.push(i);
  } else {
    pages.push(1, '...');
    for (let i = current - 2; i <= current + 2; i++) pages.push(i);
    pages.push('...', last);
  }
  return pages;
}
