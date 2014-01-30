var Events = require('./events.js');
var Host = require('./rooms.js'),
    host = new Host();

var Manager = function( context, io ) {
  var events = new Events({context: context, host: host, io: io});
  return function( socket ) {

    socket.on('join', function( args ) {
      events.flow.join(socket, args);
    });
    
    socket.on('disconnect', function( args ) {
      events.flow.disconnect(socket, args);
    });

    socket.on('flow', function( type, args ) {
      events.flow[type](socket, args);
    });

    socket.on('player', function( type, args ) {
      events.player[type](socket, args);
    });

    socket.on('bot', function( type, args ) {
      events.bot[type](socket, args); 
    });

    socket.on('combat', function( type, args ) {
      events.combat[type](socket, args);
    });
  };
};

module.exports = Manager;



