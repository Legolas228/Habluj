import React from "react";
import Routes from "./Routes";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
