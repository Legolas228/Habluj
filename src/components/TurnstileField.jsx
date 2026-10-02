import React, { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const SCRIPT_ID = 'cloudflare-turnstile-script';

const TurnstileField = ({ onToken }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return undefined;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || containerRef.current.dataset.rendered) return;
      window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      });
      containerRef.current.dataset.rendered = 'true';
    };

    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      renderWidget();
    }

    return () => {
      if (containerRef.current && window.turnstile && containerRef.current.dataset.rendered) {
        window.turnstile.remove(containerRef.current);
      }
    };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="min-h-[65px]" aria-label="Verificación de seguridad" />;
};

export default TurnstileField;
