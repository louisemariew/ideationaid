/*The services folder is used for custom AngularJS services / factories.
All API access and business logic should be placed in services within this folder
in order to keep angular controllers 'thin' and to maintain a clean separation of concerns
The user service encapsulates interaction with the web api for all user related CRUD operations.*/
(function () {
    'use strict';

    angular
        .module('app')
        .factory('BoardsService', Service);

    function Service($http, $q) {
        var vm = this;
        var service = {};
        var search_param = [];
        var relationship_desc = [];
        var k = 0;

        // Words that should be ignored from the search output
        var blacklist = [
          //personal pronouns
          'I', 'me', 'we', 'us', 'you', 'she', 'her', 'he', 'him', 'it', 'they', 'them',
          //relative and interrogative pronouns
          'that', 'which', 'who', 'whom', 'whichever', 'whoever', 'whomever', 'whose',
          //demonstrative pronouns
          'this', 'these', 'those',
          //indefinite pronouns
          'anyone', 'anybody', 'anything', 'each', 'either', 'everybody', 'everyone', 'neither', 'nobody', 'noone',
          'nothing', 'one', 'somebody', 'someone', 'something', 'both', 'few', 'many', 'several', 'all', 'any', 'most',
          'none', 'some',
          //reflexive pronouns
          'myself', 'ourselves', 'yourself', 'yourselves', 'himself', 'herself', 'itself', 'themselves',
          //possessive pronouns
          'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'theirs', 'hers',
          //punctuation and misc characters
          '.', ',', ';', '*', '?', '!', '@', '~', '#', '$', '%', '&',
          'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
          'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
          //others
          'yes', 'no', 'not', 'an', 'and', 'the', 'if',
          'is', 'am', 'are', 'was', 'were', 'been', 'be', 'than', 'then',
          'has', 'have', 'had', 'with', 'of', 'for', 'in', 'at', 'on', 'by', 'from', 'to',
          'but', 'or', 'as', 'so','what', 'when', 'how', 'there', 'where', 'would', 'should'
        ];

        //Results from first search_param
        vm.results1 = {};
        vm.string_data1 = {};
        vm.json_array1 = {};
        vm.seed_word = {};
        vm.response = {};
        //Results from second search_param
        vm.results2 = {};
        vm.string_data2 = {};
        vm.json_array2 = {};

        //Results from third search_param
        vm.results3 = {};
        vm.string_data3 = {};
        vm.json_array3 = {};

        vm.string_data4 = {};
        vm.json_array4 = {};

        //For removing dups
        vm.newArray = {};
        vm.num_suggestions = num_suggestions;

        service.RecursiveSearch = RecursiveSearch;
        service.SearchWord = SearchWord;
        service.CreateB = CreateB;
        service.CreateW = CreateW;
        service.UpdateB = UpdateB;
        service.LoadB = LoadB;
        service.RefreshB = RefreshB;
        service.GetWord = GetWord;
        service.GetBoard = GetBoard;
        service.RemoveLink = RemoveLink;
        service.RemoveChildren = RemoveChildren;
        service.DeleteLink = DeleteLink;
        service.DeleteChildren = DeleteChildren;
        service.ClearBoard = ClearBoard;
        service.WikiSearch = WikiSearch;
        service.LoadWord = LoadWord;
        service.UpdateLoadWord = UpdateLoadWord;
        service.UpdateLoadedWord = UpdateLoadedWord;
        service.RefreshBoard = RefreshBoard;
        service.RefreshBoardMatches = RefreshBoardMatches;

        return service;

        function CreateB(total_results, product_id, degree_connection, num_suggestions, relationship_desc) {
          return $http.post('/api/boards/createB/' + product_id + '/' + degree_connection + '/' + num_suggestions + '/' + relationship_desc, total_results).then(handleSuccess, handleError);
        }

        function LoadB(resultsArray, product_id, degree_connection, num_suggestions) {
          return $http.post('/api/boards/loadB/' + product_id + '/' + degree_connection + '/' + num_suggestions, resultsArray).then(handleSuccess, handleError);
        }

        function RefreshB(resultsArray, product_id, num_suggestions, seed_word) {
          return $http.post('/api/boards/refreshB/' + product_id + '/' + num_suggestions + '/' + seed_word, resultsArray).then(handleSuccess, handleError);
        }

        function UpdateLoadWord(results, product_id, num_suggestions, seed_word) {
            return $http.put('/api/boards/updateLoadB/' + product_id + '/' + num_suggestions + '/' + seed_word, results).then(handleSuccess, handleError);
        }

        function UpdateB(total_results, product_id, degree_connection, num_suggestions, relationship_desc, seed_word) {
          return $http.put('/api/boards/updateB/' + product_id + '/' + degree_connection + '/' + num_suggestions + '/' + relationship_desc + '/' + seed_word, total_results).then(handleSuccess, handleError);
        }

        function RemoveLink(seed_word, target_word) {
          return $http.put('/api/boards/removeLink/' + seed_word + '/' + target_word).then(handleSuccess, handleError);
        }

        function RemoveChildren(seed_word, target_name, target_parent) {
          return $http.put('/api/boards/removeChildren/' + seed_word + '/' + target_name + '/' + target_parent).then(handleSuccess, handleError);
        }

        function CreateW(total_results, product_id, degree_connection, relationship_desc) {
          return $http.post('/api/boards/createW/' + product_id +'/' + degree_connection + '/' + relationship_desc, total_results).then(handleSuccess, handleError);
        }

       //Get request for a word id from the words collection
       function ClearBoard() {
          return $http.delete('/api/boards/delete').then(handleSuccess, handleError);
        }
        //Get request for a word id from the words collection
        function GetWord(product_id, degree_connection) {
          return $http.get('/api/boards/' + product_id +'/' + degree_connection).then(handleSuccess, handleError);
        }

        //Get request for the contents of the boards collection
        function GetBoard(product_id) {
          return $http.get('/api/boards/' + product_id).then(handleSuccess, handleError);
        }

//CALLED WHEN A NEW FIRST WORD IS SEARCHED
//Searches for a word in datamuse API using ajax to allow CORS
    function SearchWord(product_id, degree_connection, num_suggestions) {
      vm.num_suggestions = num_suggestions;

      if (degree_connection == 0) {
        search_param[0] = "rel_rhy";
        search_param[1] = "rel_bgb";
        search_param[2] = "rel_bga"
        relationship_desc[0] = "rhymes";
        relationship_desc[1] = "predecessor";
        relationship_desc[2] = "successor";
      }

      if (degree_connection == 0.25) {
        search_param[0] = "rel_jjb";
        search_param[1] = "rel_jja";
        search_param[2] = "rel_ant";
        relationship_desc[0] = "adjective";
        relationship_desc[1] = "noun";
        relationship_desc[2] = "antonym";
      }

      if (degree_connection == 0.5) {
          search_param[0] = "rel_ant";
          search_param[1] = "rel_trg";
          relationship_desc[0] = "antonym";
          relationship_desc[1] = "associated";
          relationship_desc[2] = "null";
      }

      if (degree_connection == 0.75) {
          search_param[0] = "rel_com";
          search_param[1] = "rel_gen";
          search_param[2] = "ml";
          relationship_desc[0] = "comprises";
          relationship_desc[1] = "generalisation";
          relationship_desc[2] = "means";
      }

      if (degree_connection == 1) {
        search_param[0] = "rel_syn";
        search_param[1] = "ml";
        relationship_desc[0] = "synonym";
        relationship_desc[1] = "means";
        relationship_desc[2] = "null";
      }

    //ajax GET request to datamuse API
    return $.ajax({
      type: 'GET',
      url: 'http://api.datamuse.com/words?' + search_param[0] + '=' + product_id + '&md=def',
      contentType: 'text/plain',
      xhrFields: {
        withCredentials: false
      },

      success: function(response) {
        vm.results1 = response;
        var j = 0;

        //Adds the relationship label to the json object and deletes unnecessary info
        for (j = 0; j < vm.results1.length; j++) {
          vm.results1[j]["label"] = relationship_desc[0];
          delete vm.results1[j]["score"];
          delete vm.results1[j]["numSyllables"];
          delete vm.results1[j]["tags"];
          delete vm.results1[j]["defHeadword"];
        }

        vm.string_data1 = JSON.stringify(vm.results1); //outputs string from JSON
        vm.json_array1 = JSON.parse(vm.string_data1);

        var i = 0;
        var index = 0;
        //Removes words from blacklist
        for (i = 0; i < vm.results1.length; i++) {
          if (containsAndRemove(blacklist, vm.results1[i].word, vm.json_array1, index) === false) {
            index++;
          }
        }
        //Second AJAX call to collect more results for the other search_param
        $.ajax({
        type: 'GET',
        url: 'http://api.datamuse.com/words?' + search_param[1] + '=' + product_id + '&md=def',
        contentType: 'text/plain',
        xhrFields: {
          withCredentials: false
        },

        success: function(response) {
          vm.results2 = response;
          var j = 0;
          //Adds the relationship label to the json object
          for (j = 0; j < vm.results2.length; j++) {
            vm.results2[j]["label"] = relationship_desc[1];
            delete vm.results2[j]["score"];
            delete vm.results2[j]["numSyllables"];
            delete vm.results2[j]["tags"];
            delete vm.results2[j]["defHeadword"];
          }

          vm.string_data2 = JSON.stringify(vm.results2); //outputs string from JSON

          vm.json_array2 = JSON.parse(vm.string_data2);

          var i = 0;
          var index = 0;
          //Removes words from blacklist
          for (i = 0; i < vm.results2.length; i++) {
            if (containsAndRemove(blacklist, vm.results2[i].word, vm.json_array2, index) === false) {
              index++;
            }
          }

          if (relationship_desc[2] === "null") {
          //Concat the json objects into one total results array
          vm.json_array1 = vm.json_array1.concat(vm.json_array2);

          //Removes duplicates from search words
          vm.newArray = removeDuplicates(vm.json_array1, "word");

          if (vm.newArray.length === 0 ) {
            document.getElementById("product_id").disabled = false;
            document.getElementById("product_id").value = "";
          return alert('Sorry, no records found in Datamuse for word: ' + product_id + ' with connection: ' + degree_connection + ' and suggestions: ' + num_suggestions + '. Try another word.');
        }

        if (vm.newArray.length < num_suggestions && vm.newArray.length > 0) {
          document.getElementById("product_id").disabled = false;
          document.getElementById("product_id").value = "";
        return alert('Sorry, not enough records found in Datamuse for word: ' + product_id + ' with connection: ' + degree_connection + ' and suggestions: ' + num_suggestions + '. Try less suggestions.');
        }

        var j = 0;
        //Checks in def tag present, if not searches wiki
        for (j = 0; j < vm.newArray.length; j++) {
          if(!(vm.newArray[j].hasOwnProperty("defs"))) {
          WikiSearch(vm.newArray, vm.newArray[j].word, j);
        }
          //Adds the relationship label to the json object
            vm.newArray[j]["source"] =  product_id;
            vm.newArray[j]["target"] = vm.newArray[j].word;
            vm.newArray[j]["type"] = vm.newArray[j]["label"];

            delete vm.newArray[j]["word"];
            delete vm.newArray[j]["label"];
          }

          //gets the definition of the search word
          $.ajax({
            type: 'GET',
            url: 'http://api.datamuse.com/words?' + 'sp=' + product_id + '&qe=sp&md=d&max=1',
            contentType: 'text/plain',
            xhrFields: {
              withCredentials: false
            },

            success: function(response) {
            var definition = [];
            definition = response["0"].defs;
            vm.newArray.push(definition);

          var inter = setTimeout(function() {
          CreateW(vm.newArray, product_id, degree_connection, relationship_desc);

          //Function creates board with results
          CreateB(vm.newArray, product_id, degree_connection, num_suggestions, relationship_desc);

          }, 500);
        },
      error: function() {
      console.log("Error collecting data from datamuse");
      }
      })
    } // end of if statement
          else {
            $.ajax({
            type: 'GET',
            url: 'http://api.datamuse.com/words?' + search_param[2] + '=' + product_id + '&md=def',
            contentType: 'text/plain',
            xhrFields: {
              withCredentials: false
            },

            success: function(response) {
              vm.results3 = response;
              var j = 0;
              //Adds the relationship label to the json object
              for (j = 0; j < vm.results3.length; j++) {
                vm.results3[j]["label"] = relationship_desc[2];
                delete vm.results3[j]["score"];
                delete vm.results3[j]["numSyllables"];
                delete vm.results3[j]["tags"];
                delete vm.results3[j]["defHeadword"];
              }

              vm.string_data3 = JSON.stringify(vm.results3); //outputs string from JSON

              vm.json_array3 = JSON.parse(vm.string_data3);

              var i = 0;
              var index = 0;
              //Removes words from blacklist
              for (i = 0; i < vm.results3.length; i++) {
                if (containsAndRemove(blacklist, vm.results3[i].word, vm.json_array3, index) === false) {
                  index++;
                }
              }

              //Concat the json objects into one total results array
              vm.json_array1 = vm.json_array1.concat(vm.json_array2);

              vm.json_array1 = vm.json_array1.concat(vm.json_array3);

              //Removes duplicates from search words
              vm.newArray = removeDuplicates(vm.json_array1, "word");

              if (vm.newArray.length === 0 ) {
                document.getElementById("product_id").disabled = false;
                document.getElementById("product_id").value = "";
              return alert('Sorry, no records found in Datamuse for word: ' + product_id + ' with connection: ' + degree_connection + ' and suggestions: ' + num_suggestions + '. Try another word.');
            }

            if (vm.newArray.length < vm.num_suggestions && vm.newArray.length > 0) {
              document.getElementById("product_id").disabled = false;
              document.getElementById("product_id").value = "";
            return alert('Sorry, not enough records found in Datamuse for word: ' + product_id + ' with connection: ' + degree_connection + ' and suggestions: ' + num_suggestions + '. Try less suggestions.');
            }

            var j = 0;
            //Checks in def tag present, if not searches wiki
            for (j = 0; j < vm.newArray.length; j++) {
              if(!(vm.newArray[j].hasOwnProperty("defs"))) {
              WikiSearch(vm.newArray, vm.newArray[j].word, j);
          }
              //Adds the relationship label to the json object
                vm.newArray[j]["source"] =  product_id;
                vm.newArray[j]["target"] = vm.newArray[j].word;
                vm.newArray[j]["type"] = vm.newArray[j]["label"];

                delete vm.newArray[j]["word"];
                delete vm.newArray[j]["label"];
              }

          //gets the definition of the search word
          $.ajax({
            type: 'GET',
            url: 'http://api.datamuse.com/words?' + 'sp=' + product_id + '&qe=sp&md=d&max=1',
            contentType: 'text/plain',
            xhrFields: {
              withCredentials: false
            },

            success: function(response) {
              var definition = [];
              definition = response["0"].defs;
              vm.newArray.push(definition);

          var inter = setTimeout(function() {
          CreateW(vm.newArray, product_id, degree_connection, relationship_desc);

          //Function creates board with results
          CreateB(vm.newArray, product_id, degree_connection, num_suggestions, relationship_desc);
      }, 500);

          },
          error: function() {
          console.log("Error collecting data from datamuse");
          }
          })
        }, // end of success
      error: function() {
      console.log("Error collecting data from datamuse");
      }
    })
    }
    },
    error: function() {
    console.log("Error collecting data from datamuse");
    }
    })
  },
  error: function() {
  console.log("Error collecting data from datamuse");
}
})
}

//THIS IS CALLED WHEN THE REFRESH BUTTON IS CLICKED TO GET NEW LINKS
  function RefreshBoard(remaininglinks, product_id, num_suggestions) {
    var num_suggestions = num_suggestions;
    var seed_word = product_id;
    var i = 0;
    var resultsArray = [];

    for ( ; i < num_suggestions; i++) {
      resultsArray[i] = remaininglinks[i];
    }

    var n = parseInt("0");

    for (i = 0; i < resultsArray.length; i++) {
      resultsArray[i].children = n;
    }
    //Function creates board with results
    console.log(resultsArray);
    RefreshB(resultsArray, product_id, num_suggestions, seed_word);

  }

//THIS IS CALLED WHEN THE ADD SECOND WORD IS SEARCHED USING THE ENHANCING CONNECTIONS ALGORITHM
    function RefreshBoardMatches(matchArray, objectMatch, firstResults, secondResults, current_num_suggestions, board_count) {
      var second_word = firstResults.search_word;
      var seed_word = secondResults.search_word;
      var children = current_num_suggestions;

      var i = 0;
      var count = 0;
      var countTwo = 0;

      //check match array for dups;
      var uniqMatches = new Set(matchArray);
      var length = uniqMatches.size;

      for ( ; i < length; i++) {
        count++;
        countTwo++;
      }

      var remainder = current_num_suggestions - count;
      var remainderBoard = board_count;

      //fills the rest of the array up with the top results per word for the search word
      var k = 0;
      while (k < remainderBoard) {
        //push onto end of results array
        objectMatch.push(firstResults.links[k]);
        k++;
      }

      var j = 0;
      //fills the rest of the array up with the top results
      while (j < remainder) {
        //push onto end of results array
        objectMatch.push(secondResults.links[j]);
        j++;
      }

      var n = parseInt("0");
      //console.log(objectMatch);
      //clearBoard();
      for (i = 0; i < objectMatch.length; i++) {
        objectMatch[i].children = n;
      }

      //Function replaces board with results
      //console.log(objectMatch);
      RefreshB(objectMatch, second_word, children, seed_word);
    }

//THIS OBTAINS A WORD FROM THE WORDS COLLECTION AND LOADS INTO THE BOARD
    function LoadWord(results, num_suggestions) {

      var definition = results.defs;
      var num_suggestions = num_suggestions;
      var product_id = results.search_word;
      var degree_connection = results.relationship;

      var i = 0;
      var resultsArray = [];

      for ( ; i < num_suggestions; i++) {
        resultsArray[i] = results.links[i];
      }
      resultsArray.push(definition);
      //Function creates board with results
      LoadB(resultsArray, product_id, degree_connection, num_suggestions);
    }

//CALLED IF WORD IS ALREADY IN DATABASE AND THE LINKS CAN BE ADDED WHEN WORD EXTENDED
    function UpdateLoadedWord(results, product_id, num_suggestions, seed_word) {
      var seed_word = seed_word;
      var num_suggestions = num_suggestions;
      var product_id = results.search_word;

      var i = 0;
      var resultsArray = [];

      for ( ; i < num_suggestions; i++) {
        resultsArray[i] = results.links[i];
      }

      //Function creates board with results
      UpdateLoadWord(resultsArray, product_id, num_suggestions, seed_word);
    }

//FUNCTION CALLS A WIKI SEARCH TO OBTAIN THE DEFINITION
    function WikiSearch(array, search_word, index) {
      var submittedWord = search_word;

      $.ajax({
      url: "https://en.wikipedia.org/w/api.php",
      jsonp: "callback",
      dataType: 'jsonp',
      data: {
          action: "query",
          list: "search",
          srsearch: submittedWord,
          format: "json"
        },
        xhrFields: { withCredentials: true },

        success: function(response) {
        vm.response = response;
        var string = convertWiki(vm.response);
        vm.newArray[index].defs = string;
        },
        error: function() {
        console.log("Error collecting data from wiki");
        }
      })
      }

//CALLED WHEN A SEARCH IS CONDUCTED AFTER A NODE IS EXPANDED
//Searches for a word in datamuse API using ajax to allow CORS
    function RecursiveSearch(product_id, degree_connection, num_suggestions, seed_word) {

      vm.seed_word = seed_word;
      vm.num_suggestions = num_suggestions;
      var stateBoard = GetBoard(vm.seed_word);
      //console.log(stateBoard);

      if (degree_connection == 0) {
        search_param[0] = "rel_rhy";
        search_param[1] = "rel_bgb";
        search_param[2] = "rel_bga"
        relationship_desc[0] = "rhymes";
        relationship_desc[1] = "predecessor";
        relationship_desc[2] = "successor";
      }

      if (degree_connection == 0.25) {
        search_param[0] = "rel_jjb";
        search_param[1] = "rel_jja";
        search_param[2] = "rel_ant";
        relationship_desc[0] = "adjective";
        relationship_desc[1] = "noun";
        relationship_desc[2] = "antonym";
      }

      if (degree_connection == 0.5) {
          search_param[0] = "rel_ant";
          search_param[1] = "rel_trg";
          relationship_desc[0] = "antonym";
          relationship_desc[1] = "associated";
          relationship_desc[2] = "null";
      }

      if (degree_connection == 0.75) {
          search_param[0] = "rel_com";
          search_param[1] = "rel_gen";
          search_param[2] = "ml";
          relationship_desc[0] = "comprises";
          relationship_desc[1] = "generalisation";
          relationship_desc[2] = "means";
      }

      if (degree_connection == 1) {
        search_param[0] = "rel_syn";
        search_param[1] = "ml";
        relationship_desc[0] = "synonym";
        relationship_desc[1] = "means";
        relationship_desc[2] = "null";
      }

    //ajax GET request to datamuse API
    return $.ajax({
      type: 'GET',
      url: 'http://api.datamuse.com/words?' + search_param[0] + '=' + product_id + '&md=def',
      contentType: 'text/plain',
      xhrFields: {
        withCredentials: false
      },

      success: function(response) {
        vm.results1 = response;
        var j = 0;
        //Adds the relationship label to the json object
        for (j = 0; j < vm.results1.length; j++) {
          vm.results1[j]["label"] = relationship_desc[0];
          delete vm.results1[j]["score"];
          delete vm.results1[j]["numSyllables"];
          delete vm.results1[j]["tags"];
          delete vm.results1[j]["defHeadword"];
        }

        vm.string_data1 = JSON.stringify(vm.results1); //outputs string from JSON

        vm.json_array1 = JSON.parse(vm.string_data1);

        var i = 0;
        var index = 0;
        //Removes words from blacklist
        for (i = 0; i < vm.results1.length; i++) {
          if (containsAndRemove(blacklist, vm.results1[i].word, vm.json_array1, index) === false) {
            index++;
          }
        }
    //Second AJAX call to collect more results for the other search_param
          $.ajax({
          type: 'GET',
          url: 'http://api.datamuse.com/words?' + search_param[1] + '=' + product_id + '&md=def',
          contentType: 'text/plain',
          xhrFields: {
            withCredentials: false
          },

          success: function(response) {
            vm.results2 = response;
            var j = 0;
            //Adds the relationship label to the json object - this works!!
            for (j = 0; j < vm.results2.length; j++) {
              vm.results2[j]["label"] = relationship_desc[1];
              delete vm.results2[j]["score"];
              delete vm.results2[j]["numSyllables"];
              delete vm.results2[j]["tags"];
              delete vm.results2[j]["defHeadword"];
            }


            vm.string_data2 = JSON.stringify(vm.results2); //outputs string from JSON

            vm.json_array2 = JSON.parse(vm.string_data2);

            var i = 0;
            var index = 0;
            //Removes words from blacklist
            for (i = 0; i < vm.results2.length; i++) {
              if (containsAndRemove(blacklist, vm.results2[i].word, vm.json_array2, index) === false) {
                index++;
              }
            }
            if (relationship_desc[2] === "null") {
            //Concat the json objects into one total results array
            vm.json_array1 = vm.json_array1.concat(vm.json_array2);

            //Removes duplicates from search words
            vm.newArray = removeDuplicates(vm.json_array1, "word");

            if (vm.newArray.length === 0 ) {
              document.getElementById("second_id").value = "";
              return alert('Sorry, no records found in Datamuse for word: ' + product_id + ' with connection: ' + degree_connection + ' and suggestions: ' + num_suggestions + '. Try another word.');
          }

          if (vm.newArray.length < vm.num_suggestions && vm.newArray.length > 0) {
            document.getElementById("second_id").value = "";
            return alert('Sorry, not enough records found in Datamuse for word: ' + product_id + ' with connection: ' + degree_connection + ' and suggestions: ' + num_suggestions + '. Try less suggestions.');
          }

          var j = 0;
          //Checks in def tag present, if not searches wiki
          for (j = 0; j < vm.newArray.length; j++) {
            if(!(vm.newArray[j].hasOwnProperty("defs"))) {
            WikiSearch(vm.newArray, vm.newArray[j].word, j);
          }
            //Adds the relationship label to the json object
              vm.newArray[j]["source"] =  product_id;
              vm.newArray[j]["target"] = vm.newArray[j].word;
              vm.newArray[j]["type"] = vm.newArray[j]["label"];

              delete vm.newArray[j]["word"];
              delete vm.newArray[j]["label"];
            }

            $.ajax({
              type: 'GET',
              url: 'http://api.datamuse.com/words?' + 'sp=' + product_id + '&qe=sp&md=d&max=1',
              contentType: 'text/plain',
              xhrFields: {
                withCredentials: false
              },

              //gets definition of search word
              success: function(response) {
              var definition = [];
              definition = response["0"].defs;
              if (definition !== undefined) {
              vm.newArray.push(definition);
              }
              //remove dups from board array and newArray
              var targetBoard = [];
              for (var i = 0; i < stateBoard.$$state.value.links.length; i++) {
                targetBoard.push(stateBoard.$$state.value.links[i].target);
              }

              vm.string_data4 = JSON.stringify(vm.newArray); //outputs string from JSON
              vm.json_array4 = JSON.parse(vm.string_data4);

              //problem if defintion is undefined

              var i = 0;
              var index = 0;
              //Removes words from blacklist
              for (i = 0; i < vm.newArray.length; i++) {
                if (containsAndRemove(targetBoard, vm.newArray[i].target, vm.json_array4, index) === false) {
                  index++;
                }
              }

              var inter = setTimeout(function() {
              CreateW(vm.newArray, product_id, degree_connection, relationship_desc);
              //Function creates board with results
              UpdateB(vm.json_array4, product_id, degree_connection, num_suggestions, relationship_desc, vm.seed_word);
        }, 500);
        },
        error: function() {
        console.log("Error collecting data from datamuse");
        }
        })
      } // end of if
      else {
            $.ajax({
            type: 'GET',
            url: 'http://api.datamuse.com/words?' + search_param[2] + '=' + product_id + '&md=def',
            contentType: 'text/plain',
            xhrFields: {
              withCredentials: false
            },

            success: function(response) {
              vm.results3 = response;
              var j = 0;
              //Adds the relationship label to the json object
              for (j = 0; j < vm.results3.length; j++) {
                vm.results3[j]["label"] = relationship_desc[2];
                delete vm.results3[j]["score"];
                delete vm.results3[j]["numSyllables"];
                delete vm.results3[j]["tags"];
                delete vm.results3[j]["defHeadword"];
              }

              vm.string_data3 = JSON.stringify(vm.results3); //outputs string from JSON

              vm.json_array3 = JSON.parse(vm.string_data3);

              var i = 0;
              var index = 0;
              //Removes words from blacklist
              for (i = 0; i < vm.results3.length; i++) {
                if (containsAndRemove(blacklist, vm.results3[i].word, vm.json_array3, index) === false) {
                  index++;
                }
              }

              //Concat the json objects into one total results array
              vm.json_array1 = vm.json_array1.concat(vm.json_array2);
              vm.json_array1 = vm.json_array1.concat(vm.json_array3);

              //Removes duplicates from search words
              vm.newArray = removeDuplicates(vm.json_array1, "word");

              if (vm.newArray.length === 0 ) {
                document.getElementById("second_id").value = "";
              return alert('Sorry, no records found in Datamuse for word: ' + product_id + ' with connection: ' + degree_connection + ' and suggestions: ' + num_suggestions + '. Try another word.');
            }

            if (vm.newArray.length < num_suggestions && vm.newArray.length > 0) {
              document.getElementById("second_id").value = "";
            return alert('Sorry, not enough records found in Datamuse for word: ' + product_id + ' with connection: ' + degree_connection + ' and suggestions: ' + num_suggestions + '. Try less suggestions.');
            }

            var j = 0;
            //Checks in def tag present, if not searches wiki
            for (j = 0; j < vm.newArray.length; j++) {
              if(!(vm.newArray[j].hasOwnProperty("defs"))) {
              WikiSearch(vm.newArray, vm.newArray[j].word, j);
            }
              //Adds the relationship label to the json object
                vm.newArray[j]["source"] =  product_id;
                vm.newArray[j]["target"] = vm.newArray[j].word;
                vm.newArray[j]["type"] = vm.newArray[j]["label"];

                delete vm.newArray[j]["word"];
                delete vm.newArray[j]["label"];
              }

              //gets the definition of the search word
              $.ajax({
                type: 'GET',
                url: 'http://api.datamuse.com/words?' + 'sp=' + product_id + '&qe=sp&md=d&max=1',
                contentType: 'text/plain',
                xhrFields: {
                  withCredentials: false
                },

                success: function(response) {
                var definition = [];
                definition = response["0"].defs;
                if (definition !== undefined) {
                vm.newArray.push(definition);
                }
                //remove dups from board array and newArray
                var targetBoard = [];
                for (var i = 0; i < stateBoard.$$state.value.links.length; i++) {
                  targetBoard.push(stateBoard.$$state.value.links[i].target);
                }

                vm.string_data4 = JSON.stringify(vm.newArray); //outputs string from JSON
                vm.json_array4 = JSON.parse(vm.string_data4);

                var i = 0;
                var index = 0;
                //Removes words from blacklist
                for (i = 0; i < vm.newArray.length; i++) {
                  if (containsAndRemove(targetBoard, vm.newArray[i].target, vm.json_array4, index) === false) {
                    index++;
                  }
                }

                var inter = setTimeout(function() {
                CreateW(vm.newArray, product_id, degree_connection, relationship_desc);

                //Function creates board with results
                UpdateB(vm.json_array4, product_id, degree_connection, num_suggestions, relationship_desc, vm.seed_word);

              }, 500);
              }, // end of success
              error: function() {
              console.log("Error collecting data from datamuse");
              }
            })
            },
              error: function() {
              console.log("Error collecting data from datamuse");
              }
            })
          }
          },
          error: function() {
          console.log("Error collecting data from datamuse");
          }
          })
    },
    error: function() {
    console.log("Error collecting data from datamuse");
  }
})
}

//FUNCTION TO CLEAR THE BOARD
  function clearBoard(){
    ClearBoard();
  }

//FUNCTION TO DELETE THAT LINK FROM THE BOARDS COLLECTION
  function DeleteLink(seed_word, target_word) {
    RemoveLink(seed_word, target_word);
  }

//FUNCTION TO REDUCE NUMBER OF CHILDREN FOR THAT LINK
  function DeleteChildren(seed_word, target_name, target_parent) {
    RemoveChildren(seed_word, target_name, target_parent);
  }

//HELPER FUNCTION TO CHECK IF ARRAY CONTAINS BLACKLISTED WORDS AND REMOVE THEM
  function containsAndRemove(array, object, results, index) {
    for(var i = 0; i < array.length; i++){
        if(array[i] === object) {
          //console.log("match found at " + array[i]);
          results.splice(index, 1);
          return true;
        }
      }
      return false;
  }

//HELPER FUNCTION TO REMOVE DUPLICATES FROM AN ARRAY
  function removeDuplicates(originalArray, objKey) {
    var trimmedArray = [];
    var values = [];
    var value;

    for(var i = 0; i < originalArray.length; i++) {
      value = originalArray[i][objKey];

      if(values.indexOf(value) === -1) {
        trimmedArray.push(originalArray[i]);
        values.push(value);
      }
    }
    return trimmedArray;
  }

  //HELPER FUNCTION TO OBTAIN THE WIKI RESULTS IN CORRECT FORMAT
  function convertWiki(results) {
     var myString = "";
     var i = 0;
     while (i < results.query.search.length) {
       myString = myString + (results.query.search[i].title + ". ");
       i++;
       }
       return myString;
 }

//HANDLER FUNCTIONS
  function handleSuccess(res) {
      return res.data;
  }
  function handleError(res) {
      return $q.reject(res.data);
  }

} //controller closure

})(); // end of file
