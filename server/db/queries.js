var db = require('./connection');
var async = require('async');

var defaultCallback = function (functionName) {
  return function (err, data){
    if (err) throw functionName + ' : ' + err;
    console.log(functionName, 'successfull! ', data);
  };
};

module.exports = {

  addRoom: function (roomName, callback) {
    callback = callback || defaultCallback('addRoom');
    db.hgetall('rooms', function(err, data){
      if (err) throw 'addRoom error: ' + err;
      if (!data || !data[roomName]){
        console.log('room DNE');
        db.HSET('rooms', roomName, 1, function(err, data){
          callback(err, data);
        });
      } else {
        console.log('room exists');
        db.HINCRBY('rooms', roomName, 1, function(err, data){
          callback(err, data);
        });
      }
    });
  },

  deleteRooms: function (roomName, callback){
    callback = callback || defaultCallback('deleteRooms');
    async.waterfall([function (callback) {
      db.HDEL('rooms', roomName, function(err, data){
        callback(null, data);
      });
    }, function (data, callback) {
      db.DEL(roomName+'_KILLS', function(err, data){
        callback(null, data);
      });
    }, function (data, callback) {
      db.DEL(roomName+'_DEATHS', function(err, data){
        callback(null, data);
      });
    }], callback);
  },

  joinRoom: function (roomName, playerID, joinCallback) {
    var that = this;
    joinCallback = joinCallback || defaultCallback('joinRoom');

    async.waterfall([function (callback){
      that.addRoom(roomName, callback);
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

  leaveRoom: function (roomName, playerID, leaveCallback) {
    leaveCallback = leaveCallback || defaultCallback('leaveRoom');
    var that = this;

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
    // need to remove the room's _KILLS and _DEATHS hashes
    function(playersInRoom, callback) {
      if (playersInRoom < 1){
        that.deleteRooms(roomName);
      } else {
        callback(null, playersInRoom);
      }
    }], leaveCallback);
  },

  getRooms: function (callback){
    db.HGETALL('rooms', callback);
  },

  getRoomInfo: function (roomName, roomCallback) {
    async.waterfall([function (callback){
      db.HGETALL(roomName+'_KILLS', callback);
    },
    function(killsData, callback) {
      db.HGETALL(roomName+'_DEATHS', function(err, deathsData){
        callback(err, { kills: killsData, deaths: deathsData });
      });
    }], roomCallback);
  },

  incKillCount: function (roomName, playerID) {
    db.HINCRBY(roomName+'_KILLS', playerID, 1, defaultCallback('incKillCount'));
  },

  incDeathCount: function (roomName, playerID) {
    db.HINCRBY(roomName+'_DEATHS', playerID, 1, defaultCallback('incKillCount'));
  },

};
