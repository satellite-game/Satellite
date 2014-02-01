As a note all these modules requires a host/room.js alias and an io which is provided by the instance of manager.js. 


#combat.js
If node.js ever runs into an undefined object and tries to run an operation on it the server will crash. Socket is present in most of these functions since Socket.io utilizes these as identifiers as to who to broadcast to.

As a reminder, the format is `io.socket.on('connection', function(socket){
   socket.on('event', function(args));
 })` and the client calls with `socket.emit('event', args)`


`module.exports = function ( host )`  passes host, or an instance of room.js, into the module allowing combat.js to directly tap into the room data.

###`move:` 

Directly interfaces with the `s.Comm` which calls on `s.SatelliteGame.js` referencing `handlemove`. This function is called by `s.Comm.position`.  This entire chain keeps the game synced up utilizing the physics to ensure a smooth performance. 

So, the order goes: 1. client calls 'Position' when there is a new change in acceleration. 2. Server receives 'Position' as 'move' and updates all other clients by emitting 'move'. 

###`fire:` 

Always called by the client whenever a client fires a bullet which then tells the other clients in the associated room `socket.broadcast.to(room)` to instantiate bullets in the proper location. 

`hit: function` is called when a client receives a hit and then broadcasts to everyone in the room that he or she has been hit while the server then relays back to the client who was hit that he or she should decrease shields. 

#connections.js & globals.js
`var globals` refers to a function that produces an object meant to be attached to each room, this object stores bot information for when a player joins a room. 

###`join:` 

Takes the socket and extracts the `socket.id` and uses it as a key in a hash to store client information in the argument `data`. If a player is joining a room that exists the `join: function` adds the client to the room and assigns that player as the `lastClient`.  

The `lastClient` is the determiner for who receives a list of all the current events which prevents the server from sending duplicate data to existing plyers. 

`socket.emit('playerList')` sends information to everyone in the room that a new player has joined,  `socket.join` informs Socket.io to subscribe to the target room.  And the `for loop` following assigns a player as the primary host for the AI. 

`baseInfo and bot retrieval` are the final step which asks for all the information regarding bots such as position and health so that the client can render them accurately.

###`disconnect:` 

Utilizing the socket information it taps into the host for a name anda room then uses that to unsubscribe, migrate AI host, then delete. 


###`change:`

Change function allows the user to change rooms from the current one. It calls upon disconnect to unsubscribe and remove itself from the data associated with the room and then calls join to join a new room. 

###`query:`

This is simply used for the in game menu by emitting back `socket.emit('roomQuery')` to the current socket a  list of game rooms available. 

#player.js
Requires the database modules, refer to [Redis implementation](https://github.com/satellite-game/Satellite/tree/dev/server/db).

###'killed'
Handles the event in which a player is reduced to zero health. `db.incKillCount and db.incDeathCount` are database handlers, refer to [Redis implementation](https://github.com/satellite-game/Satellite/tree/dev/server/db) for more information. 

Once a player has been killed the server migrates the AI host to a new player and notifies the player that has been killed that he or she has been destroyed -- yes, the game does not actually kill you when you reach zero health, it only acknowledges that you have been destroyed when the event 'killed' has been emitted back. 

###'botInfo'
Uses the `socket` and extracts its id to find the key-value pair of the room the player is in and the bot info in regards to that room when a player joins. It should never be called at any other time. It may need refactoring. 

###'botHit'
When a bot hits a client, the client emits `botHit` and then the server broadcasts to the room and to the current player that the client has been hit to properly decrease shielding. `socket.broadcast.to` is part of the infrastructure that would allow other clients to see another player's health as it decreases, however in the current implementation it isn't necessary and therefore could be commented out. 

###'botUpdate'
The event is called by the AI host and is captured in this event. The function updates the positions of the bots in sync with the AI host. This should be moved to the server at some point. 

###'baseFire'
When a bot hits a base the AI host emits an event that the server captures and then broadcasts to all the clients to properly lower the base health. 

###'baseInfo'
Uses a similar format to the other functions by grabbing the `socket` .id property to find the correct room the player is in. `baseInfo` is critical for team games; when a player joins they receive information by means of `packet` and `baseShields` which tells the client to set the current health of the base. However, for free-for-all, this is largely useless and should be culled out somehow. 