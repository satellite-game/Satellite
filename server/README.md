<<<<<<< HEAD
#Contents

1. [Multiplayer Module - App.js](../server/README.md)

2. [Socket.io manager - '/io'](../server/io/README.md)

3. [Event Handlers - '/events'](../server/events/README.md)

4. [Database Handlers](../server/db/README.md)

#App.js 

App.js is a fairly standard Express/Node.js server that listens either locally on port 1337 or, for launching purposes, uses whatever port the deployment service utilizes. Please consult the documentation for whatever service you plan on deploying with. 

#Functionality

`var mapItems` holds the location, rotation, and other attributes of other in game objects allowing the server to dictate where the objects are when a player joins, in this case it handles the location of the alien space station and human station. 

If you wish to add something and have it dynamically placed then it would go into mapItems.

`var socketManager` is part of the multiplayer module ([Transmogrify]() - it is totally a thing) which is a function that accepts a context, which is an array of objects, and the socket which has been initialized like `var io = require('socket.io').listen(server)`. This is the main meat of the backend. For further details refer to [Socket.o manager](../server/io/README.md).

`io.sockets.on('connection', socketManager);` is an abstraction from socket.on(connection, function(){}). For further details refer to [Socket.o manager](../server/io/README.md).



=======
#Server Documentation


App.js is a standard Express-Node.js with Socket.io integration with the exception of `process.env.PORT` which is needed for deployment, please refer to whatever service this App.js is planning to be deployed on for port information.

`io.set('log level', 2)` sets Socket.io to report to the Node.js console all information regarding connecting and disconnecting. To set it to debug, change the second argument to 3. [Socket.io logging](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO)

`app.get('/rooms'...)` The pair of functions deals with Redis, please refer to [Redis implementation](server/db)

`var socketManager and io.sockets.on` is an abstraction of `socket.on('connection', function{ socket.on(event, function(socket) {...} ) })`, please refer to [io manager documentation](/server/io) and [server events](/server/events).

[Return to Master Directory](../README.md)
>>>>>>> 2e91533b783d58651c0ed3b759b2d651f70e550e
