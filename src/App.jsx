import React from "react";
import Routes from "./Routes";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
      <SpeedInsights />
    </LanguageProvider>
  );
}

export default App;

