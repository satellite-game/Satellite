s.Enemies = new Class({
  _list: [ ],
  _map: {}, // new WeakMap()

  construct: function (enemyOptions) {
    this.game = enemyOptions.game;
  },

  get: function ( nameOrId ) {
    if ( typeof nameOrId == 'string' ) {
      return this._map[ nameOrId ]; // return enemies._map.get(nameOrId);
    } else if ( typeof nameOrId == 'number' ) {
      return this._list( nameOrId );
    }
  },

  has: function ( nameOrId ) {
    return !!this.get( nameOrId );
  },

  execute: function ( nameOrId, operation, args ) {
    var enemy = this.get( nameOrId );
    if ( enemy ) {
      enemy[ operation ].apply( enemy, args );
      return true;
    }
    return false;
  },

  forEach: function ( callback ) {
    this._list.forEach( callback );
  },

  list: function ( ) {
    return this._list;
  },

  delete: function ( nameOrId ) {
    var enemy = this.get( nameOrId );
    if ( enemy ) {
      // Remove from map
      delete this._map[ enemy.name ]; // this._map.delete(enemy.name);

      // Remove from array
      var enemyIndex = this._list.indexOf( enemy );
      if ( ~enemyIndex )
          this._list.splice( enemyIndex, 1 );

      // destroy
      enemy.destruct( );

      return true;
    }
    return false;
  },

  add: function ( enemyInfo ) {
    var that = this;

    console.log("LOL ENEMIES");
    if ( this.has( enemyInfo.name ) ) {
      this.delete( enemyInfo.name );
      console.error( 'Bug: Player %s added twice', enemyInfo.name );
    } else {
      if ( enemyInfo.name === null ) {
        console.error( 'Bug: enemyInfo contained null player name' );
        console.log( enemyInfo );
        console.trace( );
      }
      console.log( '%s has joined the fray', enemyInfo.name );
    }

    // TODO: include velocities?
    var enemyShip = new s.Player( {
      game: that.game,
      shipClass: 'human_ship_heavy',
      name: enemyInfo.name,
      position: new THREE.Vector3( enemyInfo.pos[ 0 ], enemyInfo.pos[ 1 ], enemyInfo.pos[ 2 ] ),
      rotation: new THREE.Vector3( enemyInfo.rot[ 0 ], enemyInfo.rot[ 1 ], enemyInfo.rot[ 2 ] ),
      alliance: 'enemy'
    } );

    this._list.push( enemyShip );
    this._map[ enemyInfo.name ] = enemyShip; // this._map.set(enemyInfo.name, otherShip);
  }
});