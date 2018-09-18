/**
 * Create and export configuration variables
 */

 // database
 const database = {
  host     : 'localhost',
  user     : 'root',
  password : false,
  database : 'rwd_db',
 };

 // Kontener dla environmentów
 const environments = {};

 // Staging (defaultowy) environment

environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'toJestTajemnica',
  'templateGlobals': {
    'appName': 'UptimeChecker',
    'companyName': 'RWD Strony Internetowe',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:3000/',
    'info': 'info',
  }
};

// Production environments
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'staging',
  'hashingSecret': 'toJestTajemnica',
  'templateGlobals': {
    'appName': 'UptimeChecker',
    'companyName': 'RWD Strony Internetowe',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:5000/',
  }
};

// Wyświetlanie ktory environment jest przekazany jako argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Sprawdzanie czy currentEnvironment jest jednym ze zdefiniowanych w obiekcie environments
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = {
  environmentToExport,
  database,
};