/*The express server file is the entry point into the nodejs application, it defines app wide settings,
binds controllers to routes and starts the http server */
require('rootpath')();
var express = require('express');
var path = require('path');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser'); //To extract params from the body of the requests
var expressJwt = require('express-jwt');
var config = require('config.json');
var d3 = require("d3");
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/boards', require('./controllers/api/boards.controller'));

// make '/app' default route
app.get('/', function (req, res, next) {
    return res.redirect('/app');
});

// start server
var server = app.listen(3000, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});
