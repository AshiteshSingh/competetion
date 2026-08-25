export function HouseIcon({ house, className = '' }) {
  if (house === 'red') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Phoenix / Flame Crest */}
        <path d="M12 2c.5 3 2.5 5 4.5 7 2 2 3 4.5 3 7.5a7.5 7.5 0 0 1-15 0c0-3 1-5.5 3-7.5 2-2 4-4 4.5-7z" />
        <path d="M12 9c.5 2 1.5 3 2.5 4 1 1 1.5 2 1.5 3.5a4 4 0 0 1-8 0c0-1.5.5-2.5 1.5-3.5 1-1 2-2 2.5-4z" fill="currentColor" fillOpacity="0.3" />
        <path d="M8.5 16.5c.5.8 1.5 1.5 3.5 1.5s3-0.7 3.5-1.5" />
      </svg>
    );
  }

  if (house === 'blue') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Lightning Falcon / Shark Crest */}
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        <path d="M12 6l-5 6h5l-.5 4 5.5-6h-5l.5-4z" fill="currentColor" fillOpacity="0.3" />
      </svg>
    );
  }

  if (house === 'yellow') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Sun & Eagle Crown Crest */}
        <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.3" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M4.93 19.07l1.41-1.41" />
        <path d="M17.66 6.34l1.41-1.41" />
        <path d="M8 15l4-3 4 3" />
      </svg>
    );
  }

  if (house === 'green') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Emerald Dragon / Serpent Shield */}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" strokeWidth="2" />
        <path d="M12 6v4" />
      </svg>
    );
  }

  return null;
}
