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
  },

  updateEnemies: function () {
    /////////////////////////////////
    // PREDICTIVE MOVEMENT SYSTEM //
    /////////////////////////////////

    // PARAMETERS
    // aV   = vector from target to self
    // a    = distance between self and target
    // eV   = enemy's current velocity vector
    // e    = magnitude of eV
    // pV   = players's velocity vector
    // b    = magnitude of bV plus initial bullet speed
    // angD = angular differential
    // velD = velocity differential
    // t    = quadratic solution for time at which player bullet and enemy ship will simultaneously reach a given location
    if ( enemies[i] && targetInSight ){

      var aV = enemies[i].root.position.clone().add( self.position.clone().multiplyScalar(-1) );
      var a  = aV.length();
      var eV = this.target.getLinearVelocity();
      var e  = eV.length();
      var pV = self.getLinearVelocity();
      var b = 5000+pV.length();

      if (eV && b && aV){
        var angD = aV.dot(eV);
        var velD = (b*b - e*e);

        var t = angD/velD + Math.sqrt( angD*angD + velD*a*a )/velD;

        // Don't show the marker if the enemy is more than 4 seconds away
        if (t < 4){

          this.trailingPredictions.push(eV.multiplyScalar(t));
          var pLen = this.trailingPredictions.length;

          // If the previous frames had a prediction, tween the midpoint of all predictions and plot that
          if (pLen > 3){
            var pX = 0, pY = 0;
            for (var p = 0; p < pLen; p++){

              // Project 3D coords onto 2D plane in perspective of the camera;
              // Scale predictions with current camera perspective
              var current = s.projector.projectVector(
                  this.target.position.clone().add( this.trailingPredictions[p] ), s.game.camera );
              pX += (width + current.x*width)/2;
              pY += -(-height + current.y*height)/2;

            }
            var enemyV2D = new THREE.Vector2(pX/pLen, pY/pLen);

            if (enemyV2D.distanceTo(v2D) > size/3) {
              // Draw the prediction marker
              this.ctx.beginPath();
              this.ctx.arc(enemyV2D.x, enemyV2D.y, size/5, 0, 2*this.PI, false);
              this.ctx.fillStyle = "rgba(256,0,0,0.5)";
              this.ctx.fill();
              this.ctx.lineWidth = 2;
              this.ctx.strokeStyle = this.menu.color;
              this.ctx.stroke();
            }

            // remove the earliest trailing prediction
            this.trailingPredictions.shift();

          }
        }
      }
    // If the target is no longer on screen, but lastV2D is still assigned, set to null
    } else if ( this.trailingPredictions.length ) {
        this.trailingPredictions = [];
    }
  },

});