/**
 * Request handlers
*/

// Dependencies
const helpers = require('./helpers');
const mysql = require('mysql');
const config = require('./config');


// Define the handlers
const handlers = {};

/** POBIERANIE ZNIENNYCH Z BD, KTORE BĘDĄ PODMIENIANE W TEMPLATKACH HTML */
// handlers.getDynamicRecordsFromDb = function(template, callback) {
//   /**Wyciaganie Template z DB ------------------------*/
//   // Database connection
//   const db = mysql.createConnection({
//     host: config.database.host,
//     user: config.database.user,
//     password: config.database.password,
//     database: config.database.database,
//   });


//   db.connect((conErr) => {
//     if(conErr) { 
//       console.log('Errow z połączeniem, ', conErr.stack);
//     } else { 
//       console.log('DB connected!, ', db.threadId);
//     }
//   });
//   // BodyDb musi miec headersy takie jak w bazie danych
//   // Insert to DB

//   let sql = `SELECT * FROM templates WHERE template_id="${template}"`;

//   db.query(sql, (err, results, fields) => { 
//     if(!err && results && typeof(results) == 'object') {
//       const resObj = JSON.parse(JSON.stringify(results[0]));
//       callback(err, resObj);
//     } else {
//       callback('Nastąpił błąd podczas wybierania danych z BD. Sprawdz, czy taki record istnieje.');
//     }
//   });

//   db.end(err => {
//     if(!err) {
//       console.log('Połączenie zakończono');
//     } else {
//       console.log('Coś nie tak z zakańczaniem połączenia z db!');
//     }
//   });
//   /**END INSERTING INTO DB ---------------------------*/
// }

/** -----------------------SPRAWDZANIE getDynamicRecordsFromDb()  */

 
// console.log('Results: ', typeof(templateData), '----', templateData);
// console.log('Check templateData ', typeof(templateData));
// console.log('Check templateData ', templateData);
/** -----------------------***END*** SPRAWDZANIE getDynamicRecordsFromDb()  */

/** ***END*** POBIERANIE ZNIENNYCH Z BD, KTORE BĘDĄ PODMIENIANE W TEMPLATKACH HTML */

/*
* HTML handlers
* 
*/

// Index handler
handlers.index = function(data, callback) {
  
  // Odrzucanie zapytań, które nie są GET
  if(data.method == 'get') {
    // Przygotowanie danych do interpolacji
    const templateData = {
      "head_title": "Tworzenie stron WWW",
      "head_description": "Tworzenie interaktywnych i responsywnych stron WWW dopasowanych do wszystkich urządzeń. Starachowice, Skarżysko Kamienna, Ostrowiec Świętokrzyski",
      "head_classification": "Analiza potrzeb klienta, jego produktów i produktów jego konkurencji, UX/UI Design - preferencje i wygląd, development, wdrażanie i hosting. Zmiana wyglądu oraz funkcjonalności strony",
      "head_subtitle": "Starachowice",
      "head_keywords": "Strony internetowe, Responsywność, SEO, strony WWW, sklepy internetowe",
      "body_h1": "H1 strony index.html"
    };

    /**
     * Pobieranie zmiennych do podmiany z BD---------------------------------------
     */

     /**------ dane z DB przekazane do 'getTemplate', ładują się za późno i nie na czas wywołania 'getTemplate'. Przekazywany jest undefined zamiast recordów z BD  --------------- */
    // const dbData =  handlers.getDynamicRecordsFromDb('index', (err, res) => {
    //   let records = "";
    //   // console.log('Results: ', typeof(res), '----', res);
      
    //   if(!err && typeof(res) == 'object' ) {
    //     records = res;
    
    //   } else {
    //     console.log('Coś nie tak z obiektem z BD, sprawdź Error: ', err);
    //   }
    //   // console.log(records);
    //   console.log('111111Db Data records: ', records);
    //   return JSON.stringify(records);
    // });
    // console.log('2222222222DB records: ', dbData);
    /**
     * END ******  Pobieranie zmiennych do podmiany z BD---------------------------------------
     */
    
    // Problem jest z dbData, które zwraca obiekt z db, który później jest niewidoczny
    
    // Wczytanie odpowiedniego template html i odesłanie go jako string
    helpers.getTemplate('index', templateData, function(err, str) {
      // console.log('Obj records: ', templateData);
      // console.log(dbData == templateData);

      if(!err && str) {
        // Wywołanie universalTemplate i dodanie healera i footera
        helpers.addUniversalTemplates(str, templateData, function(err, str) {
          if(!err && str) {
            // Zwracanie pełnego stringa z zawartościa strony
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        console.log('Error lub brak str.', err);
        callback(500, undefined, 'html');
      }
    })

  } else {
    callback(405, undefined, 'html');
  }
}

// Services handler
handlers.services = function(data, callback) {
  
  // Odrzucanie zapytań, które nie są GET
  if(data.method == 'get') {
    // Przygotowanie danych do interpolacji
    const templateData = {
      "head_title": "Tworzenie stron www - usługi",
      "head_description": "Zakres usług - projektowanie, SEO",
      "head_classification": "Analiza klienta, SEO, projektowanie, UX",
      "head_subtitle": "Starachowice",
      "head_keywords": "Strony internetowe, Responsywność, SEO, strony WWW, pozycjonowanie",
      "body_h1": "H1 strony services.html"
    };

    // Wczytanie odpowiedniego template html i odesłanie go jako string
    helpers.getTemplate('services', templateData, function(err, str) {

      if(!err && str) {
        // Wywołanie universalTemplate i dodanie healera i footera
        helpers.addUniversalTemplates(str, templateData, function(err, str) {
          if(!err && str) {
            // Zwracanie pełnego stringa z zawartościa strony
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        console.log('Error lub brak str.', err);
        callback(500, undefined, 'html');
      }
    })

  } else {
    callback(405, undefined, 'html');
  }
}

/*
*
 * JSON API handlers 
*/



// Ping handler
handlers.ping = function(data, callback) {
  callback(200);
};

handlers.notFound = (data, callback) => {
  callback(404, {'Error': 'Nie ma takiej strony...'});
};


// Export handlers
module.exports = handlers;
