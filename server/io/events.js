
var connectionFlow = require('../events/connections');
var combat         = require('../events/combat');
var player         = require('../events/player');
var globals        = require('../events/globals');

var Events = function( init ) {

  var host = init.host,
    io = init.io,
    context = init.context;

  this.flow     = connectionFlow(context, host, io);
  this.player   = player(host, io);
  this.combat   = combat(host);
  this.bot      = player(host, io);
};

module.exports = Events;
