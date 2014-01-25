var db = require('./connection');
var async = require('async');

var defaultCallback = function (functionName) {
  return function (err, data){
    if (err) throw err;
    console.log(functionName, 'successfull! ', data);
  };
}

module.exports = {

  addRoom: function (roomName, callback) {
    callback = callback || defaultCallback('addRoom');

    db.get('rooms', function(data){
      console.log(arguments);
      if (roomName !== undefined && roomName !== null && data[roomName]){
        console.log('room DNE');
        db.HSET('rooms', roomName, 1, callback);
      } else {
      // need to find the value (number of people in the room) for the hash and increase it here:
        console.log('room exists');
        callback(null, roomName);
      }
    });
  },

  joinRoom: function (roomName, playerName, joinCallback) {
    joinCallback = joinCallback || defaultCallback('joinRoom');

    async.waterfall([function (callback){
      this.addRoom(null, roomName, callback);
    },
    function(resultData, callback) {
      db.HSET(roomName+'_KILLS', playerID, 0, function(err, data){
        callback(null, data);
      });
    },
    function(resultData, callback) {
      db.HSET(roomName+'_DEATHS', playerID, 0, function(err, data){
        callback(null, data);
      });
    }], joinCallback);
  },

  leaveRoom: function (roomName, playerName, leaveCallback) {
    leaveCallback = leaveCallback || defaultCallback('leaveRoom');

    async.waterfall([function (callback){
      db.HDEL(roomName+'_KILLS', playerID, function(err, data){
        callback(null, data);
      });
    },
    function(resultData, callback) {
      db.HDEL(roomName+'_DEATHS', playerID, function(err, data){
        callback(null, data);
      });
    },
    function(resultData, callback) {
      db.HINCRBY('rooms', roomName, -1, function(err, playersInRoom){
        callback(null, playersInRoom);
      });
    },
    // need to remove the old rooms from the _KILLS and _DEATHS sections
    function(playersInRoom, callback) {
      if (playersInRoom < 1){
        db.HDEL('rooms', roomName, function(err, data){
          callback(null, data);
        });
      } else {
        callback(null, playersInRoom);
      }
    }], leaveCallback);
  },

  incKillCount: function (roomName, playerID) {
    db.HINCRBY(roomName+'_KILLS',playerID, 1, defaultCallback('incKillCount'));
  },

  incDeathCount: function (roomName, playerID) {
    db.HINCRBY(roomName+'_DEATHS',playerID, 1, defaultCallback('incKillCount'));
  },

}