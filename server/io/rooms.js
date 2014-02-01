
var Room = function() {
	this.rooms = {};
	this.sockets = {};
};

Room.prototype = Object.create({});

Room.prototype.init = function( socket, room, playerData ) {
  var roomProperties = {
    playerList: {},
    teamMode: playerData.teamMode,
    humansOnly: playerData.humansOnly,
  };

  if (roomProperties.teamMode){
    // make the first player alliance
    playerData.alliance = 'alliance';
    // extend the rooms so that they
    // account for teams balance
    roomProperties.allianceCount = 1;
    roomProperties.rebelCount = 0;
  }

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
  playerData.humansOnly = roomData.humansOnly;
  playerData.teamMode = roomData.teamMode;
  roomData.playerList[playerData.name] = playerData;
  this.sockets[socket.id] = {
    name: playerData.name,
    alliance: playerData.alliance,
    socket: socket.id,
    ship: playerData.ship,
    room: room
  };
};


module.exports = Room;
