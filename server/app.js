// creating global parameters and start
// listening to 'process.env.PORT', we are creating an express
// server and then we are binding it with socket.io
var express      = require('express');
var app          = express();
var server       = require('http').createServer(app);
var io           = require('socket.io').listen(server);
process.env.PORT = process.env.PORT || 1337;
var path         = require('path');
var url          = 'http://localhost:' + process.env.PORT + '/';
var db           = require('db/queries');


/* We can access nodejitsu enviroment variables from process.env */
/* Note: the SUBDOMAIN variable will always be defined for a nodejitsu app */
if(process.env.SUBDOMAIN){
  url = 'http://' + process.env.SUBDOMAIN + '.jit.su/';
}

// listening to process.env.PORT...
server.listen(process.env.PORT);
console.log("Express server listening on port " + process.env.PORT);
console.log(url);

// log it all
io.set('log level', 2);

// give the client access to all client files
app.use(express.static(path.join(__dirname, '../build/client')));

// serving the main applicaion file (index.html)
// when a client makes a request to the app root
// http://localhost:1337
app.get('/', function (req, res) {
    res.sendfile(path.join(__dirname, '../build/client/index.html'));
});

app.get('/rooms', function (req, res) {
    db.getRooms(function(err, rooms){
        if (err) { res.send(403, err); throw err; }
        res.json(rooms);
    });
});

app.get('/rooms/:id', function (req, res) {
    db.getRoomInfo(req.param('id'), function(err, roomInfo){
        if (err) { res.send(403, err); throw err; }
        res.json(roomInfo);
    });
});

// Holds players
var players = {};

var mapItems = [
    { type: 'Alien Space Station', pos: [0, 1000], rot: 0, hp: 100 },
    { type: 'Human Space Station',  pos: [0, -1000], rot: Math.PI*2, hp: 100 }
];

var mapSize = 1600;
var maxSpeed = 200; // units per second

function getRandomCoord() {
    return Math.random()*mapSize - mapSize/2;
}

function getRandomPosition() {
    return [getRandomCoord(), 140, getRandomCoord()];
}

function getTime() {
    return (new Date()).getTime();
}

var socketManager = require('./io/manager.js')(mapItems, io);
io.sockets.on('connection', socketManager);

