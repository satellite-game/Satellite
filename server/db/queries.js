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


}