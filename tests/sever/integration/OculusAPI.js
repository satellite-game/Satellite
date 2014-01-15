var should = require('should');
var io = require('socket.io-client');
var fs = require('fs');

var socketURL = 'http://0.0.0.0:9005';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("OVR",function(){
  it('Should broadcast new user to all users', function(done){
    var rift = io.connect(socketURL, options);

    rift.on('connected', function(data){
        data.should.equal(data);
        done();
      // fs.write('./test.log', function () {
      //   client1.close();
      // });

    });
  });
});