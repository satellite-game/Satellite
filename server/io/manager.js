var Events = require('./events.js');
var Host = require('./rooms.js'),
    host = new Host();


var Manager = function( context, io ) {
  var events = new Events({context: context, host: host, io: io});
  return function( socket ) {

    // flow does not namespace because sockets.io has
    // these functions as reserverd event names.
    socket.on('join', function( args ) {
      events.flow.join(socket, args);
    });
    socket.on('disconnect', function( args ) {
      events.flow.disconnect(socket, args);
    });

    // Player Namespace: 'killed'
    // TODO: scores, everything about a player outside of combat.
    socket.on('player', function( type, args ) {
      events.player[type](socket, args);
    });

    // Player Namespace: 'killed'
    // TODO: scores, everything about a player outside of combat.
    socket.on('bot', function( type, args ) {
      events.bot[type](socket, args); // 'botInfo', 'botHit', 'botUpdate'
    });

    socket.on('combat', function( type, args ) {
      events.combat[type](socket, args);
    });

    socket.on('keypress', function( type, args) {
      events.movement.keySync( socket, args );
    });
  };
};

module.exports = Manager;



