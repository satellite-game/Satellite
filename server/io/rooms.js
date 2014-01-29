
var Room = function( sync_settings ) {
	this.rooms = {};
	this.sockets = {};
	sync = sync_settings;
  // this.allianceCount = 0;
  // this.rebelCount = 0;
};

Room.prototype = Object.create({});

Room.prototype.init = function( socket, room, playerData ) {
  console.log(playerData);
  this.rooms[room] = {};
  this.rooms[room].gamestate = {};
  this.rooms[room].playerList = {};
  // if ( <= ) {
  //   playerData.team = 'alliance';
    this.rooms[room].playerList[playerData.name] = playerData;
  //   this.teamToggle = false;
  // } else {
  //   playerData.team = 'rebel';
  //   this.rooms[room].playerList[playerData.name] = playerData;
  //   this.teamToggle = true;
  // }
  this.sockets[socket.id] = {name: playerData.name, socket: socket.id, ship: playerData.ship, room: room};
};

Room.prototype.add = function( socket, room, playerData) {
  this.sockets[socket.id] = {name: playerData.name, room: room, ship: playerData.ship};
  this.rooms[room].playerList[playerData.name] = playerData;
};


module.exports = Room;
//write a test for init.
//write a test for sync;