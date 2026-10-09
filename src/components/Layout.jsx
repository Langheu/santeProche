import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Menu from './Menu.jsx';
import Footer from './Footer.jsx';
import BackToTop from './BackToTop.jsx';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {import.meta.env.VITE_GITHUB_PAGES === 'true' && <div style={{ background: '#eff8f1', color: '#205b32', textAlign: 'center', padding: '8px 16px', fontSize: 13 }}>Version de démonstration · Fiches fictives · Administration et envoi de formulaires indisponibles</div>}
      <Menu />
      <Outlet />
      <Footer />
      <BackToTop />
    </>
  );
}
