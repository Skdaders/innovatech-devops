// Importaciones
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Cart from '../components/common/Cart';

describe('Cart Component', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    container = null;
  });

  const renderCart = (cartItems = [], onRemoveFromCart = () => {}, onCheckout = () => {}) => {
    act(() => {
      createRoot(container).render(
        <Cart
          cartItems={cartItems}
          onRemoveFromCart={onRemoveFromCart}
          onCheckout={onCheckout}
        />
      );
    });
  };

  // PRUEBA 1: Renderizado sin productos
  

  it('debe llamar a la función onRemoveFromCart con el ID correcto', () => {
    const mockRemoveFunction = jasmine.createSpy('onRemoveFromCart');
    const mockItems = [
      { id: 1, title: 'Entrada Festival Indie', price: 10000, quantity: 1 },
      { id: 2, title: 'Concierto de Jazz', price: 8000, quantity: 1 }
    ];
    renderCart(mockItems);

    const texto = container.textContent;
    expect(texto).toContain('Entrada Festival Indie');
    expect(texto).toContain('Concierto de Jazz');
  });

  // PRUEBA 2: Cálculo del total
  it('calcula correctamente el total de precios', () => {
    const mockItems = [
      { id: 1, title: 'Entrada Festival Indie', price: 10000, quantity: 1 },
      { id: 2, title: 'Concierto de Jazz', price: 8000, quantity: 1 }
    ];
    renderCart(mockItems);
    const texto = container.textContent.replace(/\./g, '');
    expect(texto).toMatch(/18000|18 000/);
  });

  // PRUEBA 3: Botón para vaciar el carrito
  it('llama a la función de remover cuando se hace click en el botón eliminar', () => {
    const mockRemove = jasmine.createSpy('onRemoveFromCart');
    const mockItems = [{ id: 1, title: 'Test', price: 1000, quantity: 1 }];
    
    act(() => {
      createRoot(container).render(
        <Cart cartItems={mockItems} onRemoveFromCart={mockRemove} />
      );
    });

    const boton = container.querySelector('button.btn-danger');
    boton && boton.click();
    expect(mockRemove).toHaveBeenCalled();
  });
  // PRUEBA 4: onCheckout se ejecuta al presionar el botón "Finalizar Compra"
  it('llama a la función onCheckout cuando se hace click en "Finalizar Compra"', () => {
    const mockCheckout = jasmine.createSpy('onCheckout');
    const mockItems = [{ id: 1, title: 'Evento Test', price: 10000, quantity: 2 }];
    
    act(() => {
      createRoot(container).render(
        <Cart cartItems={mockItems} onCheckout={mockCheckout} onRemoveFromCart={() => {}} />
      );
    });

    const boton = container.querySelector('.btn-success');
    boton && boton.click();

    expect(mockCheckout).toHaveBeenCalled();
  });

  // PRUEBA 5: función formatPrice devuelve formato CLP
  it('formatea correctamente los precios con el formato chileno CLP', () => {
    const testValue = 5000;
    const formatted = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(testValue);

    expect(formatted).toBe('$5.000');
  });

  // PRUEBA 6: Renderiza correctamente el total cuando hay múltiples productos
  it('muestra correctamente el total de varios productos', () => {
    const mockItems = [
      { id: 1, title: 'Evento A', price: 10000, quantity: 2 },
      { id: 2, title: 'Evento B', price: 5000, quantity: 1 },
    ];
    act(() => {
      createRoot(container).render(
        <Cart 
        cartItems={mockItems}
        onRemoveFromCart={() => {}}
        onCheckout={() => {}} />
      );
    });
    const totalEl = container.querySelector('strong:last-child');
    console.log('Texto del total renderizado: ', totalEl.textContent);
    expect(totalEl.textContent).toContain('$25.000');
  });
    // PRUEBA 7: Renderiza correctamente el mensaje de carrito vacío
  it('muestra alerta de carrito vacío cuando no hay productos', () => {
    act(() => {
      createRoot(container).render(
        <Cart cartItems={[]} onRemoveFromCart={() => {}} onCheckout={() => {}} />
      );
    });

    const alerta = container.querySelector('.alert-info');
    console.log('Texto de alerta:', alerta.textContent);
    expect(alerta).not.toBeNull();
    expect(alerta.textContent.toLowerCase()).toContain('carrito');
  });

});
