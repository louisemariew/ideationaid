/*The express words api controller defines the routes responsible for word related
operations such as authentication, registration, retrieving, updating and
deleting word data*/
var config = require('config.json');
var express = require('express');
var router = express.Router();
var boardsService = require('services/boards.service');

//Routes defined for word related operations
router.get('/:product_id/:degree_connection', getItem);
router.get('/:product_id', getCurrentBoard);
router.post('/createB/:product_id/:degree_connection/:num_suggestions/:relationship_desc', createBoard);
router.post('/createW/:product_id/:degree_connection/:relationship_desc', createWord);
router.post('/loadB/:product_id/:degree_connection/:num_suggestions', loadBoard);
router.put('/updateB/:product_id/:degree_connection/:num_suggestions/:relationship_desc/:seed_word', updateBoard);
router.put('/removeLink/:seed_word/:target_word', deleteLinkNode);
router.put('/removeChildren/:seed_word/:target_name/:target_parent', deleteChilden);
router.delete('/delete', deleteBoard);
router.put('/updateLoadB/:product_id/:num_suggestions/:seed_word', updateLoadB);
router.post('/refreshB/:product_id/:num_suggestions/:seed_word', refreshBoard);

module.exports = router;

//THIS GETS THE BOARD COLLECTION DOCUMENT
//Gets an item from the database by id and degree_connection
function getCurrentBoard(req, res) {
  boardsService.getBoard(req.params.product_id)
      .then(items => {
          res.send(items);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

//THIS REPLACES THE LINKS ON THE BOARD WITH NEW ONES WHEN WORD REFRESHED
function refreshBoard(req, res) {
  boardsService.updateRefreshBoard(req.body, req.params.product_id, req.params.num_suggestions, req.params.seed_word)
      .then(function () {
          res.sendStatus(200);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

//CALLED IF WORD IS ALREADY IN DATABASE AND THE LINKS CAN BE ADDED WHEN WORD EXTENDED
function updateLoadB(req,res) {
  boardsService.updateLoadBoard(req.body, req.params.product_id, req.params.num_suggestions, req.params.seed_word)
      .then(function () {
          res.sendStatus(200);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

//THIS OBTAINS A WORD FROM THE WORDS COLLECTION AND LOADS INTO THE BOARD
function loadBoard(req,res) {
  boardsService.loadB(req.body, req.params.product_id, req.params.degree_connection,
    req.params.num_suggestions)
      .then(function () {
          res.sendStatus(200);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

//THIS DELETES A LINK FROM THE BOARDS COLLECTION
function deleteLinkNode(req, res) {
  boardsService.removeLink(req.params.seed_word, req.params.target_word)
      .then(function () {
          res.sendStatus(200);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });

}

//THIS REDUCES THE NUMBER OF CHILDREN IN A LINK BY ONE IN THE BOARDS COLLECTION
function deleteChilden(req, res) {
  boardsService.removeChildren(req.params.seed_word, req.params.target_name, req.params.target_parent)
      .then(function () {
          res.sendStatus(200);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });

}

//THIS DELETES THE CONTENTS OF THE JSON FILE SAVED LOCALLY
//Clears contents of JSON file
function deleteBoard(req, res) {
  boardsService.clearJSON()
  .then(function () {
      res.sendStatus(200);
  })
  .catch(function (err) {
      res.status(400).send(err);
  });
}

//THIS IS CALLED TO GET A WORD FROM THE WORDS COLLECTION
//Gets an item from the database by id and degree_connection
function getItem(req, res) {
  boardsService.getWord(req.params.product_id, req.params.degree_connection)
      .then(items => {
          res.send(items);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

//THIS IS CALLED WHEN A NEW WORD IS SEARCHED AND RESULTS SAVED
//Function creates an entry in the word collection with the search results
function createWord(req, res) {
    boardsService.createW(req.body, req.params.product_id, req.params.degree_connection, req.params.relationship_desc)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

//THIS IS CALLED WHEN A NEW BOARD IS BEING CREATED
//Function creates an entry in the board collection with the search results
function createBoard(req, res) {
    boardsService.createB(req.body, req.params.product_id, req.params.degree_connection,
      req.params.num_suggestions, req.params.relationship_desc)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

//THIS IS CALLED WHEN ADDING LINKS TO THE BOARD IF WORD IS NOT ALREADY LOADED
//Function creates an entry in the board collection with the search results
function updateBoard(req, res) {
    boardsService.updateB(req.body, req.params.product_id, req.params.degree_connection,
      req.params.num_suggestions, req.params.relationship_desc, req.params.seed_word)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
