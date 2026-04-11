export const trackImpact = (eventName, params = {}) => {
  if (typeof window === 'undefined' || !eventName) {
    return;
  }

  const payload = {
    ...params,
    page_path: window.location.pathname,
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }

  // Useful for debugging or hooking custom listeners without vendor lock-in.
  window.dispatchEvent(
    new CustomEvent('habluj-impact', {
      detail: {
        eventName,
        params: payload,
      },
    }),
  );
};
