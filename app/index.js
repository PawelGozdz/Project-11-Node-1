/**
 * Główny plik API
 */

 // Dependencies
 const server = require('./lib/server');
 const workers = require('./lib/workers');

// Deklaracja aplikacji
const app = {};

// Inicjalizacja
app.init = function() {
  // Uruchamianie servera
  server.init();
  // Uruchamianie workers
  // workers.init();

};

// Execute funkcji
app.init();

// Export app - do testów później
module.exports = app;
