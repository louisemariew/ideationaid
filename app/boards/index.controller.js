  (function () {
      'use strict';

      angular
          .module('app')
          .controller('Boards.IndexController', Controller);

      /*$rootScope var which points to the parent of all the scopes and can be injected everywhere.
      All other scopes are links of the $rootScope. They are created via the $new method of the
      $rootScope thus every scope inherits from the $rootScope*/
      function Controller($rootScope, $scope, BoardsService, FlashService) {

        var vm = this;
        // Initialise controller variables
        vm.word = {};
        vm.query = {};
        vm.query2 = {};
        vm.json = {};
        vm.checkForm = checkForm;
        vm.clearBoard = clearBoard;
        vm.showBoard = showBoard;
        vm.secondWord = secondWord;
        vm.downloadWord = downloadWord;
        vm.refreshWords = refreshWords;
        vm.refreshCount = 0;
        vm.showInstructions = showInstructions;
        vm.hideInstructions = hideInstructions;
        vm.callCount = 0;
        // Initialise scope variables
        $scope.words = null;
        $scope.product_id = null;
        $scope.degree_connection = 0.5;
        $scope.num_suggestions = 5;
        $scope.second_id = null;
        $scope.seed_word = null;

        //THIS IS CALLED WHEN FIRST SEARCH WORD IS ENTERED
        //Checks the search box has been filled out
        function checkForm() {
          BoardsService.ClearBoard();
          var product_id = document.forms["searchForm"]["product_id"].value;
          var degree_connection = document.forms["searchForm"]["degree_connection"].value;
          var num_suggestions = document.forms["searchForm"]["num_suggestions"].value;
          document.getElementById("product_id").disabled = true;

          if (degree_connection === undefined) {
            degree_connection = 0.5;
          }

          if (num_suggestions === undefined) {
            num_suggestionsn = 5;
          }

          //Ensures word input is all lower case
          vm.word = product_id.toLowerCase();

          if (vm.word!=""){
            searchLedger(vm.word, degree_connection, num_suggestions);
            $scope.product_id = product_id;
            $scope.degree_connection = degree_connection;
            $scope.num_suggestions = num_suggestions;
            $scope.seed_word = document.getElementById("product_id").value;
            setTimeout(showBoard, 4000);
          }
          else {
            alert("Please fill out");
            document.getElementById("product_id").disabled = false;
            return false;
          }
        }

        //FUNCTION IS CALLED WHEN ADD ANOTHER WORD IS SEARCHED
          function secondWord() {
            document.getElementById("refresh").disabled = true;
            var second_id = document.forms["secondWord"]["second_id"].value;
            var degree_connection = document.forms["searchForm"]["degree_connection"].value;
            var num_suggestions = document.forms["searchForm"]["num_suggestions"].value;
            var boardResults = {};

            //grab state of the board before updating
            BoardsService.GetBoard($scope.seed_word)
                .then(function (results) {
                  boardResults = results;

            if (degree_connection === undefined) {
              degree_connection = 0.5;
            }

            if (num_suggestions === undefined) {
              num_suggestionsn = 5;
            }
            //Ensures word input is all lower case
            vm.word = second_id.toLowerCase();

            if (vm.word!=""){
              updateB(vm.word, degree_connection, num_suggestions, $scope.seed_word);
              $scope.second_id = second_id;
              //$scope.degree_connection = degree_connection;
              //$scope.num_suggestions = num_suggestions;
              connectWordsOnBoard(boardResults, $scope.second_id, degree_connection, num_suggestions);
              setTimeout(showBoard, 5500);
              document.getElementById("second_id").value = "";
            }
            else {
              alert("Please fill out");
              return;
            }
            })
        }

        //CALLED WHEN A SEARCH IS MADE FROM THE TOOLBAR
        // Function to search within ideator database for that word ID
        function searchLedger(word, degree_connection, num_suggestions) {
        $scope.seed_word = word;
        //First checks if the word is loaded in the database already
          BoardsService.GetWord(word, degree_connection)
              .then(function (results) {
                //If word isn't in database
                  if (results.length === 0){
                    //Call function to search word in datamuse
                  BoardsService.SearchWord(word, degree_connection, num_suggestions)
                    .then(function (results) {
                      $scope.words = results;
                      $scope.seed_word = word;
                    })
                  //If word is in database
                  } else {
                    $scope.seed_word = word;
                    $scope.words = results;
                    BoardsService.LoadWord(results, num_suggestions);
                    vm.show = false;
                  }
              })
              .catch(function (error) {
                  FlashService.Error(error + '. Please enter valid search criteria');
              });
        }

    //THIS IS CALLED WHEN NODES ARE EXPANDED
        // Function to search within ideator database for that word ID
        function updateB(product_id, degree_connection, num_suggestions, seed_word) {
          //First checks if the word is loaded in the database already
          document.getElementById("refresh").disabled = true;
            BoardsService.GetWord(product_id, degree_connection)
                .then(function (results) {
                  //If word isn't in database
                    if (results.length === 0){
                    //Call function to search word in datamuse
                    BoardsService.RecursiveSearch(product_id, degree_connection, num_suggestions, seed_word)
                      .then(function (results) {
                        $scope.words = results;
                        vm.show = false;
                      })
                      //If word is in database
                      } else {
                        $scope.words = results;
                        BoardsService.UpdateLoadedWord(results, product_id, num_suggestions, seed_word);
                        vm.show = false;
                      }
                })
                .catch(function (error) {
                    FlashService.Error(error + '. Please enter valid search criteria');
                    vm.show = false;
                });
        }

        // Function to search within ideator database for that word ID for a second word
        function deleteLink(seed_word, target_word) {
          BoardsService.DeleteLink(seed_word, target_word);
        }

        // Function to search within ideator database for that word ID for a second word
        function deleteChildren(seed_word, target_name, target_parent) {
          BoardsService.DeleteChildren(seed_word, target_name, target_parent);
        }

        //THIS CLEARS THE SVG BOARD AND RESETS THE TOOLBAR TO DEFAULT STATUS
        function clearBoard() {
          vm.refreshCount = 0;
          BoardsService.ClearBoard();
          d3.select("svg").remove();
          document.getElementById("product_id").disabled = false;
          document.getElementById("product_id").value = "";
          document.getElementById("refresh").disabled = false;
        }

        //THIS IS FOR THE INSTRUCTION BOX
        function showInstructions() {
          $("#click-me").click(function () {

              $.ajax({
                  success: function (data) {
                      $('#info-modal').addClass("show");
                  },
                  async: true
              });

          });
        }
        function hideInstructions() {
        $(".modal-dialog .close").click(function(){

            $(this).closest(".modal-dialog").removeClass("show");

        });
      }

      //TIMER FUNCTION
      function waitAndCallRefresh(func)
      {
        setTimeout(func,2500);
      }

      //THIS IS FOR DISPLAYING THE BOARD DATA
        function showBoard() {
          d3.select("svg").remove();
          showTree();
        }

        //THIS IS FOR THE REFRESH BUTTON
        //function for fetching new nodes
        function refreshWords() {
        vm.refreshCount++;
        var num_suggestions = document.forms["searchForm"]["num_suggestions"].value;
        BoardsService.GetWord($scope.seed_word, $scope.degree_connection)
            .then(function (results) {
              var length = results.links.length;
              var remaininglinks = results.links.slice(num_suggestions * vm.refreshCount, length);
              if (remaininglinks.length < num_suggestions){
                return alert('Sorry, no more results found for word: ' + $scope.seed_word + ' with connection: ' +  $scope.degree_connection + ' and suggestions: ' + num_suggestions + '. Try another word.');
              }
              //BoardsService.ClearBoard();
              d3.select("svg").remove();
              BoardsService.RefreshBoard(remaininglinks, $scope.seed_word, num_suggestions);
              setTimeout(showBoard, 4500);
          });
        }

        //THIS IS FOR THE ENHANCING CONNECIONS ALGORITHM
        //function to iterate through seed word and return matching words from second word
        function getMatches(first, second) {
          var matches = [];
          var lengthFirst = first.links.length;
          var lengthSecond = second.links.length;

          var i = 0;
          //var j = 0;
          console.log(first.links);
          console.log(second.links);
          while (i < lengthFirst) {
              for (var j = 0; j < lengthSecond; j++) {
                if ((first.links[i].target === second.links[j].target) && (first.links[i].source !== second.links[i].source)) {
                  //console.log("Matches second word at " + second.links[j].target);
                  matches.push(second.links[j].target);
                }
              }
                i++;
              }
              return matches;
        }

        //HELPER FUNCTION FOR THE ENHANCING CONNECTIONS ALGORITHM
        //function to iterate through and return the object of the matching word
        function getObject(array, matchWord) {
          var objectMatch = {};
          var length = array.links.length;

          var i = 0;
          while (i < length) {
            if (array.links[i].target === matchWord) {
            objectMatch = array.links[i];
          }
          i++;
        }
          return objectMatch;
        }

          //THIS IS THE ENHANCING CONNECTIONS ALGORITHM
        function connectWordsOnBoard(results, second, degree_connection, current_num_suggestions) {
          var firstResults = results;
          var secondResults = {};
          var seed_num_suggestions = $scope.num_suggestions;

          waitAndCallRefresh(function(){
          obtainWord();
        });

        //console.log(firstResults.links);
        var lengthBoard = firstResults.links.length;

        //FUNCTION USED IN ENHANCING CONNECTIONS TO OBTAIN FULL RESULTS FOR A WORD AND COMPARE MATCHES
          function obtainWord() {
          //function to get the word results to compare to board words
          BoardsService.GetWord(second, degree_connection)
          .then(function (resultsSecond) {
            secondResults = resultsSecond;
            var num_suggestions = $scope.num_suggestions;
            var matchArray = getMatches(firstResults, secondResults);
            var matchLength = matchArray.length;

            //need to add the matching words x2 so for each seed word and the second word
            var matchObject = {};
            var matchTwo = {};
            var objectMatch = [];

            var i = 0;
            while (i < matchLength) {
              matchObject = getObject(firstResults, matchArray[i]);
              matchTwo = getObject(secondResults, matchArray[i]);
              objectMatch.push(matchObject);
              objectMatch.push(matchTwo);
              i++;
            }
            //console.log(objectMatch);
            //pass in the matching word array, seed word, the product_id and the number of suggestions
            console.log(matchArray);
            console.log(objectMatch);

            function uniq(a) {
              return Array.from(new Set(a));
            }

            var removedArray = uniq(matchArray);

            var removedObjectMatch = uniq(objectMatch);

            console.log(removedArray);
            console.log(removedObjectMatch);

            BoardsService.RefreshBoardMatches(removedArray, removedObjectMatch, firstResults, secondResults, current_num_suggestions, lengthBoard);
      });
      }
    }
        //Function to create png in separate tab
        function downloadWord() {
            var e = document.createElement('script');
            if (window.location.protocol === 'https:') {
                e.setAttribute('src', 'https://rawgit.com/NYTimes/svg-crowbar/gh-pages/svg-crowbar.js');
            } else {
                e.setAttribute('src', 'http://nytimes.github.com/svg-crowbar/svg-crowbar.js');
            }
            e.setAttribute('class', 'svg-crowbar');
            document.body.appendChild(e);
        }

    //CODE FOR THE D3 SVG GRAPHICS - idea board
    function showTree() {

          //Get json file
          d3.json("boards.json", function(data) {

          var width = 1200,
              height = 1000;

          var number_nodes = $scope.num_suggestions;

          var svg = d3.select("body").append("svg")
              .attr("width", width)
              .attr("height", height);

          var old_links = data;
          //var num_children_scope = old_links.children;
          var num_children = document.forms["searchForm"]["num_suggestions"].value;
          //Removes the ID element
          var links = old_links.links.slice(0);
          //links.splice(number_nodes, links.length - number_nodes);

          var newNodes = {};
          var newLinks = {};

          //loop through the links[i].target.name and if none of them === source.parent then it's a unique set of nodes
          //how to find centre node = links.source.name is the centre node
          var nodes = {};

          //see stackoverflow: https://stackoverflow.com/questions/38907522/force-directed-graph-error-cannot-read-property-push-of-undefined
          links.forEach(function(link) {
            link.source = nodes[link.source] ||
                          (nodes[link.source] = {
                          name: link.source,
                          parent: $scope.seed_word,
                          children: num_children,
                          type: link.type,
                          defs: link.defs
                        });


            link.target = nodes[link.target] ||
                          (nodes[link.target] = {
                          name: link.target,
                          parent: link.source.name,
                          children: link.children,
                          type: link.type,
                          defs: link.defs
                          });
          //overwrites new search word type if it's different
           if (link.target.type !== link.type) {
             link.type = link.source.type;
           }
          });

          if(nodes[$scope.seed_word].source === undefined) {
            nodes[$scope.seed_word].type = "";
            nodes[$scope.seed_word].defs = data.defs;
          }

          //console.log(links);
          //console.log(nodes);

            var force = d3.layout.force()
                .nodes(d3.values(nodes))
                .links(links)
                .size([width, height])
                .linkDistance(180)
                .charge(function(d){
                    var charge = -500;
                    if (d.index === 0) charge = 10 * charge;
                    return charge;
                })
                .gravity(.06)
                .on("tick", tick)
                .start();

            // Define the div for the tooltip
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .attr('text-anchor', 'left')
                .style("opacity", 0);

            //need the transition after the enter()
            var link = svg.selectAll(".link")
                .data(force.links())
              .enter()
                .append("g") // groups it together
                .attr("class", "link")
                .append("line") //
                .attr("class", "link-line");

              var node = svg.selectAll(".node")
                  .data(force.nodes())
                  .enter()
                  .append("g") // may take out
                  .attr("class", "node")
                  .on("mouseover", function(d) {
                    d3.select(this).select("circle").transition()
                        .duration(750)
                        .attr("r", 45)
                        .style("fill", "#fd8d3c") //orange
                    show(d);
                    clicker(d);
                  })
                  .on("mouseout", hide)
                  .call(force.drag);

              node.append("circle")
                  .attr("r", 45);

              node.select("circle")
                  .style("fill", '#9ED8F4')//'#3182bd')
                  .style("stroke", "grey");   // set the line colour

              node.append("text")
                  .attr('text-anchor', 'middle')
                  .attr('dy', '.35em') // vertically centre text
                  .style("font", "normal 14px Arial")
                  .text(function(d) { return d.name; });

              //Calls the click and double click events
              function clicker(d) {
              var cc = clickcancel(d);
              d3.selectAll('.node')
              .call(cc)
              cc.on('click', function(a) {
                click(d);
                hide(d);
              });
              cc.on('dblclick', function(a) {
                expandNode(d);
                hide(d);
              });
            }

          function isArray(ob) {
            return ob.constructor === Array;
          }

          function show(d) {
          //  console.log(d);
            //console.log(d.defs);
            //console.log(data.defs); // this is just the seed word def
            if(d.defs === null || d.defs === "undefined"){
              var newString = "No definition available from Wiki or Datamuse";
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
              div	.html(newString)
                  .style("left", "200px")
                  .style("bottom", "200px")
                  return;
            }
              if (isArray(d.defs)) {
              var string = splitDefs(d);
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
              div	.html(string)
                  .style("left", "200px")
                  .style("bottom", "200px")
                  return;
                }
                if (!(isArray(d.defs))) {
                //var string = splitDefs(d);
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div	.html(d.defs)
                    .style("left", "200px")
                    .style("bottom", "200px")
                    return;
                  }
            }

            function splitDefs(d) {
              var myString = "";
              var myArray = [];
              var i = 0, j = 0, m = 1, n = 2;
              while (i < d.defs.length) {
                if (d.defs[i][j] === "n") {
                  var newstr = d.defs[i].replace(/n/i, "<strong>noun</strong>");
                  myArray.push(newstr);
                }
                if (d.defs[i][j] === "v") {
                  var newstr = d.defs[i].replace(/v/i, "<strong>verb</strong>");
                  myArray.push(newstr);
                }
                if (d.defs[i][j] === "a" && d.defs[i][m] === "d" && d.defs[i][n] === "v") {
                  var newstr = d.defs[i].replace(/adv/i, "<strong>abverb</strong>");
                  myArray.push(newstr);
                }
                if (d.defs[i][j] === "a" && d.defs[i][m] === "d" && d.defs[i][n] === "j") {
                  var newstr = d.defs[i].replace(/adj/i, "<strong>abjective</strong>");
                  myArray.push(newstr);
                }
                i++;
              }
              var k = 0;
              while (k < myArray.length) {
                myString = myString + (myArray[k] + "<br>");
                k++;
                }
                return myString;
              }

            function hide(d) {
              d3.select(this).select("circle").transition()
                  .duration(750)
                  .attr("r", 45)
                  .style("fill", '#9ED8F4') //blue
              div.transition()
                  .duration(200)
                  .style("opacity", .0);
              }

          var labelLine = svg.selectAll(".link")
              .append("text")
              .attr("class", "link-label")
              .attr("fill", function(d) { return colour(d) })
              .style("font", "bold 12px Arial")
              .attr("dy", ".35em")
              .attr("text-anchor", "middle")
              .text(function(d) {
                  return d.type;
              });

          function clickcancel(d) {
            var currentNode = d;
              var event = d3.dispatch('click', 'dblclick');
              function cc(selection) {
                  var down,
                      tolerance = 5,
                      last,
                      wait = null;
                  // euclidean distance
                  function dist(a, b) {
                      return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
                  }
                  selection.on('mousedown', function() {
                      down = d3.mouse(document.body);
                      last = +new Date();
                  });
                  selection.on('mouseup', function() {
                      if (dist(down, d3.mouse(document.body)) > tolerance) {
                          return;
                      } else {
                          if (wait) {
                              window.clearTimeout(wait);
                              wait = null;
                              event.dblclick(d3.event);
                          } else {
                              wait = window.setTimeout((function(e) {
                                  return function() {
                                      event.click(e);
                                      wait = null;
                                  };
                              })(d3.event), 300);
                          }
                      }
                  });
              };
              return d3.rebind(cc, event, 'on');
          }

          function tick() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            labelLine
                .attr("x", function(d) {
                    return (d.source.x + d.target.x)/2; })
                .attr("y", function(d) {
                    return (d.source.y + d.target.y)/2; });
            node
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .each(collide(0.5)); //Added to prevent overlapping nodes
          }

          // Resolves collisions between d and all other circles. This prevents nodes from overlapping on the board
          function collide(alpha) {
            var maxRadius = 12;
            var padding = 1.5; // separation between same-color circles
            var clusterPadding = 6; // separation between different-color circles

            var quadtree = d3.geom.quadtree(nodes);
            return function(d) {
              var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                  nx1 = d.x - r,
                  nx2 = d.x + r,
                  ny1 = d.y - r,
                  ny2 = d.y + r;
              quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                  var x = d.x - quad.point.x,
                      y = d.y - quad.point.y,
                      l = Math.sqrt(x * x + y * y),
                      r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                  if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                  }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
              });
            };
          }

          function countInArray(array, what) {
            var count = 0;
            for (var i = 0; i < array.length; i++) {
                if (array[i].target.name === what) {
                    count++;
                }
            }
            return count;
        }

          //Remove nodes on click
          function click(d) {
            var num = countInArray(links, d.name);
            //console.log(num);
            if ((num < 2) && (d.children === 0)) {
            removeNode(d);
            removeLinksNodes(d);
            redraw(newNodes, newLinks);
          }
        }

          //Colours the words on the link labels different colours
          function colour(d) {

            if (d.type === "synonym") {
            return "#b82e2e"; //dark pink
            }

            if (d.type === "means") {
            return "#aaaa11"; //mustard
            }

            //degree connection = 0.75
            if (d.type === "generalisation") {
            return "#66aa00"; //lime green
            }
            if (d.type === "comprises") {
            return "#dd4477"; //pink
            }

            //degree_connection = 0.5
            if (d.type === "associated") {
            return "#990099"; //purple
            }
            if (d.type === "antonym") {
            return "#0099c6"; //darkish blue
            }

            //degree connection = 0.25
            if (d.type === "noun") {
            return "#109618"; //green
            }
            if (d.type === "adjective") {
            return "#ff9900"; //dark yellow
            }

            //degree connection = 0
            if (d.type === "rhymes") {
            return "#3366cc"; //purply blue
            }
            if (d.type === "predecessor") {
            return "#dc3912"; //dark orange
            }

            if (d.type === "successor") {
            return "#000000"; //black
            }
          }

          //Recursive search on click FIRST TIME
          function expandNode(d) {
            var degree_connection = document.forms["searchForm"]["degree_connection"].value;
            var num_suggestions = document.forms["searchForm"]["num_suggestions"].value;
            updateB(d.name, degree_connection, num_suggestions, $scope.seed_word);
            setTimeout(getData, 4500);
            //update();
          }

    function getData() {
      $.ajax({
      url: 'boards.json',
      type: 'get',
      error: function(newData){
      },
      success: function(newData){
      //  console.log(newData);

        var old_links = newData;
        var num_children = old_links.children;

        //Removes the ID element
        var links = old_links.links.slice(0);
        //links.splice(number_nodes, links.length - number_nodes);

        var newNodes = {};
        var newLinks = {};

        //loop through the links[i].target.name and if none of them === source.parent then it's a unique set of nodes
        //how to find centre node = links.source.name is the centre node
        var nodes = {};

        //see stackoverflow: https://stackoverflow.com/questions/38907522/force-directed-graph-error-cannot-read-property-push-of-undefined
        links.forEach(function(link) {

          link.source = nodes[link.source] ||
                        (nodes[link.source] = {
                        name: link.source,
                        parent: $scope.seed_word,
                        children: num_children,
                        type: link.type,
                        defs: link.defs
                      });

          link.target = nodes[link.target] ||
                        (nodes[link.target] = {
                        name: link.target,
                        parent: link.source.name,
                        children: link.children,
                        type: link.type,
                        defs: link.defs
                        });

        //overwrites new search word type if it's different
         if (link.target.type !== link.type) {
           link.type = link.source.type;
         }
        });

        if(nodes[$scope.seed_word].source === undefined) {
          nodes[$scope.seed_word].type = "";
          nodes[$scope.seed_word].defs = data.defs;
        }

        //console.log(links);
        //console.log(nodes);

           redraw(nodes,links);
         }
      });
    }

      function removeNode(d) {
        deleteLink($scope.seed_word, d.name);
        if(d.children > 0) {
        deleteChildren($scope.seed_word, d.name, d.parent);
      }
      }

        //Finds the index of the word in the array
        function indexOfWord(array, word) {
          for(var i = 0 ; i < array.length ; i++){
            if(array[i].target.name === word){
              return i;
            }
          }
          return -1;
        }

        //Need to remove links and nodes for the selected node
        function removeLinksNodes(d) {
          links.splice(indexOfWord(links, d.name), 1);
          var newChildren = nodes[d.parent].children - 1;
          nodes[d.parent].children = newChildren;
          newLinks = links;
          delete nodes[d.name];
          newNodes = nodes;
        }

    //Redraws the graph
    function redraw(newNodes, newLinks) {

    clearSVG();

    var width = 1200,
        height = 1000;

      var force = d3.layout.force()
          .nodes(d3.values(newNodes))
          .links(newLinks)
          .size([width, height])
          .linkDistance(180)
          .charge(-600)
          .gravity(.06)
          .on("tick", tick)
          .start();

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var link = svg.selectAll(".link")
        .data(force.links())
      .enter()
        .append("g")
        .attr("class", "link")
        .append("line")
        .attr("class", "link-line");

    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter()
        .append("g")
        .attr("class", "node")
        .on("mouseover", function(d) {
          d3.select(this).select("circle").transition()
              .duration(750)
              .attr("r", 45)
              .style("fill", "#fd8d3c") //orange
          show(d);
          clicker(d);
        })
        .on("mouseout", hide)
        .call(force.drag);

    node.append("circle")
        .attr("r", 45);

    node.select("circle")
        .style("fill", '#9ED8F4')//'#3182bd')
        .style("stroke", "grey");   // set the line colour

    node.append("text")
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em') // vertically centre text regardless of font size
        .style("font", "normal 14px Arial")
        .text(function(d) { return d.name; });

      //Calls the click and double click events
      function clicker(d) {
      var cc = clickcancel(d);
      d3.selectAll('.node')
      .call(cc)
      cc.on('click', function(a) {
        recursiveClick(d);
        hide(d);
      });
      cc.on('dblclick', function(a) {
        expandNode(d);
        hide(d);
      });
    }

    function isArray(ob) {
      return ob.constructor === Array;
    }

    function show(d) {
      //console.log(d);
      if(d.defs === null || d.defs === "undefined"){
        var newString = "No definition available from Wiki or Datamuse";
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div	.html(newString)
            .style("left", "200px")
            .style("bottom", "200px")
            return;
      }
      if (isArray(d.defs)) {
      var string = splitDefs(d);
      div.transition()
          .duration(200)
          .style("opacity", .9);
      div	.html(string)
          .style("left", "200px")
          .style("bottom", "200px")
          return;
        }
          if (!(isArray(d.defs))) {
          //var string = splitDefs(d);
          div.transition()
              .duration(200)
              .style("opacity", .9);
          div	.html(d.defs)
              .style("left", "200px")
              .style("bottom", "200px")
              return;
            }
      }

      function splitDefs(d) {
        var myString = "";
        var myArray = [];
        var i = 0, j = 0, m = 1, n = 2;
        while (i < d.defs.length) {
          if (d.defs[i][j] === "n") {
            var newstr = d.defs[i].replace(/n/i, "<strong>noun</strong>");
            myArray.push(newstr);
          }
          if (d.defs[i][j] === "v") {
            var newstr = d.defs[i].replace(/v/i, "<strong>verb</strong>");
            myArray.push(newstr);
          }
          if (d.defs[i][j] === "a" && d.defs[i][m] === "d" && d.defs[i][n] === "v") {
            var newstr = d.defs[i].replace(/adv/i, "<strong>abverb</strong>");
            myArray.push(newstr);
          }
          if (d.defs[i][j] === "a" && d.defs[i][m] === "d" && d.defs[i][n] === "j") {
            var newstr = d.defs[i].replace(/adj/i, "<strong>abjective</strong>");
            myArray.push(newstr);
          }
          i++;
        }
        var k = 0;
        while (k < myArray.length) {
          myString = myString + (myArray[k] + "<br>");
          k++;
          }
          return myString;
        }

    function hide(d) {
      d3.select(this).select("circle").transition()
          .duration(750)
          .attr("r", 45)
          .style("fill", '#9ED8F4') //blue
      div.transition()
          .duration(200)
          .style("opacity", .0);
      }

    var labelLine = svg.selectAll(".link")
        .append("text")
        .attr("class", "link-label")
        .attr("fill", function(d) { return colour(d) })
        .style("font", "bold 12px Arial")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
          .text(function(d) {
              return d.type;
        });

    function clickcancel(d) {
     var currentNode = d;
       var event = d3.dispatch('click', 'dblclick');
       function cc(selection) {
           var down,
               tolerance = 5,
               last,
               wait = null;
           // euclidean distance
           function dist(a, b) {
               return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
           }
           selection.on('mousedown', function() {
               down = d3.mouse(document.body);
               last = +new Date();
           });
           selection.on('mouseup', function() {
               if (dist(down, d3.mouse(document.body)) > tolerance) {
                   return;
               } else {
                   if (wait) {
                       window.clearTimeout(wait);
                       wait = null;
                       event.dblclick(d3.event);
                   } else {
                       wait = window.setTimeout((function(e) {
                           return function() {
                               event.click(e);
                               wait = null;
                           };
                       })(d3.event), 300);
                   }
               }
           });
       };
       return d3.rebind(cc, event, 'on');
    }

     //This prevents nodes from overlapping on the board
     var padding = 1, // separation between circles
         radius = 8;

     function collide(alpha) {
       var quadtree = d3.geom.quadtree(nodes);
       return function(d) {
         var rb = 2*radius + padding,
             nx1 = d.x - rb,
             nx2 = d.x + rb,
             ny1 = d.y - rb,
             ny2 = d.y + rb;
         quadtree.visit(function(quad, x1, y1, x2, y2) {
           if (quad.point && (quad.point !== d)) {
             var x = d.x - quad.point.x,
                 y = d.y - quad.point.y,
                 l = Math.sqrt(x * x + y * y);
               if (l < rb) {
               l = (l - rb) / l * alpha;
               d.x -= x *= l;
               d.y -= y *= l;
               quad.point.x += x;
               quad.point.y += y;
             }
           }
           return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
         });
       };
     }

     function tick() {
       link
           .attr("x1", function(d) { return d.source.x; })
           .attr("y1", function(d) { return d.source.y; })
           .attr("x2", function(d) { return d.target.x; })
           .attr("y2", function(d) { return d.target.y; });

       labelLine
           .attr("x", function(d) {
               return (d.source.x + d.target.x)/2; })
           .attr("y", function(d) {
               return (d.source.y + d.target.y)/2; });
       node
           .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
           .each(collide(0.5)); //Added to prevent overlapping nodes
     }

     function clearSVG() {
      // console.log("hello from SVG");
      d3.select("svg").remove();
         nodes = [];
         links = [];
     }

     function countInArray(array, what) {
       var count = 0;
       for (var i = 0; i < array.length; i++) {
           if (array[i].target.name === what) {
               count++;
           }
       }
       return count;
    }

    //Recursive remove nodes on click
    function recursiveClick(d) {
      var num = countInArray(newLinks, d.name);
      //console.log(num);
      if ((num < 2) && (d.children === 0)) {
        removeNode(d);
        removeLinksNodesAgain(d);
        redraw(newNodes, newLinks);
      }
      }

    //Need to remove links and nodes for the selected node
    function removeLinksNodesAgain(d) {
      newLinks.splice(indexOfWord(newLinks, d.name), 1);
        var newChildren = newNodes[d.parent].children - 1;
      newNodes[d.parent].children = newChildren;
      newLinks = newLinks;
      delete newNodes[d.name];
      newNodes = newNodes;
    }

    function removeNode(d) {
        deleteLink($scope.seed_word, d.name);
        if(d.children > 0) {
        deleteChildren($scope.seed_word, d.name, d.parent);
      }
    }

    //Finds the index of the word in the array
    function indexOfWord(array, word) {
      for(var i = 0 ; i < array.length ; i++){
        if(array[i].target.name === word){
          return i;
        }
      }
      return -1;
    }

    //Recursive search on click
    function expandNode(d) {
      var degree_connection = document.forms["searchForm"]["degree_connection"].value;
      var num_suggestions = document.forms["searchForm"]["num_suggestions"].value;
      updateB(d.name, degree_connection, num_suggestions, $scope.seed_word);
      setTimeout(getData, 4500);
      //update();
    }

    function getData() {
      $.ajax({
      url: 'boards.json',
      type: 'get',
      error: function(data){
      },
      success: function(data){
      //  data=jQuery.parseJSON(data);
      //  console.log(data);

        var old_links = data;
        var num_children = old_links.children;

        //Removes the ID element
        var links = old_links.links.slice(0);
        //links.splice(number_nodes, links.length - number_nodes);

        var newNodes = {};
        var newLinks = {};

        //loop through the links[i].target.name and if none of them === source.parent then it's a unique set of nodes
        var nodes = {};
        links.forEach(function(link) {

          link.source = nodes[link.source] ||
                        (nodes[link.source] = {
                        name: link.source,
                        parent: $scope.seed_word,
                        children: num_children,
                        type: link.type,
                        defs: link.defs
                      });

          link.target = nodes[link.target] ||
                        (nodes[link.target] = {
                        name: link.target,
                        parent: link.source.name,
                        children: link.children,
                        type: link.type,
                        defs: link.defs
                        });

              //overwrites new search word type if it's different
               if (link.target.type !== link.type) {
                 link.type = link.source.type;
               }
              });

            if(nodes[$scope.seed_word].source === undefined) {
              nodes[$scope.seed_word].type = "";
              nodes[$scope.seed_word].defs = data.defs;
            }

          //console.log(links);
          //console.log(nodes);
          redraw(nodes,links);
        }
    });
  }
} //end of redraw

  //HELPER FUNCTION TO CLEAR SVG
      function clearSVG() {
        d3.select("svg").remove();
        //console.log("hello from svg");
          nodes = [];
          links = [];
    }
  }) //first data closure
} // show tree closure

}   //controller closure
})();
