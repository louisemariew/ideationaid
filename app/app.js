/* The app.js file is the entry point for the angular application where the app
module is declared along with dependencies, and contains configuration and
startup logic for when the app is first loaded */

(function () {
    'use strict';

    angular
        .module('app', ['ui.router'])
        .config(config)
        .run(run);

//The config function is used to define the routes of the application using the Angular UI Router.
    function config($stateProvider, $urlRouterProvider) {
        // default route
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })
            .state('boards', {
                url: '/boards',
                templateUrl: 'boards/index.html',
                controller: 'Boards.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'boards'}
            });
    }

/*The run function adds the JWT token as the default authorization header for all
http requests made by the application, this is required to authenticate to the web api*/
    function run($http, $rootScope, $window) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });
    }

/*The last function in the file is used for manually bootstrapping the angular application after the JWT token
is retrieved from the server, this is done to prevent the angular app from starting before the token is available*/
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            window.jwtToken = token;

            angular.bootstrap(document, ['app']);
        });
    });
})();
