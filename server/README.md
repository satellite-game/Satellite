#H1 Contents

1. [Multiplayer Module - App.js](../server/README.md)

2. [Socket.io manager - '/io'](../server/io/README.md)

3. [Event Handlers - '/events'](../server/events/README.md)

4. [Database Handlers](../server/db/README.md)

#H1 App.js 

App.js is a fairly standard Express/Node.js server that listens either locally on port 1337 or, for launching purposes, uses whatever port the deployment service utilizes. Please consult the documentation for whatever service you plan on deploying with. 

#H1 Functionality

`var mapItems` holds the location, rotation, and other attributes of other in game objects allowing the server to dictate where the objects are when a player joins, in this case it handles the location of the alien space station and human station. 

If you wish to add something and have it dynamically placed then it would go into mapItems.

`var socketManager` is part of the multiplayer module ([Transmogrify]() - it is totally a thing) which is a function that accepts a context, which is an array of objects, and the socket which has been initialized like `var io = require('socket.io').listen(server)`. This is the main meat of the backend. For further details refer to [Socket.o manager](../server/io/README.md).

`io.sockets.on('connection', socketManager);` is an abstraction from socket.on(connection, function(){}). For further details refer to [Socket.o manager](../server/io/README.md).



