var Events = require('./events.js');
var Host = require('./rooms.js'),
    host = new Host();


var Manager = function( context, io ) {
  var events = new Events({context: context, host: host, io: io});
  return function( socket ) {

    socket.on('join', function( args ) {
      console.log('join');
      events.flow['join'](socket, args);
    });

    socket.on('player', function( type, args ) {
      console.log('player');
      events.player[type](socket, args);
    });

    socket.on('bot', function( type, args ) {
      console.log('bot');
      events.bot[type](socket, args);
    });

    socket.on('combat', function( type, args ) {
      console.log('combat');
      events.combat[type](socket, args);
    });

    socket.on('disconnect', function( args ) {
      console.log('disconnect');
      events.flow['disconnect'](socket, args);
    });

    socket.on('keypress', function( type, args) {
      console.log('keypress');
      events.movement.keySync( socket, args );
    });
  };
};

module.exports = Manager;



