var vents = require('./events.js');
var Host = require('./rooms.js'),
    host = new Host();



var Manager = function( context, ioz, argsz ) {
   return function( socket ) {
     var events = new vents({context: context, socket: socket, io: ioz, args: argsz, host: host});
     
   	   socket.on('join', function( args ) {
          events['join'].call(events, args);
       });
      
      socket.on('disconnect', function( args ) {
          events['disconnect'].call(events, args);
       });
    }
};

module.exports = Manager; 



