import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SITE } from '../site.js';

const ITEMS = [
  { label: 'ACCUEIL', to: '/', end: true },
  { label: 'MEDICAMENTS', to: '/medicaments' },
  { label: 'CLINIQUES', to: '/cliniques' },
  { label: 'PHARMACIES', to: '/pharmacies' },
  { label: 'MON ORDONNANCE', to: '/scanner-ordonnance' },
  { label: 'CONTACTEZ-NOUS', to: '/contact' },
];

export default function Menu() {
  const [collapsed, setCollapsed] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [stickyHeight, setStickyHeight] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setStickyHeight(document.querySelector('.navbar-sticky')?.offsetHeight || 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setCollapsed(true), [pathname]);

  const sticky = scrollY >= 300;

  return (
    <>
      <header className={`navbar-light navbar-sticky header-static${sticky ? ' navbar-sticky-on' : ''}`}>
        <nav className="navbar navbar-expand-xl">
          <div className="container-fluid px-3 px-xl-5">
            <Link to="/" className="navbar-brand">
              <img src="/img/logo/logo.svg" alt={SITE.name} className="light-mode-item navbar-brand-item" />
              <img src="/img/logo/logo.svg" alt={SITE.name} className="dark-mode-item navbar-brand-item" />
            </Link>
            <button
              type="button"
              className="navbar-toggler ms-auto"
              aria-label="Toggle navigation"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(c => !c)}
            >
              <span className="navbar-toggler-animation">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <div id="navbarCollapse" className={`navbar-collapse w-100 ${collapsed ? 'collapse' : 'collapse show'}`}>
              <div className="px-4 py-4 py-xl-0"></div>
              <ul className="navbar-nav navbar-nav-scroll px-xl-5 me-auto">
                {ITEMS.map(item => (
                  <li className="nav-item" key={item.to}>
                    <NavLink to={item.to} end={item.end} className="nav-link fw-bold">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <div id="sticky-space" style={{ height: sticky ? stickyHeight + 'px' : '0px' }}></div>
    </>
  );
}
