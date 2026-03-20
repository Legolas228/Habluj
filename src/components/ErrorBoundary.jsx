import React from "react";
import Icon from "./AppIcon";

const getUiLanguage = () => {
  try {
    const stored = localStorage.getItem("language");
    if (stored === "es" || stored === "cz" || stored === "sk") {
      return stored;
    }
  } catch (error) {
    console.warn("Could not read language from localStorage:", error);
  }
  return "sk";
};

const copyByLanguage = {
  sk: {
    title: "Niečo sa pokazilo",
    description: "Pri načítaní stránky nastala neočakávaná chyba. Skúste sa vrátiť na úvod.",
    back: "Späť na úvod",
  },
  cz: {
    title: "Něco se pokazilo",
    description: "Při načítání stránky došlo k neočekávané chybě. Zkuste se vrátit na úvod.",
    back: "Zpět na úvod",
  },
  es: {
    title: "Se ha producido un error",
    description: "Se ha producido un error inesperado al cargar la página. Vuelva al inicio para continuar.",
    back: "Volver al inicio",
  },
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, language: getUiLanguage() };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    error.__ErrorBoundary = true;
    window.__COMPONENT_ERROR__?.(error, errorInfo);
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state?.hasError) {
      const copy = copyByLanguage[this.state.language] || copyByLanguage.sk;
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center p-8 max-w-md">
            <div className="flex justify-center items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="42px" height="42px" viewBox="0 0 32 33" fill="none">
                <path d="M16 28.5C22.6274 28.5 28 23.1274 28 16.5C28 9.87258 22.6274 4.5 16 4.5C9.37258 4.5 4 9.87258 4 16.5C4 23.1274 9.37258 28.5 16 28.5Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" />
                <path d="M11.5 15.5C12.3284 15.5 13 14.8284 13 14C13 13.1716 12.3284 12.5 11.5 12.5C10.6716 12.5 10 13.1716 10 14C10 14.8284 10.6716 15.5 11.5 15.5Z" fill="currentColor" />
                <path d="M20.5 15.5C21.3284 15.5 22 14.8284 22 14C22 13.1716 21.3284 12.5 20.5 12.5C19.6716 12.5 19 13.1716 19 14C19 14.8284 19.6716 15.5 20.5 15.5Z" fill="currentColor" />
                <path d="M21 22.5C19.9625 20.7062 18.2213 19.5 16 19.5C13.7787 19.5 12.0375 20.7062 11 22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 text-center text-foreground">
              <h1 className="text-2xl font-headlines font-semibold">{copy.title}</h1>
              <p className="text-muted-foreground text-base max-w-xs mx-auto">{copy.description}</p>
            </div>
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Icon name="ArrowLeft" size={18} color="#fff" />
                {copy.back}
              </button>
            </div>
          </div >
        </div >
      );
    }

    return this.props?.children;
  }
}

export default ErrorBoundary;
