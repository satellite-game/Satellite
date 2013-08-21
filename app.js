// creating global parameters and start
// listening to 'port', we are creating an express
// server and then we are binding it with socket.io
var express     = require('express');
var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io').listen(server);
var port        = 1337;
var path        = require('path');

// listening to port...
server.listen(port);

// log it all
io.set('log level', 3);

// give the client access to all client files
app.use(express.static(path.join(__dirname, '/build/client')));

// serving the main applicaion file (index.html)
// when a client makes a request to the app root
// http://localhost:1337
app.get('/', function (req, res) {
    res.sendfile(path.join(__dirname, '/build/client/index.html'));
});




/*================================
=            original            =
================================*/

// var app = require('http').createServer(handler);
// var io = require('socket.io').listen(app);
// // Enable logging for Socket.IO
// io.set('log level', 1);
// app.listen(process.env.PORT || 3000);

function handler(req, res) {
    // Dump out a basic server status page
    var data = '<!doctype html><head><script src="http://localhost:35729/livereload.js"></script><title>DuneBuggy Server</title></head><body>';

    data += '<h1>Satellite Server</h1>';

    data += '<table><thead><th>Name</th><th>IP</th><th>Position</th></thead><tbody>';
    for (var player in players) {
        var playerInfo = players[player];
        data += '<tr><td>'+playerInfo.name+'</td><td>'+playerInfo.ip+'</td><td>'+playerInfo.pos+'</td></tr>';
    }

    data += '</tbody></table>';

    data += '</body></html>';

    res.writeHead(200);
    res.end(data);
}

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

io.sockets.on('connection', function (socket) {
    var address = socket.handshake.address;
    console.log("New connection from " + address.address + ":" + address.port);

    // Send welcome message
    socket.emit('welcome', {
        message: 'Welcome to Satellite'
    });

    // Setup message handlers
    socket.on('join', function(message) {
        if (players[message.name] !== undefined && ip === players[message.name].ip) {
            console.warn('Error: '+message.name+' tried to join twice!');
            return;
        }

        if (!message.name) {
            console.error('Error: Cannot join, player name was null!');
            socket.emit('failed');
            return false;
        }

        console.log('Player joined: '+message.name);

        // Send list of players
        socket.emit('player list', players);

        // Send the map to the players
        socket.emit('map', mapItems);

        var pos = getRandomPosition();

        socket.set('name', message.name, function() {
            // Store client info
            players[message.name] = {
                name: message.name,
                pos: pos,
                rot: message.rot,
                aVeloc: message.aVeloc,
                lVeloc: message.lVeloc,
                lastMove: getTime(),
                ip: ip
            };

            var packet = {
                name: message.name,
                pos: pos,
                rot: [0, 0, 0],
                aVeloc: [0, 0, 0],
                lVeloc: [0, 0, 0],
                interp: false // Not really necessary here, we're telling the client itself to move
            };

            socket.emit('move', packet);

            // Notify players of new challenger
            socket.broadcast.emit('join', {
                name: message.name,
                pos: pos,
                rot: message.rot,
                aVeloc: message.aVeloc,
                lVeloc: message.lVeloc
            });
        });
    });

    socket.on('disconnect', function() {
        socket.get('name', function (err, name) {
            console.log(name+' dropped');

            // Remove from client list
            delete players[name];

            // Notify players
            socket.broadcast.emit('leave', {
                name: name
            });
        });
    });

    socket.on('hit', function(message) {
        socket.get('name', function (err, name) {
            socket.broadcast.emit('hit', {
                name: name,
                type: message.type
            });
        });
    });

    socket.on('mapItem hit', function(message) {
        // Get the map item
        var mapItem = mapItems[message.id];

        if (!mapItem) {
            console.warn('Tried to take hit on non-existant map item at index '+message.id);
            return;
        }

        // Subtract the damage
        mapItem.hp -= mesage.damage;

        var newMessage = {
            id: message.id,
            hp: mapItem.hp
        };

        // Destroy if necessary
        if (mapItems.hp < 0) {
            // Remove the map item reference
            mapItems[message.id] = undefined;

            // Broadcast destroyed
            socket.emit('mapItem destroyed', newMessage);
            socket.broadcast('mapItem destroyed', newMessage);
        }
        else {
            // Broadcast hit
            socket.emit('mapItem hit', newMessage);
            socket.broadcast('mapItem hit', newMessage);
        }
    });

    socket.on('killed', function(message) {
        socket.get('name', function (err, name) {
            socket.broadcast.emit('killed', {
                name: name,
                killer: message.killer
            });

            var newPos = getRandomPosition();
            var packet = {
                name: name,
                pos: newPos,
                rot: [0, 0, 0],
                aVeloc: [0, 0, 0],
                lVeloc: [0, 0, 0],
                interp: false
            };

            players[name].pos = newPos;

            // Notify self
            socket.emit('move', packet);

            // Notify players
            socket.broadcast.emit('move', packet);
        });
    });

    socket.on('fire', function(message) {
        socket.get('name', function (err, name) {
            socket.broadcast.emit('fire', {
                name: name,
                pos: message.pos,
                rot: message.rot,
                type: message.type
            });
        });
    });

    socket.on('move', function(message) {
        socket.get('name', function (err, name) {
            if (players[name]) {
                var player = players[name];

                // Update position
                player.pos = message.pos;
                player.rot = message.rot;
                player.aVeloc = message.aVeloc;
                player.lVeloc = message.lVeloc;
                player.lastMove = message.time;

                // Notify players
                socket.broadcast.emit('move', {
                    name: name,
                    pos: message.pos,
                    rot: message.rot,
                    aVeloc: message.aVeloc,
                    lVeloc: message.lVeloc,
                    interp: true
                });
            }
            else {
                socket.emit('failed');
            }
        });
    });
});
