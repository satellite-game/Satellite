var express      = require('express');
var app          = express();
var server       = require('http').createServer(app);
var io           = require('socket.io').listen(server);
process.env.PORT = process.env.PORT || 1337;
var path         = require('path');
var url          = 'http://localhost:' + process.env.PORT + '/';
var db           = require('./db/queries');

// listening to process.env.PORT...
server.listen(process.env.PORT);
console.log("Express server listening on port " + process.env.PORT);
console.log(url);

// log it all
io.set('log level', 2);

// give the client access to all client files
app.use(express.static(path.join(__dirname, '../build/client')));

// serving the main applicaion file (index.html)
app.get('/', function (req, res) {
    res.sendfile(path.join(__dirname, '../build/client/index.html'));
});
// serves basic room details
app.get('/rooms', function (req, res) {
    db.getRooms(function(err, rooms){
        if (err) { res.send(403, err); throw err; }
        res.json(rooms);
    });
});

// serves player stats for in-game menu
app.get('/rooms/:id', function (req, res) {
    db.getRoomInfo(req.param('id'), function(err, roomInfo){
        if (err) { res.send(403, err); throw err; }
        res.json(roomInfo);
    });
});

var mapItems = [
    { type: 'Alien Space Station', pos: [0, 1000], rot: 0, hp: 100 },
    { type: 'Human Space Station',  pos: [0, -1000], rot: Math.PI*2, hp: 100 }
];

var socketManager = require('./io/manager.js')(mapItems, io);
io.sockets.on('connection', socketManager);

