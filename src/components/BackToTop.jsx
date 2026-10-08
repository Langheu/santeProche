import { useEffect, useState } from 'react';

const SCROLL_OFFSET = 450;

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > SCROLL_OFFSET);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`back-top${show ? ' back-top-show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <i className="bi bi-arrow-up-short position-absolute top-50 start-50 translate-middle"></i>
    </div>
  );
}
