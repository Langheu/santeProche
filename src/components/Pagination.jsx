import { displayedPages } from '../hooks/usePaginatedList.js';

export default function Pagination({ data, onChange }) {
  if (!data || data.last_page <= 1) return null;
  const { current_page: current, last_page: last } = data;

  return (
    <nav className="pagination-bar">
      <button className="pag-btn pag-btn--prev" disabled={current <= 1} onClick={() => onChange(current - 1)}>
        Précédent
      </button>
      <div className="pagination-numbers">
        {displayedPages(current, last).map((p, i) =>
          p === '...' ? (
            <span className="page-dots" key={`dots-${i}`}>...</span>
          ) : (
            <button
              key={p}
              className={`page-number btn${p === current ? ' active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button className="pag-btn pag-btn--next" disabled={current >= last} onClick={() => onChange(current + 1)}>
        Suivant
      </button>
    </nav>
  );
}
