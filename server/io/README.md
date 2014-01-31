#Custom Socket.io Manager

`manager.js` routes events by order of domain, each event has two strings with the following format: `socket.emit('domain', 'action', args)`.  The manager requires `events.js` and `rooms.js` to be initialized. 

#rooms.js

`var Room` is a class that holds a list of all the rooms on the server, each room represents a unique instance of the game, and it also holds all the sockets. 

`Room.prototype.init` accepts a socket to derive the id from, the room to initialize and for the player to join, and playerData as its arguments. The room initialization is a two step process: `roomProperties` calls `teamMode` to give it a scaffold and then that data is linked to the room which the player has designated. 

`Room.prototype.add` is called when a room already exists and a player wishes to join and assigns the player to a faction, Rebel or Alliance, depending on the state of `teamMode` and `humansOnly`. 


#events.js


