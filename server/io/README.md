#Custom Socket.io Manager

`manager.js` routes events by order of domain, each event has two strings with the following format: `socket.emit('domain', 'action', args)`.  The manager requires `events.js` and `rooms.js` to be initialized. 

#rooms.js

`var Room` is a class that holds a list of all the rooms on the server, each room represents a unique instance of the game, and it also holds all the sockets. As a note most functions will be using the `socket.id` and find the value at `sockets` in order to obtain the room the current client is in then use `room[name]` to 

`Room.prototype.init` accepts a socket to derive the id from, the room to initialize and for the player to join, and playerData as its arguments. The room initialization is a two step process: `roomProperties` calls `teamMode` to give it a scaffold and then that data is linked to the room which the player has designated. 

`Room.prototype.add` is called when a room already exists and a player wishes to join and assigns the player to a faction, Rebel or Alliance, depending on the state of `teamMode` and `humansOnly`. 

`Room.prototype.teamMode` is a function that scaffolds a room for initialization purposes. It sets the state of the room to either being team and/or humans only. 


#events.js

`var Events` contains all the custom events for the server. If you wish to add your own custom events first delcare it up top before `var Events` is declared and in `var Events` put `this.yourEventHere = yourevent(host, io)`.

The event system requires a host and an io, the io is provided by socket.io and the host is an alias for rooms.js which is declared and used in `manager.js`. 

#Order of Events

`manager -> initializes room.js and eventss.js -> routes requests to eventss' 

[Return to Server Directory](../server)
[Return to Master Directory](../README.md)