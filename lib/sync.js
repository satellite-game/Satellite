var Sync = function( name, time, tolerance, syncCycle ) {
  this.name = name || 'ziggy';  
  this.gamestate = {};
  this.cycle = time || 1000;
  this.instanceTime = new Date().getTime();
  this.tol = tolerance || 3;
  this.sync_cycle = 2000 || syncCycle; 
};


Sync.prototype = Object.create({});

Sync.prototype.setInit = function( packet ) {
  this.gamestate[packet.name] =
	  { 
	   	name: packet.name,
	   	time: packet.time,
	   	lVeloc: packet.lVeloc,
	  	pos: packet.pos,
	  	lAccel: [0,0,0]
	  }
};

Sync.prototype.setMove = function( packet ) { 
	var target = this.gamestate[packet.name];
	var current = packet.time;
	var temp;  
	var calctime = (current - target.time)/1000;

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
  	temp = (target.lVeloc[x] * (this.cycle / 1000) * calctime);
  	temp = Math.abs(target.pos[x] - packet.pos[x])/(temp);
  	if(temp >= this.tol) {
  		return false; 
  	}
  }

	for(var i in packet[i]) { 
   	 target[i] = packet[i];
  }
	return true;
};
// Sync will need to move the player back by adjusting velocity 
// Hit detection should 
module.exports = Sync; 