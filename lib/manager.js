var vents = require('./events.js');
var host = require('./rooms.js');
    host = new host();
var io, args;


var Manager = function( context, io, args ) {
   args = args;
   io = io; 
   host = host;
   return function( socket ) {
     Events = vents({context: context, socket: socket, host: host, io: io, args: args});
   	 for(var event in Events) {
   	   socket.on(event, Events[event]);
   	 }
   }
};

module.exports = Manager; 
