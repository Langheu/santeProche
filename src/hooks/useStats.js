import { useEffect, useState } from 'react';
import { getStats } from '../data/api.js';
export default function useStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => { let cancelled = false; getStats().then(value => { if (!cancelled) setStats(value); }).catch(() => {}); return () => { cancelled = true; }; }, []);
  return stats;
}
