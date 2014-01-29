
var Room = function( sync_settings ) {
	this.rooms = {};
	this.sockets = {};
	sync = sync_settings;
};

Room.prototype = Object.create({});

Room.prototype.init = function( socket, room, playerData ) {
  // make a room with a playerlist and the
  // 'gamestate' of all player positions:
  var roomProperties = {
    gamestate: {},
    playerList: {},
    teamMode: true,
  };

  if (roomProperties.teamMode === true){ // team mode currently DNE
    // make the first player alliance
    playerData.team = 'alliance';
    // extend the rooms so that they
    // account for teams balance
    roomProperties.allianceCount = 1;
    roomProperties.rebelCount = 0;
  }

  roomProperties.playerList[playerData.name] = playerData;

  this.rooms[room] = roomProperties;
  this.sockets[socket.id] = {
    name: playerData.name,
    team: playerData.team,
    socket: socket.id,
    ship: playerData.ship,
    room: room
  };
};

Room.prototype.add = function( socket, room, playerData) {
  var roomData = this.rooms[room];
  if (roomData.teamMode === true){ // team mode currently DNE
    playerData.team = ( roomData.allianceCount < roomData.rebelCount ) ? 'alliance' : 'rebel';
    roomData[playerData.team]++;
  }

  roomData.playerList[playerData.name] = playerData;
  this.sockets[socket.id] = {
    name: playerData.name,
    team: playerData.team,
    socket: socket.id,
    ship: playerData.ship,
    room: roomData
  };
};


module.exports = Room;
//write a test for init.
//write a test for sync;