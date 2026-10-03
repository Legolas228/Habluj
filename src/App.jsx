import React from "react";
import Routes from "./Routes";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <Routes />
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
