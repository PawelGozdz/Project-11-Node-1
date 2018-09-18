/**
 * Taski dotyczące servera 
 * 
*/


// Dependancies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const _data = require('./data');

// Inicjalizacja obiektu server
const server = {};

// TESTING
// TODO
// _data.delete('test', 'The Killers56', err => {
//   console.log('Taki błąd', err);
// });
// _data.update('test', 'Metallica', {'title': 'Kill em all', 'text': 'Pierwsza płyta'},(err) => {
//     console.log('Taki był błąd, ', err);
//   });
// _data.read('test', 'The Akuku', (err, data) => {
//     console.log('Taki był błąd, ', err);
//     console.log('Takie dane, ', data);
//   });
// _data.create('test', 'Metallica', {'title': 'Fuel', 'text': 'Some text'}, err => {
//   console.log('Taki był błąd, ', err);
// });
// TESTING END

// Tworzenie nowego servera http
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res); 
});

// Tworzenie nowego servera https
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem')),
};
server.httpsServer = https.createServer(server.httpsServerOptions,(req, res) => {
  server.unifiedServer(req, res); 
});

// Logika dla serverów http i https
server.unifiedServer = function(req, res) {
  // Parsowanie URL
  var parsedUrl = url.parse(req.url, true);

  // Pobieranie path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Pobieranie query string z obiektu
  const queryStringObject = parsedUrl.query;

  // Pobieranie metody HTTP request 
  const method = req.method.toLowerCase();

  // Pobieranie headerów jako obiekt
  const headers = req.headers;

  // Pobieranie payload (jezeli jest)
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();

    // Wybieranie który handler powinien być użyty, 'notFound' jako default
    const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Konstruowanie obiektu data (z URL) i przesyłanie go do handlera
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload': helpers.parseJsonToObject(buffer),
    };

    // Przekierowanie requesto do handlera znajdującego się w obiekcie router
    chosenHandler(data, (statusCode, payload, contentType) => {

    // Sprawdzanie typu powracających danych
    contentType = typeof(contentType) == 'string' ? contentType : 'json';

      //Sprawdzanie statusu powracającego kodu, defaultowo to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      

      // Zwracanie odpowiedzi dla specyficznych "content typów"
      let payloadString = '';
      if(contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        // Walidacja payload powracającego od handlera. Pusty object jako default, jezeli callback zwroci sam kod bez payload
        payload = typeof(payload) == 'object' ? payload : {};
        // Convert the payload to a string
        payloadString = JSON.stringify(payload);
      }

      if(contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        // Walidacja payload powracającego od handlera. Pusty object jako default, jezeli callback zwroci sam kod bez payload
        payloadString = typeof(payload) == 'string' ? payload : '';
      }

      // Zwracanie odpowiedzi wspólnych dla wszystkich "content typów"
      res.writeHead(statusCode);
      res.end(payloadString); 

      // Log the request (czyli adres z linka). Drukowanie calego html strony z requesta
    //  console.log(`Zwracanie response: ${statusCode} oraz ${payloadString}`);
    });  
  });
};

// Dostepne routery
server.router = {
  '': handlers.index,
  'services': handlers.services,
  'ping': handlers.ping,
};

server.init = function() {
  // Uruchamianei servera http 
  server.httpServer.listen(config.environmentToExport.httpPort, () => {
    console.log(`The server is listening on port ${config.environmentToExport.httpPort} in ${config.environmentToExport.envName} mode`);
  });

  // Uruchamianie nowego servera https
  server.httpsServer.listen(config.environmentToExport.httpsPort, () => {
    console.log(`The server is listening on port ${config.environmentToExport.httpsPort} in ${config.environmentToExport.envName} mode`);
  });
};

// Export server
module.exports = server;
