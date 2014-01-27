var Sync = require('./sync.js');

// custom socket.io events
var connectionFlow = require('../events/connections');
var movement       = require('../events/movement');
var combat         = require('../events/combat');
var player         = require('../events/player');
var globals        = require('../events/bots');

var Events = function( init ) {
  var sync = new Sync();

  var host = init.host,
    io = init.io,
    context = init.context;

  this.flow     = connectionFlow(context, host, sync, io);
  this.player   = player(host, sync, io);
  this.combat   = combat(host, sync);
  this.movement = movement(host, sync);
  this.bots     = player(host, sync, io);
};

module.exports = Events;
