module.exports = function (host, Sync) {
  var timeId;
  var keys = {
    left  : function() {
      yaw = yawSpeed / thrustScalar;
    },
    up    : function() {
      pitch = -1*pitchSpeed / thrustScalar;
    },
    right : function() {
      yaw = -1*yawSpeed / thrustScalar;
    },
    down  : function() {
      pitch = pitchSpeed / thrustScalar;
    },
    w     : function() {
      thrust = 1;
    },
    a     : function() {
      roll = this.options.rotationSpeed;
    },
    s     : function() {
      brakes = 1;
    },
    d     : function() {
      roll = -1*this.options.rotationSpeed;
    },
  };

  var continueMovement = function(socket, packet) {
    var intervalId = setInterval(function(socket, packet) {
      var player_state = host.rooms[host.sockets[socket.id].room]
                         .gamestate[host.sockets[socket.id].name];

      if(Sync.setMove(packet, player_state)) {
        for(var i in packet) {
          player_state[i] = packet[i];
        };
        socket.emit('keySync', player_state);
        // socket.broadcast.to(host.sockets[socket.id].room).emit('move', player_state);
      }
    },1000);
    return intervalId;
  };


  return {
    keyup: function (socket, packet) {
      var playerState = host.rooms[host.sockets[socket.id].room]
                        .gamestate[host.sockets[socket.id].name];

      var isLegalMove = Sync.setMove(packet, playerState);

      if(isLegalMove) {
        for(var i in packet) {
          playerState[i] = packet[i];
        };
        timeId = continueMovement();
        socket.emit('keySync', playerState);
      }
    },
    keydown: function (socket, packet) {
      clearInterval(timeId);
      var playerState = host.rooms[host.sockets[socket.id].room]
                        .gamestate[host.sockets[socket.id].name];
      var isLegalMove = Sync.setMove(packet, playerState);

      if(isLegalMove) {
        for(var i in packet) {
          playerState[i] = packet[i];
        };
        socket.emit('keySync', playerState);
      }
    },
  }
};