// Este archivo carga automáticamente todos los tests *.spec.js y *.spec.jsx en /src
var context = require.context('./src', true, /\.spec\.jsx?$/);
context.keys().forEach(context);
module.exports = context;
