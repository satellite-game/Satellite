#Server Documentation


App.js is a standard Express-Node.js with Socket.io integration with the exception of `process.env.PORT` which is needed for deployment, please refer to whatever service this App.js is planning to be deployed on for port information.

`io.set('log level', 2)` sets Socket.io to report to the Node.js console all information regarding connecting and disconnecting. To set it to debug, change the second argument to 3. [Socket.io logging](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO)

`app.get('/rooms'...)` The pair of functions deals with Redis, please refer to [Redis implementation](server/db)

`var socketManager and io.sockets.on` is an abstraction of `socket.on('connection', function{ socket.on(event, function(socket) {...} ) })`, please refer to [io manager documentation](/server/io) and [server events](/server/events).

[Return to Master Directory](../README.md)