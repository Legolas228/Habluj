import React from 'react';

const GoogleFormEmbed = () => {
  const formUrl = 'https://docs.google.com/forms/d/1UV4AFELep0enj1zPpANxO8C-bybXuoxqyQNp-EDogVY/viewform?embedded=true';
  const formLink = 'https://docs.google.com/forms/d/1UV4AFELep0enj1zPpANxO8C-bybXuoxqyQNp-EDogVY/viewform?usp=sf_link';

  return (
    <div className="w-full space-y-6">
      {/* Embedded Form Container */}
      <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-primary/20">
        <iframe
          src={formUrl}
          width="100%"
          height="1400"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          className="rounded-lg"
          title="Formulario de Intensivos Flexibles"
          loading="lazy"
          style={{ display: 'block' }}
        >
          Cargando formulario…
        </iframe>
      </div>

      {/* Fallback Message & Link */}
      <div className="text-center p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border-2 border-dashed border-primary/30">
        <p className="text-sm text-muted-foreground mb-4">
          ¿El formulario no carga? No hay problema, puedes abrirlo aquí:
        </p>
        <a
          href={formLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
        >
          Click para abrir formulario →
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6l6-6m0 0V4m0-2h2" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default GoogleFormEmbed;
