export default function SearchHero({ title, subtitle, placeholder, value, onChange, onSubmit }) {
  return (
    <section
      className="bg-success align-items-center d-flex"
      style={{ background: 'url(/assets/images/pattern/04.png) no-repeat center center', backgroundSize: 'cover' }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <h3 className="text-white">{title}</h3>
            <p className="hero__subtitle">{subtitle}</p>
            <div className="search-wrap">
              <form
                className="search-box"
                onSubmit={e => {
                  e.preventDefault();
                  onSubmit();
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  placeholder={placeholder}
                  className="search-input"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                />
                <button type="submit" className="search-btn">
                  <span>Rechercher</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
