
var Room = function() {
	this.rooms = {};
	this.sockets = {};
};

Room.prototype = Object.create({});

Room.prototype.init = function( socket, room, playerData ) {
  // make a room with a playerlist and the
  var roomProperties = this.teamMode(playerData);

  roomProperties.playerList[playerData.name] = playerData;

  this.rooms[room] = roomProperties;
  this.sockets[socket.id] = {
    name: playerData.name,
    alliance: playerData.alliance,
    socket: socket.id,
    ship: playerData.ship,
    room: room
  };
};

Room.prototype.add = function( socket, room, playerData) {
  var roomData = this.rooms[room];
  if (roomData.teamMode && roomData.humansOnly){ // team mode currently DNE
    playerData.alliance = ( roomData.allianceCount < roomData.rebelCount ) ? 'alliance' : 'rebel';
    roomData[playerData.alliance + 'Count']++;
  } else if (roomData.teamMode) {
    playerData.alliance = 'alliance';
    roomData.allianceCount++;
  }

  roomData.playerList[playerData.name] = playerData;
  this.sockets[socket.id] = {
    name: playerData.name,
    alliance: playerData.alliance,
    socket: socket.id,
    ship: playerData.ship,
    room: room
  };
};

Room.prototype.teamMode = function( playerData ) {
  var results = {};
  results.teamMode = playerData.teamMode;
  results.humansOnly = playerData.humansOnly;
  
  if (roomProperties.teamMode){
    playerData.alliance = 'alliance';
    roomProperties.allianceCount = 1;
    roomProperties.rebelCount = 0;
  }
  return results;
};


module.exports = Room;
