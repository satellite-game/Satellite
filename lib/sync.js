var Sync = function( time, tolerance, syncCycle ) { 
  this.cycle = time || 1000;
  this.tol = tolerance || 100;
  this.sync_cycle = 2000 || syncCycle; 
};


Sync.prototype = Object.create({});

Sync.prototype.setInit = function( socket, list, packet, shortcut ) {
  //this.instanceTime = new Date().getTime();
     list.playerList[packet.name], list.gamestate[packet.name] =
	  { 
	   	name: packet.name,
	   	time: packet.time,
	   	lVeloc: packet.lVeloc,
	  	pos: packet.pos,
	  	lAccel: [0,0,0]
	  }
};

Sync.prototype.setMove = function( packet, target ) { 

	var current = packet.time;
	var temp;  
	var calctime = (current - target.time);

  if(calctime === 0) {
  	calctime = 1;
  }

  return this.check(target, packet, calctime);
}


Sync.prototype.sync = function( ) {
  if(this.name === undefined) {
    return;
  }
  var that = this; 
  setTimeout(function() {
    io.sockets.in(that.name).emit('sync', that.gamestate);
  	that.sync();
  }, that.sync_cycle)

}

Sync.prototype.create = function(event, func) {
  Sync.prototype[event] = func; 
}

Sync.prototype.check = function( target, packet, calctime ) {
  for(var x = 0; x < 3; x++) {
  	var v_dist = (target.lVeloc[x] * calctime);
    if(v_dist === 0) {
      v_dist = 1; 
    };
  	var diff_dist = Math.abs(target.pos[x] - packet.pos[x]);
    console.log("Difference", diff_dist, " and time ", calctime , " and V_dist " , v_dist);
    var result = diff_dist / v_dist;
    console.log("result")
  	if(result >= this.tol) {
  		return false; 
  	}
  }
	return true;
};
// Sync will need to move the player back by adjusting velocity 
// Hit detection should 
module.exports = Sync; 