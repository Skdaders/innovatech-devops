import '@testing-library/jasmine-dom';
// Silencia mensaje de error en componente ('Errores en el formulario')
const originalLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes?.('Errores en el formulario')) return;
  originalLog(...args);
};

// Silencia warnings innecesarios de React y errores de recursos faltantes
const originalError = console.error;
console.error = (...args) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (
      msg.includes('act(...)') ||
      msg.includes('createRoot()') ||
      msg.includes('Invalid DOM property') ||
      msg.includes('Received `%s` for a non-boolean attribute')
    )
  ) {
    return;
  }
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('404')) {
    return;
  }
  originalWarn.apply(console, args);
};