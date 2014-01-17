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
app.use(express.static(path.join(__dirname, '/build/client')));

// serving the main applicaion file (index.html)
// when a client makes a request to the app root
// http://localhost:1337
app.get('/', function (req, res) {
    res.sendfile(path.join(__dirname, '/build/client/index.html'));
});

// Holds players
var players = {};
var clients = [];

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
    var ip = socket.handshake.address.address;
    console.log("New connection from " + address.address + ":" + process.env.PORT);

    clients.push(socket.id);

    // Setup message handlers
    socket.on('join', function(message) {
        console.dir(message);
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
                pos: message.pos,
                rot: message.rot,
                aVeloc: message.aVeloc,
                lVeloc: message.lVeloc,
                lastMove: getTime(),
                ip: ip
            };


            var packet = {
                name: message.name,
                pos: message.pos,
                rot: [0, 0, 0],
                aVeloc: [0, 0, 0],
                lVeloc: [0, 0, 0],
                interp: false // Not really necessary here, we're telling the client itself to move
            };

            socket.emit('move', packet);

            // Notify players of new challenger
            socket.broadcast.emit('join', {
                name: message.name,
                pos: message.pos,
                rot: message.rot,
                aVeloc: message.aVeloc,
                lVeloc: message.lVeloc
            });

            io.sockets.socket(clients[0]).emit("bot retrieval");
        });
    });

    socket.on('disconnect', function() {
        socket.get('name', function (err, name) {
            console.log(name+' dropped');

            console.log('socket.id: ',socket.id);
            // console.log('clients: ', clients);
            var idx = clients.indexOf(socket.id);
            console.log('index: ', idx);
            clients.splice(idx, 1);
            console.log(clients);

            // Remove from client list
            delete players[name];

            // Notify players
            socket.broadcast.emit('leave', {
                name: name
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

    socket.on('hit', function(message) {
            socket.broadcast.emit('hit', {
                otherPlayerName: message.otherPlayerName,
                yourName: message.yourName
            });
            socket.emit('hit', {
                otherPlayerName: message.otherPlayerName,
                yourName: message.yourName
            });
    });

    socket.on('killed', function(message) {
            socket.broadcast.emit('killed', {
                killed: message.you,
                killer: message.killer
        });
    });

    socket.on('fire', function(message) {
        socket.get('name', function (err, name) {
            socket.broadcast.emit('fire', {
                name: message.name,
                position: message.position,
                rotation: message.rotation,
                initialVelocity: message.initialVelocity
            });
        });
    });

    socket.on('botInfo', function(message) {
        var lastClient = clients[clients.length - 1];
        io.sockets.socket(lastClient).emit('bot positions', message);
    });

});



