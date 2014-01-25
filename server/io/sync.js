var Sync = function( time, tolerance, syncCycle ) {
  this.cycle = time || 1000;
  this.tol = tolerance || 100;
  this.sync_cycle = 100 || syncCycle;
};


Sync.prototype = Object.create({});

Sync.prototype.setInit = function( socket, list, packet, shortcut ) {
  //this.instanceTime = new Date().getTime();
  list.gamestate[packet.name] = {
    name: packet.name,
    time: packet.time,
    lVeloc: packet.lVeloc,
    pos: packet.pos,
    lAccel: [0,0,0]
  };

  var sync = function( io, room ) {
    var thatio = io;
    var thatRoom = room;
    var that = this;
    var thatDelay = that.cycle; 

    setTimeout(function() {
      //adjust(that.gamestate, that.cycle); This needs tweaking.
      thatio.sockets.in(thatRoom).emit('sync', that.gamestate);
      that.sync( thatio, thatRoom);
    }, thatDelay);
  }; 

  var adjust = function( gamestate, cycle ) {
    for(var i in gamestate) {
      for(var x = 0; x < 3; x++) {
        gamestate[i].pos[x] += gamestate[i].lVeloc[x] * (cycle/1000);
      };
    };
  };
  list.cycle = this.sync_cycle;
  list.sync = sync;
};

Sync.prototype.setMove = function( packet, target ) {

  var current = packet.time;
  var temp;
  var calctime = (current - target.time);

  if(calctime === 0) {
    calctime = 1;
  }

  return this.check(target, packet, calctime);
};




Sync.prototype.create = function(event, func) {
  Sync.prototype[event] = func;
};

Sync.prototype.check = function( target, packet, calctime ) {
  for(var x = 0; x < 3; x++) {
    var v_dist = Math.abs(target.lVeloc[x] * (calctime/this.cycle));
    if(v_dist <= 0) {
      v_dist = 1;
    }
    var diff_dist = Math.abs(target.pos[x] - packet.pos[x]);
    var result = Math.abs(diff_dist - v_dist);
    if(result >= this.tol) {
      return false; // needs to return the difference
    }              // so it may be added properly
    // packet.pos[x] += diff_dist;
  }
  return true;
};
// Sync will need to move the player back by adjusting velocity
// Hit detection should
module.exports = Sync;