
var Room = function(  ) {
	this.rooms = {};
	this.sockets = {};	
};

Room.prototype = Object.create({});

Room.prototype.init = function( socket, room, playerData ) {
  this.rooms[room] = {};
  this.rooms[room].playerList = {};
  this.rooms[room].playerList[playerData.name] = playerData;
  this.sockets[socket] = {name: playerData.name, socket: socket, ship: playerData.ship, room: room};	
}
Room.prototype.add = function( socket, room, playerData) {
  this.sockets[socket] = {name: playerData.name, room: room, ship: playerData.ship};
  this.rooms[room].playerList[playerData.name] = playerData;
}


module.exports = Room;
//write a test for init.
//write a test for sync;  