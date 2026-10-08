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
      <Menu />
      <Outlet />
      <Footer />
      <BackToTop />
    </>
  );
}
