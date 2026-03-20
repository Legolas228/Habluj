import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StudentResourcesPanel from '../pages/student-dashboard/components/StudentResourcesPanel';

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: vi.fn(),
}));

import { useTranslation } from '../hooks/useTranslation';

const labels = {
  'studentResources.genericMaterial': 'Material',
  'studentResources.title': 'Materiales de estudio',
  'studentResources.items': 'elementos',
  'studentResources.loading': 'Cargando materiales...',
  'studentResources.empty': 'Sin materiales',
  'studentResources.lessonPrefix': 'Clase',
  'studentResources.openMaterial': 'Abrir material',
  'studentResources.jumpToAdd': 'Anadir material',
  'studentResources.addTitle': 'Anadir material propio',
  'studentResources.form.title': 'Titulo',
  'studentResources.form.description': 'Descripcion',
  'studentResources.form.externalUrl': 'URL externa',
  'studentResources.form.uploadFile': 'Adjuntar archivo',
  'studentResources.form.lessonOptional': 'Asociar a clase (opcional)',
  'studentResources.form.noLesson': 'Sin clase asociada',
  'studentResources.form.saving': 'Guardando...',
  'studentResources.form.add': 'Anadir material',
  'studentResources.form.clear': 'Limpiar',
};

describe('StudentResourcesPanel', () => {
  beforeEach(() => {
    useTranslation.mockReturnValue({
      language: 'es',
      t: (key) => labels[key] || key,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows existing materials block before add form', () => {
    render(
      <StudentResourcesPanel
        materials={[
          {
            id: 1,
            title: 'Guia 1',
            description: 'Material de lectura',
            resource_type: 'pdf',
            created_at: '2026-03-20T09:00:00Z',
            uploaded_file: 'https://example.com/guia.pdf',
          },
        ]}
        isLoading={false}
        error=""
        bookings={[]}
      />,
    );

    const listHeading = screen.getByRole('heading', { name: labels['studentResources.title'] });
    const addHeading = screen.getByRole('heading', { name: labels['studentResources.addTitle'] });
    const position = listHeading.compareDocumentPosition(addHeading);

    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('scrolls to add form when quick add button is clicked', () => {
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});

    render(
      <StudentResourcesPanel
        materials={[]}
        isLoading={false}
        error=""
        bookings={[]}
      />,
    );

    const jumpButton = screen
      .getAllByRole('button', { name: labels['studentResources.jumpToAdd'] })
      .find((button) => button.getAttribute('type') === 'button');

    expect(jumpButton).toBeTruthy();
    fireEvent.click(jumpButton);

    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });
});
