export const trackImpact = (eventName, params = {}) => {
  if (typeof window === 'undefined' || !eventName) {
    return;
  }

  const payload = {
    ...params,
    page_path: window.location.pathname,
  };

  // Keep events local until an explicit analytics consent mechanism is enabled.
  window.dispatchEvent(
    new CustomEvent('habluj-impact', {
      detail: {
        eventName,
        params: payload,
      },
    }),
  );
};
