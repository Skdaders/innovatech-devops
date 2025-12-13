import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Navigation from '../components/common/Navigation'; 

describe('Navigation Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  const renderWithRouter = (ui, route = '/') => {
    act(() => {
      createRoot(container).render(
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      );
    });
  };

  it('renderiza brand y enlaces básicos', () => {
    renderWithRouter(<Navigation />);
    const brand = container.querySelector('.navbar-brand');
    const links = Array.from(container.querySelectorAll('.nav-link')).map(a => a.textContent.trim());
    expect(brand).not.toBeNull();
    expect(links).toEqual(jasmine.arrayContaining(['Inicio', 'Eventos', 'Registro']));
  });

  it('marca activo Inicio en ruta /', () => {
    renderWithRouter(<Navigation />, '/');
    const active = container.querySelector('.nav-link.active');
    expect(active).not.toBeNull();
    expect(active.textContent).toContain('Inicio');
  });

  it('marca activo Eventos en ruta /eventos', () => {
    renderWithRouter(<Navigation />, '/eventos');
    const active = container.querySelector('.nav-link.active');
    expect(active).not.toBeNull();
    expect(active.textContent).toContain('Eventos');
  });

  it('muestra badge de carrito cuando cartItemCount > 0', () => {
    renderWithRouter(<Navigation cartItemCount={3} />, '/carrito');
    const badge = container.querySelector('.badge.bg-danger');
    expect(badge).not.toBeNull();
    expect(badge.textContent.trim()).toBe('3');
  });
});
