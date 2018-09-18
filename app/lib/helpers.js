/**
 * Helpers do różnych tasków 
*/

// Dependencies
const config = require('./config');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const helpers = {};

// Przekazywanie stringu JSON i przerabianie go na obiekt jeżeli się da, bez wywalania erroru w aplikacji
helpers.parseJsonToObject = function(str) {
  try { 
    const obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
}

// Wczytywanie template jako string
helpers.getTemplate = function(templateName, data, callback) {
  templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof(data) =='object' && data !== null ? data : {};

  if(templateName) {
    const templateDir = path.join(__dirname,'/../templates/');
    fs.readFile( templateDir + templateName + '.html', 'utf8', function(err, str) {
      if(!err && str && str.length > 0) {
        const finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('Error, Nie udało się załadować templatki! Sprawdź czy taka istnieje.');
      }
    } );
  } else {
    callback('Error: Odpowiednia nazwa template nie została określona!')
  }
};

// Dodawanie defaultowego headera i footera do stringa, oraz dostarczanie danych z obiektu do footera i headera do interpolacji
helpers.addUniversalTemplates = function(str, data, callback) {
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) =='object' && data !== null ? data : {};

  // Ładowanie headera
  helpers.getTemplate('_header', data, function(err, headerString) {
    // console.log(headerString);
    if(!err && headerString) {
      // console.log(headerString);
      // Ładowanie footera
      helpers.getTemplate('_footer', data, function(err, footerString) {
        if(!err && footerString) {
          // Łączenie wszystkich stringów
          const fullString = `${headerString}${str}${footerString}`;
          // console.log('Fullstring', fullString);
          callback(false,fullString);
        } else {
          callback('Template "_footer" nie znaleziony!');
        }
      });
    } else {
      callback('Template "_header" nie znaleziony!');
    }
  });


};

// Znajdowanie oraz podmiana przekazanych stringów z obiektem data i jego keys i values
helpers.interpolate = function(str, data) {
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) =='object' && data !== null ? data : {};

  // Dodanie template Globals do data obiektu. Dołączanie key name z 'global'
  for(let keyName in config.environmentToExport.templateGlobals) {
    if(config.environmentToExport.templateGlobals.hasOwnProperty(keyName)) {
      data[`global.${keyName}`] = config.environmentToExport.templateGlobals[keyName];
    }
  }

  // Dla każdego key w data Object, chcemy podmienić jego value do stringa w odpowiadające miejsce
  for(let key in data) {
    if(data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
      str = str.replace(`{${key}}`, data[key]);
    }
  }
  // console.log('------------------------------------------', str);
  return str;
};


// Export helpers
module.exports = helpers;