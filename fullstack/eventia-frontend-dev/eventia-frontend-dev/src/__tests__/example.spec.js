describe('Test básico de Jasmine', () => {
  it('debe pasar este test simple', () => {
    expect(true).toBe(true);
  });

  it('debe sumar correctamente', () => {
    const suma = 2 + 2;
    expect(suma).toBe(4);
  });
});
