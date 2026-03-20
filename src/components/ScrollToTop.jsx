import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);

      // Delay slightly so lazy-loaded routes can render the target node.
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setTimeout(() => {
          const delayedEl = document.getElementById(id);
          if (delayedEl) {
            delayedEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 80);
      }
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
