import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../components/common/Home';

describe('Home Component', () => {
  it('renderiza el título y texto descriptivo', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

      act(() => {
    createRoot(container).render(
      <MemoryRouter>
        <Home events={[]} />
      </MemoryRouter>
    );
  });


    const h1 = container.querySelector('h1');
    const p = container.querySelector('p');

    expect(h1).not.toBeNull();
    expect(p).not.toBeNull();
    expect(h1.textContent).toContain('Eventia');
    expect(p.textContent.toLowerCase()).toContain('eventos independientes');

    document.body.removeChild(container);
  });
    // PRUEBA 2: Renderiza los botones del carrusel
  it('renderiza los indicadores del carrusel según cantidad de eventos', () => {
    const events = [
      { id: 1, title: 'Evento A', image: 'a.jpg' },
      { id: 2, title: 'Evento B', image: 'b.jpg' },
      { id: 3, title: 'Evento C', image: 'c.jpg' }
    ];

    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      const root = createRoot(container);
      root.render(
        <MemoryRouter>
          <Home events={events} />
        </MemoryRouter>
      );
    });

    const buttons = container.querySelectorAll('.carousel-indicators button');
    expect(buttons.length).toBe(3);
  });

  // PRUEBA 3: Renderiza las tres tarjetas de secciones
  it('muestra las tres tarjetas de secciones principales', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      const root = createRoot(container);
      root.render(
        <MemoryRouter>
          <Home events={[]} />
        </MemoryRouter>
      );
    });

    const cards = container.querySelectorAll('.card');
    expect(cards.length).toBe(3);
  });

});
