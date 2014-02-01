#combat.js
If node.js ever runs into an undefined object and tries to run an operation on it the server will crash. Socket is present in most of these functions since Socket.io utilizes these as identifiers as to who to broadcast to.

As a reminder, the format is `io.socket.on('connection', function(socket){
   socket.on('event', function(args));
 })` and the client calls with `socket.emit('event', args)`


`module.exports = function ( host )`  passes host, or an instance of room.js, into the module allowing combat.js to directly tap into the room data.

#`move: function` 

Directly interfaces with the `s.Comm` which calls on `s.SatelliteGame.js` referencing `handlemove`. This function is called by `s.Comm.position`.  This entire chain keeps the game synced up utilizing the physics to ensure a smooth performance. 

So, the order goes: 1. client calls 'Position' when there is a new change in acceleration. 2. Server receives 'Position' as 'move' and updates all other clients by emitting 'move'. 

###`fire: function` 

Always called by the client whenever a client fires a bullet which then tells the other clients in the associated room `socket.broadcast.to(room)` to instantiate bullets in the proper location. 

`hit: function` is called when a client receives a hit and then broadcasts to everyone in the room that he or she has been hit while the server then relays back to the client who was hit that he or she should decrease shields. 

#connections.js & globals.js
`var globals` refers to a function that produces an object meant to be attached to each room, this object stores bot information for when a player joins a room. 

The module requires a host/room.js alias and an io which is provided by the instance of manager.js. 

###`join: function` 

Takes the socket and extracts the `socket.id` and uses it as a key in a hash to store client information in the argument `data`. If a player is joining a room that exists the `join: function` adds the client to the room and assigns that player as the `lastClient`.  

The `lastClient` is the determiner for who receives a list of all the current events which prevents the server from sending duplicate data to existing plyers. 

`socket.emit('playerList')` sends information to everyone in the room that a new player has joined,  `socket.join` informs Socket.io to subscribe to the target room.  And the `for loop` following assigns a player as the primary host for the AI. 

`baseInfo and bot retrieval` are the final step which asks for all the information regarding bots such as position and health so that the client can render them accurately.

###`disconnect: function` 

Utilizing the socket information it taps into the host for a name anda room then uses that to unsubscribe, migrate AI host, then delete. 


###`change: function`

Change function allows the user to change rooms from the current one. It calls upon disconnect to unsubscribe and remove itself from the data associated with the room and then calls join to join a new room. 

###`query: function`

This is simply used for the in game menu by emitting back `socket.emit('roomQuery')` to the current socket a  list of game rooms available. 

#player.js