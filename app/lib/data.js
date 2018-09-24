/**
 * Biblioteka do przechowywania i edycji danych
*/

// Dependencies
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const config = require('./config');
const helpers = require('./helpers');

// Database connection
const db = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
});

// Kontener na moduł
const lib = {};

// Definiowanie base directory dla folderu data
lib.baseDir = path.join(__dirname, './../.data/');

console.log(lib);
// Zapisywanie danych do pliku
lib.create = (dir, file, data, callback) => {
  // Konwertowanie do stringa zeby zapisać w pliku
  const stringData = JSON.stringify(data);

  /**ZAPISYWANIE DO DB ------------------------*/
  db.connect((conErr) => {
    if(conErr) { 
      console.log('Errow z połączeniem, ', conErr.stack);
    } else { 
      console.log('DB connected!, ', db.threadId);
    }
  });
  // BodyDb musi miec headersy takie jak w basie danych
  // Insert to DB
  let bodyDb = {title: file, body: stringData, text: data.text};
  let sql = `INSERT INTO ${dir} SET ?`;
  query = db.query(sql, bodyDb, (err, results, fields) => { 
    if(!err) {
      console.log('Operacja zakończyła się powodzeniem.\nWstawiono, ', results.affectedRows, ' record/ów do BD.');
    } else {
      if(err.errno == 1062) {
        console.log('Record o numerze id:', bodyDb.title, ' już istnieje. Jest to PRIMARY KEY. Wybierz inny ID');
      } else {
        console.log('Nie udało się wstawić danych, ', err);
      }
    }
  });
  db.end(err => {
    if(!err) {
      console.log('Połączenie zakończono');
    } else {
      console.log('Coś nie tak z zakańczaniem połączenia z db!');
    }
  });
  /** KONIEC ZAPISYWANIA DO DB ---------------------------*/

  // Otwieranie pliku do zapisu
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if(!err && fileDescriptor) {
      // Zapisanie do pliku i zamknięcie
      fs.writeFile(fileDescriptor, stringData, err => {
        if(!err) {
          fs.close(fileDescriptor, err => {
            if(!err) {
              callback(false, 'Wstawiono do pliku');
            } else {
              callback('Error, nie udało się zamknąć nowego pliku');
            }
          });
        } else {
          callback('Error, nie udało się zapisać nowego pliku');
        }
      });
    } else {
      callback('Nie udało się utworzyć nowego pliku, może już istnieć');
    }
  });
};

// Wczytywanie z pliku
lib.read = (dir, file, callback) => {

  /** WCZYTYWANIE Z DB ------------------------*/
  db.connect((conErr) => {
    if(conErr) { 
      console.log('Errow z połączeniem, ', conErr.stack);
    } else { 
      console.log('DB connected!, ', db.threadId);
    }
  });
  // BodyDb musi miec headersy takie jak w basie danych
  // SELECT z bazy daynych

  let sql = `SELECT * FROM ${dir} WHERE title='${file}'`;
  query = db.query(sql, (err, results, fields) => { 
    if(!err && results) {
      console.log('Zwracam dane z BD');
      callback(err, results[0].body);
    } else {
      callback('Nastąpił błąd podczas wybierania danych z BD');
    }
    
  });

  db.end(err => {
    if(!err) {
      console.log('Połączenie zakończono');
    } else {
      console.log('Coś nie tak z zakańczaniem połączenia z db!');
    }
  });
  /** KONIEC WCZYTYWANIA Z DB ---------------------------*/


  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
    // Zwracanie obieku zamiast stringa
    if(!err && data) {
      console.log('Zwracam dane z pliku');
      const parsedData = helpers.parseJsonToObject(data);
      callback(err, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Update instniejących danych do pliku
lib.update = (dir, file, data, callback) => {
  // Konwertowanie do stringa zeby zapisać w pliku
  const stringData = JSON.stringify(data);

  /** WCZYTYWANIE Z DB ------------------------*/
  db.connect((conErr) => {
    if(conErr) { 
      console.log('Errow z połączeniem, ', conErr.stack);
    } else { 
      console.log('DB connected!, ', db.threadId);
    }
  });
  // BodyDb musi miec headersy takie jak w basie danych
  // SELECT z bazy daynych
  let sql = `UPDATE ${dir} SET text="${data.text}", body='${stringData}' WHERE title="${file}"`
  query = db.query(sql, (err, results, fields) => { 
    if(results.changedRows) {
      callback(`Udało się! Wprowadzono ${results.changedRows} zmian.`);
    } else {
      callback(`Error, sprawdź, czy ${dir}/${file} istnieje.`);
    }
  });

  db.end(err => {
    if(!err) {
      console.log('Połączenie zakończono');
    } else {
      console.log('Coś nie tak z zakańczaniem połączenia z db!');
    }
  });
  /** KONIEC WCZYTYWANIE Z DB ---------------------------*/

  // Otwieranie pliku do updatu
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if(!err && fileDescriptor) {
      // Przycinanie pliku
      fs.truncate(fileDescriptor, err => {
        if(!err) {
          // Wprowadzenie nowych danych
          fs.writeFile(fileDescriptor, stringData, err => {
            if(!err) {
              fs.close(fileDescriptor, err => {
                if(!err) {
                  callback(false, 'Plik nadpisano i zamknięto pomyślnie');
                } else {
                  callback('Problem z zamknięciem pliku');
                }
              });
            } else {
              console.log('Error. Problem z nadpisaniem istniejącego pliku');
            }
          });
        } else {
          callback('Error. Nie udało się przyciąć:, ', fileDescriptor);
        }
      });

    } else {
      callback('Error, Nie można odtowrzyć do updatu lub ten jeszcze nie istnieje.')
    }
  });
};

lib.delete = (dir, file, callback) => {
  // Usuwanie pliku oraz recordu z DB
  /** WCZYTYWANIE Z DB ------------------------*/
  db.connect((conErr) => {
    if(conErr) { 
      console.log('Errow z połączeniem, ', conErr.stack);
    } else { 
      console.log('DB connected!, ', db.threadId);
    }
  });
  let sql = `DELETE FROM ${dir} WHERE title="${file}"`;
  db.query(sql, (err, results, fields) => {
    if( results.affectedRows > 0) {
      callback(`Record "${file}" został usunięty z BD!`);
    } else {
      callback(`Error, nie udało się usunąć "${file}" z BD "${dir}". Record prawdopodobnie już nie istnieje`);
    }
  });

  db.end(err => {
    if(!err) {
      callback('Połączenie zakończono');
    } else {
      callback('Coś nie tak z zakańczaniem połączenia z db!');
    }
  });
  /**END WCZYTYWANIE Z DB ---------------------------*/


  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, err => {
    if(!err) {
      callback(`Plik "${file}" usunięto!`);
    } else {
      callback(`Error, nie udało się usunąć pliku "${file}" z folderu "${dir}". Plik prawdopodobnie nie istnieje`);
    }
  });
};


// Export
module.exports = lib;