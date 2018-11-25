/* The express word service encapsulates all data access and business logic for words
behind a simple interface. It exposes methods for CRUD operations and word authentication.

Implemented all of the service methods using promises in order to keep the words api
controller simple and consistent, so all service methods can be called with the pattern
[service method].then(...).catch(...); */

var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var cmd = require('node-cmd');
var mongo = require('mongoskin');
var fs = require('fs');

var doubleMetaphone = require('double-metaphone');
var stemmer = require('stemmer');

var db = mongo.db(config.connectionString, { native_parser: true });

db.bind('words');
db.bind('boards');

var service = {};

service.removeLink = removeLink;
service.getWord = getWord;
service.getBoard = getBoard;
service.createW = createW;
service.loadB = loadB;
service.createB = createB;
service.updateB = updateB;
service.clearJSON = clearJSON;
service.updateLoadBoard = updateLoadBoard;
service.updateRefreshBoard = updateRefreshBoard;
service.removeChildren = removeChildren;

module.exports = service;

//TIMER FUNCTIONS
function waitAndCall(func)
{
  setTimeout(func,2000);
}

//TIMER FUNCTIONS
function waitAndCallRefresh(func)
{
  setTimeout(func,2500);
}


//CALL AFTER THE REFRESH BUTTON HAS BEEN CLICKED, TO REPLACE LINKS WITH NEW ONES
//Function adds the new links to the board after they've been refreshed
function updateRefreshBoard(body, product_id, num_suggestions, seed_word) {

      var deferred = Q.defer();
      var word = body;
      var id = seed_word;
      var nodes = num_suggestions;
      var seed = seed_word;
      var id2 = product_id;

      waitAndCallRefresh(function(){
      downloadFile();
    });

      updateBoardRefresh();

      function updateBoardRefresh() {
      db.boards.update({ search_word: id2 }, { $set: { links: word } },
          function (err, doc) {
              if (err) deferred.reject(err.name + ': ' + err.message);
              deferred.resolve();
          });
}
return deferred.promise;
}

//CALL TO OBTAIN A WORD FROM THAT COLLECTION AND LOAD INTO THE BOARD
//Loads the board with the the words if IT IS ALREADY IN THE DATABASE from words collection
function loadB(body, product_id, degree_connection, num_suggestions) {
  var deferred = Q.defer();
  var links = body;
  var id = product_id;
  var connection = degree_connection;
  var nodes = num_suggestions;

  waitAndCall(function(){
  downloadFile();
});

  var definitions = links[links.length - 1];
  links.pop();

  loadBoard();

  function loadBoard() {

    if (nodes === '1') {
      db.boards.insert({ search_word: id, defs: definitions, children: nodes, links: [
        { source: id, target: links[0].target, type: links[0].type, defs: links[0].defs, children: 0 }
      ] },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    if (nodes === '2') {
      db.boards.insert({ search_word: id, defs: definitions, children: nodes, links: [
        { source: id, target: links[0].target, type: links[0].type, defs: links[0].defs, children: 0 },
        { source: id, target: links[1].target, type: links[1].type, defs: links[1].defs, children: 0 }
      ] },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    if (nodes === '3') {
      db.boards.insert({ search_word: id, defs: definitions, children: nodes, links: [
        { source: id, target: links[0].target, type: links[0].type, defs: links[0].defs, children: 0 },
        { source: id, target: links[1].target, type: links[1].type, defs: links[1].defs, children: 0 },
        { source: id, target: links[2].target, type: links[2].type, defs: links[2].defs, children: 0 }
      ] },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    if (nodes === '4') {
      db.boards.insert({ search_word: id, defs: definitions, children: nodes, links: [
        { source: id, target: links[0].target, type: links[0].type, defs: links[0].defs, children: 0 },
        { source: id, target: links[1].target, type: links[1].type, defs: links[1].defs, children: 0 },
        { source: id, target: links[2].target, type: links[2].type, defs: links[2].defs, children: 0 },
        { source: id, target: links[3].target, type: links[3].type, defs: links[3].defs, children: 0 }
      ] },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    if (nodes === '5') {
      db.boards.insert({ search_word: id, defs: definitions, children: nodes, links: [
        { source: id, target: links[0].target, type: links[0].type, defs: links[0].defs, children: 0 },
        { source: id, target: links[1].target, type: links[1].type, defs: links[1].defs, children: 0 },
        { source: id, target: links[2].target, type: links[2].type, defs: links[2].defs, children: 0 },
        { source: id, target: links[3].target, type: links[3].type, defs: links[3].defs, children: 0 },
        { source: id, target: links[4].target, type: links[4].type, defs: links[4].defs, children: 0 }
      ] },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    if (nodes === '6') {
      db.boards.insert({ search_word: id, defs: definitions, children: nodes, links: [
        { source: id, target: links[0].target, type: links[0].type, defs: links[0].defs, children: 0 },
        { source: id, target: links[1].target, type: links[1].type, defs: links[1].defs, children: 0 },
        { source: id, target: links[2].target, type: links[2].type, defs: links[2].defs, children: 0 },
        { source: id, target: links[3].target, type: links[3].type, defs: links[3].defs, children: 0 },
        { source: id, target: links[4].target, type: links[4].type, defs: links[4].defs, children: 0 },
        { source: id, target: links[5].target, type: links[5].type, defs: links[5].defs, children: 0 }
      ] },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    if (nodes === '7') {
      db.boards.insert({ search_word: id, defs: definitions, children: nodes, links: [
        { source: id, target: links[0].target, type: links[0].type, defs: links[0].defs, children: 0 },
        { source: id, target: links[1].target, type: links[1].type, defs: links[1].defs, children: 0 },
        { source: id, target: links[2].target, type: links[2].type, defs: links[2].defs, children: 0 },
        { source: id, target: links[3].target, type: links[3].type, defs: links[3].defs, children: 0 },
        { source: id, target: links[4].target, type: links[4].type, defs: links[4].defs, children: 0 },
        { source: id, target: links[5].target, type: links[5].type, defs: links[5].defs, children: 0 },
        { source: id, target: links[6].target, type: links[6].type, defs: links[6].defs, children: 0 }
      ] },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    if (nodes === '8') {
      db.boards.insert({ search_word: id, defs: definitions, children: nodes, links: [
        { source: id, target: links[0].target, type: links[0].type, defs: links[0].defs, children: 0 },
        { source: id, target: links[1].target, type: links[1].type, defs: links[1].defs, children: 0 },
        { source: id, target: links[2].target, type: links[2].type, defs: links[2].defs, children: 0 },
        { source: id, target: links[3].target, type: links[3].type, defs: links[3].defs, children: 0 },
        { source: id, target: links[4].target, type: links[4].type, defs: links[4].defs, children: 0 },
        { source: id, target: links[5].target, type: links[5].type, defs: links[5].defs, children: 0 },
        { source: id, target: links[6].target, type: links[6].type, defs: links[6].defs, children: 0 },
        { source: id, target: links[7].target, type: links[7].type, defs: links[7].defs, children: 0 }
      ] },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    else {
      console.log("Sorry not enough results found. Try reducing the number of nodes or searching another word");
    }
  } // end of load board function
  return deferred.promise;
}

//THIS DELETES A CHILDREN COUNT FROM THAT LINK
//Removes a node on click from the board
function removeChildren(_seed_word, d_name, d_parent) {
var deferred = Q.defer();
var seed_word = _seed_word;
var target_name = d_name;
var target_parent = d_parent;

waitAndCall(function(){
downloadFile();
});

deleteChildren();

function deleteChildren() {

  if(target_parent === seed_word) {
    db.boards.update({ search_word: seed_word }, { $inc: { children: -1 } },
      function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
      });
  }
  else {
  db.boards.update({ search_word: seed_word, "links.target": target_parent}, { $inc: { "links.$.children": -1 } },
    function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
    });
  }
}
return deferred.promise;
}

//THIS REMOVES A LINK FROM THE BOARDS COLLECTION
//Removes a node on click from the board
function removeLink(_seed_word, _target_word) {
var deferred = Q.defer();
var seed_word = _seed_word;
var target_word = _target_word;

waitAndCall(function(){
downloadFile();
});

deleteEntry();

function deleteEntry() {
    db.boards.update({ search_word: seed_word }, { $pull: { links: { target: target_word }}},
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
      } // end of delete entry function
return deferred.promise;
}

//THIS RETURNS A DOCUMENT FOR THAT WORD/PRODUCT ID FROM THE WORDS COLLECION
//Function returns table entry from the words collection with that word id
function getWord(product_id, degree_connection) {
  var deferred = Q.defer();

  db.words.findOne({ search_word: product_id, relationship: degree_connection}, function (err, docs) {
    if (err) deferred.reject(err.name + ': ' + err.message);
        //word found so resolve with documents
        if (docs) {
          deferred.resolve(docs);
        }
        // else word not found
          else {
            deferred.resolve();
          }
      });
  return deferred.promise;
}

//CALL TO GET CURRENT STATE OF THE BOARD WITH THAT WORD/PRODUCT ID
//Function returns table entry from the words collection with that word id
function getBoard(product_id) {
  var deferred = Q.defer();

  db.boards.findOne({ search_word: product_id }, function (err, docs) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    //word found so resolve with documents
        if (docs) {
          deferred.resolve(docs);
        }
        // word not found
          else {
            deferred.resolve();
          }
        });
  return deferred.promise;
}

// CALL TO CREATE A NEW WORD FROM DATAMUSE INTO THE WORDS COLLECTION
//Function creates a word entry in the words collection
function createW(total_results, product_id, degree_connection, relationship_desc) {

    var deferred = Q.defer();
    var results = total_results;
    var id = product_id;
    var connection = degree_connection;
    var desc = relationship_desc;

    var definitions = results[results.length - 1];
    results.pop();

    var resultsArray = JSON.stringify(results);
    var resultsLength = results.length;

    //console.log("Total number of word suggestions found before filtering: " + resultsLength);

    // validation
    db.words.findOne({ search_word: id, relationship: connection},
       function (err, word) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (word) {
                // word already exists in database
                deferred.reject('Word "' + results._id + '" is already in database');
            }
            else {
                 createWord();
                }
            });

    function createWord() {
      var newMeta = [];

    //Want to check for duplicates in newMeta array and slice the repitition off the results at the index of repitition
      newMeta = convertToDoubleMeta(results, id);
      var arrayBlacklist = containsAndRemove(newMeta, newMeta, results, id);

      var i = 0;
      var index = 0;

      var string_data = JSON.stringify(results); //outputs string from JSON
      var json_array1 = JSON.parse(string_data);

      //Removes words from blacklist array
      for (i = 0; i < results.length; i++) {
        if (containsAndRemoveObject(arrayBlacklist, results[i], json_array1, index) === false) {
          index++;
        }
      }
      db.words.insert({ search_word: id, relationship: connection, defs: definitions, links: json_array1 },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    } //end of createWord

    return deferred.promise;
}

//CALL TO CREATE A NEW BOARD WITH THAT DATA
//Creates entry in boards collection
function createB(total_results, product_id, degree_connection, num_suggestions, relationship_desc) {
    var deferred = Q.defer();

    var word = total_results;
    var id = product_id;
    var connection = degree_connection;
    var nodes = num_suggestions;
    var desc = relationship_desc;

    var definitions = word[word.length - 1];
    word.pop();

    var resultsArray = JSON.stringify(word);

    var resultsLength = word.length;

    waitAndCall(function(){
    downloadFile();
    });

    createBoard();

    function createBoard() {

      var newMeta = [];

      //Want to check for duplicates in newMeta array and slice the repitition off the results at the index of repitition
      newMeta = convertToDoubleMeta(word, id);
      var arrayBlacklist = containsAndRemove(newMeta, newMeta, word, id);

      var i = 0;
      var index = 0;

      var string_data = JSON.stringify(word); //outputs string from JSON
      var json_array1 = JSON.parse(string_data);

      //Removes words from blacklist array
      for (i = 0; i < word.length; i++) {
        if (containsAndRemoveObject(arrayBlacklist, word[i], json_array1, index) === false) {
          index++;
        }
      }
        //Checks there are enough words returned after the double meta and stemmer removal
        var newLength = json_array1.length;
        if (newLength < nodes) {
          return console.log('Sorry, not enough records found in Datamuse for word: ' + id + ' with connection: ' + connection + ' and suggestions: ' + nodes + '. Try less suggestions.');
        }

      word = json_array1;

      //convert the number of children to an interger
      var n = parseInt(nodes);
      //convert the number of children to an interger
      var z = parseInt("0");

      //create board as per number
      if (nodes === '1' && word !== 'undefined') {
        db.boards.insert({ search_word: id, defs: definitions, children: n, links: [
          { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z }
        ] },
        function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
        });
      }
      if (nodes === '2' && word !== 'undefined') {
        db.boards.insert({ search_word: id, defs: definitions, children: n, links: [
          { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
          { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z }
        ] },
        function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
        });
      }
      if (nodes === '3' && word !== 'undefined') {
        db.boards.insert({ search_word: id, defs: definitions, children: n, links: [
          { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
          { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
          { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z }
        ] },
        function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
        });
      }
      if (nodes === '4' && word !== 'undefined') {
        db.boards.insert({ search_word: id, defs: definitions, children: n, links: [
          { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
          { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
          { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
          { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z }
        ] },
        function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
        });
      }
      if (nodes === '5' && word !== 'undefined') {
        db.boards.insert({ search_word: id, defs: definitions, children: n, links: [
          { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
          { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
          { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
          { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
          { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z }
        ] },
        function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
        });
      }
      if (nodes === '6' && word !== 'undefined') {
        db.boards.insert({ search_word: id, defs: definitions, children: n, links: [
          { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
          { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
          { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
          { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
          { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
          { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z }
        ] },
        function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
        });
      }
      if (nodes === '7' && word !== 'undefined') {
        db.boards.insert({ search_word: id, defs: definitions, children: n, links: [
          { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
          { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
          { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
          { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
          { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
          { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z },
          { source: id, target: word[6].target, type: word[6].type, defs: word[6].defs, children: z }
        ] },
        function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
        });
      }
      if (nodes === '8' && word !== 'undefined') {
        db.boards.insert({ search_word: id, defs: definitions, children: n, links: [
          { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
          { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
          { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
          { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
          { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
          { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z },
          { source: id, target: word[6].target, type: word[6].type, defs: word[6].defs, children: z },
          { source: id, target: word[7].target, type: word[7].type, defs: word[7].defs, children: z }
        ] },
        function (err, doc) {
          if (err) deferred.reject(err.name + ': ' + err.message);
          deferred.resolve();
        });
      }
      else {
        console.log("Sorry not enough results found. Try reducing the number of nodes or searching another word");
      }
    } // end of create board
    return deferred.promise;
}

//CALL IF WORD IS ALREADY IN DATABASE AND THE LINKS CAN BE ADDED WHEN WORD EXTENDED
//Updates a word with more related word links
function updateLoadBoard(results, product_id, num_suggestions, seed_word) {

    var deferred = Q.defer();
    var word = results;
    var id = product_id;
    var nodes = num_suggestions;
    var seed = seed_word;

    waitAndCall(function(){
    downloadFile();
  });

    updateBoard();
    //convert the number of children to an interger
    var n = parseInt(nodes);

    addChildren(n);

    function addChildren(n) {

      if(id === seed) {
      db.boards.update(
           { search_word: seed }, { $inc: { children: n } },
           function (err, doc) {
               if (err) deferred.reject(err.name + ': ' + err.message);
               deferred.resolve();
           });
      }
      else {
        db.boards.update({ search_word: seed , "links.target": id}, { $inc: { "links.$.children": n } },
          function (err, doc) {
              if (err) deferred.reject(err.name + ': ' + err.message);
              deferred.resolve();
          });
        }
  }

    function updateBoard() {

      var z = parseInt("0");

    if (nodes === '1' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z }
      ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '2' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '3' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '4' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '5' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
        { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '6' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
        { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
        { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '7' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
        { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
        { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z },
        { source: id, target: word[6].target, type: word[6].type, defs: word[6].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '8' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
        { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
        { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z },
        { source: id, target: word[6].target, type: word[6].type, defs: word[6].defs, children: z },
        { source: id, target: word[7].target, type: word[7].type, defs: word[7].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    else {
      console.log("Sorry not enough results found. Try reducing the number of nodes or searching another word");
    }
  }
    return deferred.promise;
}

//CALL TO ADD MORE LINKS TO THAT BOARD WHEN WORD IS EXTENDED AND IT IS NOT IN DATABASE
//Updates a word with more related word links when the node is expanded
function updateB(wordParam, product_id, degree_connection, num_suggestions, relationship_desc, seed_word) {

    var deferred = Q.defer();
    var word = wordParam;
    var id = product_id;
    var connection = degree_connection;
    var nodes = num_suggestions;
    var seed = seed_word;

    waitAndCall(function(){
    downloadFile();
    });

    updateBoard();
    //convert the number of children to an interger
    var n = parseInt(nodes);

    addChildren(n);

    function addChildren(n) {

      if(id === seed) {
      db.boards.update(
           { search_word: seed }, { $inc: { children: n } },
           function (err, doc) {
               if (err) deferred.reject(err.name + ': ' + err.message);
               deferred.resolve();
           });
      }
      else {
        db.boards.update({ search_word: seed , "links.target": id}, { $inc: { "links.$.children": n } },
          function (err, doc) {
              if (err) deferred.reject(err.name + ': ' + err.message);
              deferred.resolve();
          });
        }
      }

    function updateBoard() {

      var newMeta = [];

      //Want to check for duplicates in newMeta array and slice the repitition off the results at the index of repitition
      newMeta = convertToDoubleMeta(word, id);
      var arrayBlacklist = containsAndRemove(newMeta, newMeta, word, id);

      var i = 0;
      var index = 0;

      var string_data = JSON.stringify(word); //outputs string from JSON
      var json_array1 = JSON.parse(string_data);

      //Removes words from blacklist array
      for (i = 0; i < word.length; i++) {
        if (containsAndRemoveObject(arrayBlacklist, word[i], json_array1, index) === false) {
          index++;
        }
      }
        //Checks there are enough words returned after the double meta and stemmer removal
        var newLength = json_array1.length;
        if (newLength < nodes) {
          return console.log('Sorry, not enough records found in Datamuse for word: ' + id + ' with connection: ' + connection + ' and suggestions: ' + nodes + '. Try less suggestions.');
        }

      word = json_array1;

      var z = parseInt("0");

    if (nodes === '1' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z }
      ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '2' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '3' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '4' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '5' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
        { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '6' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
        { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
        { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '7' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
        { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
        { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z },
        { source: id, target: word[6].target, type: word[6].type, defs: word[6].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }

    if (nodes === '8' && word !== 'undefined') {
      db.boards.update({ search_word: seed }, { $push: { links: { $each: [
        { source: id, target: word[0].target, type: word[0].type, defs: word[0].defs, children: z },
        { source: id, target: word[1].target, type: word[1].type, defs: word[1].defs, children: z },
        { source: id, target: word[2].target, type: word[2].type, defs: word[2].defs, children: z },
        { source: id, target: word[3].target, type: word[3].type, defs: word[3].defs, children: z },
        { source: id, target: word[4].target, type: word[4].type, defs: word[4].defs, children: z },
        { source: id, target: word[5].target, type: word[5].type, defs: word[5].defs, children: z },
        { source: id, target: word[6].target, type: word[6].type, defs: word[6].defs, children: z },
        { source: id, target: word[7].target, type: word[7].type, defs: word[7].defs, children: z }
    ] } } },
      function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });
    }
    else {
      console.log("Sorry not enough results found. Try reducing the number of nodes or searching another word");
    }

  } // end of update board
    return deferred.promise;
}

//CALLED BY EACH OF THE ABOVE WHEN THEY ARE DONE ENTERING THE WORDS
//create temporary boards.json file which should be created each time a new word is searched
function downloadFile() {
var download = Q.defer();

cmd.get(
        'mongoexport --db ideator --collection boards --out ./app/boards.json',
        function(err, data, stderr){
            if (err) deferred.reject(err.name + ': ' + err.message);
            download.resolve();
        });
return download.promise;
}

//CALLED WHEN THE BOARD NEEDS EMPTYING
//Clears the boards collection and redownloads empty file
function clearJSON() {
  //console.log("hello from clear json");
db.boards.remove( { } );
downloadFile();
}

//DOUBLE METAPHONE CONVERSION
function convertToDoubleMeta(_results, id) {
  var results = _results;
  var i = 0;

  var stemmedDoubleMeta = [];
  for ( ; i < results.length; i++) {
   stemmedDoubleMeta[i] = doubleMetaphone(stemmer(results[i].target));
}
var searchWordMeta = doubleMetaphone(stemmer(id));

//Adds search word to beginning of array
stemmedDoubleMeta.unshift(searchWordMeta);

return stemmedDoubleMeta;
}

//FUNCTION CHECKS IF DOUBLE METAPHONE CONVERSION CONTAINS DUPLICATES AND REMOVES THEM
function containsAndRemove(_newMeta, _newMetaCopy, _results, id) {

  var newMeta = _newMeta;
  var newMetaCopy = _newMetaCopy;
  var b = 0;
  var index = 1;
  var a = 0;
  var arrayOfRepeats = [];
  var array = _results;

  array.unshift(id);

  while (b < newMeta.length) {
    while (index < newMeta.length && a < newMeta.length) {
      for (var i = index; i < newMeta.length; i++) {
        if(newMeta[a][0] === newMetaCopy[i][0] && newMeta[a][1] === newMetaCopy[i][1]) {
        //console.log('Found dups at index ' + i + ' and first word ' + a + ' with ' + newMetaCopy[i] + array[i].target + ' and ' + newMeta[a] + array[a].target );
        arrayOfRepeats[i] = array[i];
      }
    }
    index++;
    a++;
  }
  b++;
}
array.shift();
return arrayOfRepeats;
}

//FUNCTION CHECKS IF THEY CONTAIN BLACKLISTED WORDS AND REMOVES THEM
function containsAndRemoveObject(array, object, json, index) {
  for(var j = 0; j < array.length; j++){
      if(array[j] === object) {
        json.splice(index, 1);
        return true;
      }
    }
    return false;
  }
