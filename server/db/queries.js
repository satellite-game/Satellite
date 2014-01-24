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
        console.log('room exists');
        callback(null, roomName);
      }
    });
  },

  joinRoom: function (roomName, playerName, callback) {
    callback = callback || defaultCallback('joinRoom');

    async.waterfall([function (callback){
      callback(null, roomName);
    },
    this.addRoom,
    function(resultData, callback) {
      db.HSET(roomName+'_KILLS', playerID, 0, function(err, data){
        callback(null, data);
      });
    },
    function(resultData, callback) {
      db.HSET(roomName+'_DEATHS', playerID, 0, function(err, data){
        callback(null, data);
      });
    }], callback);
  },


}