s.Menu = new Class({

  toString: 'Menu',

  construct: function ( options ) {
    this.displayed = false;
    this.game = options.game;
    this.camera = options.game.camera;
    this.HUD = options.game.HUD;
    this.oculus = options.game.oculus;

    this.menuItems = [];
    this.menuScreen = 'none';
    this.cursorPosition = 0;
    this.hoveredItem = null;

    // todo: use raycasting for better menu selection
    // this.selectorRay = new THREE.Raycaster(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,1), 0, 300);
    // this.selectorHelper = new THREE.ArrowHelper(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-0.3), 50, 0xFF00FF);

    // PlaneGeometry would be better than a cube for this but harder to write because 
    // it would need to be rotated and all it's child objects would need to be rotated back.
    // Optimize at your own risk.
    this.menuBox = new THREE.Mesh( new THREE.CubeGeometry(2500, 2500, 1), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.7}) );

    // Format for adding menu item object:
    // {
    //   text:   'displayed text string'(required, '%b' for linebreak object),
    //   action: 'callbackNameString' (called in context of 'this')(default null),
    //   font:   'font name string'(default "helvetiker"),
    //   bold:   true/false (default false),
    //   size:   number(1-5ish)(defualt 3),
    //   flat:   true/false(changes shader, depth and bevel)(default false),
    //   small:  true/false(overides flat, bold, and size to make a standardized readable small font)(default false)
    // };
    
    this.menuBox.position.setZ(-150);
    this.menuBox.visible = false;

    this.camera.add( this.menuBox );
    this.camera.add( this.selectorRay );
    // this.camera.add( this.selectorHelper );

    if (this.oculus.detected) {
      this.menuBox.position.setZ(-50);
    }

    this.roomNamePrefix = ['Space', 'Wolf', 'Jupiter', 'Planet', 'Purple', 'Nova', 'M', 'Rad', 'Moon', 'Vector', 'Orion', 'Terra', 'Danger', 'Solar', 'Starlight', 'Spice', 'Lumpy'];
    this.roomNameSuffix = ['Base', '359', 'Station', 'X', 'Dimension', 'Zone', 'Alpha', '83', 'Sector', 'Prime', 'Dome', 'Prospect', 'Expanse', 'Imperium', 'Outpost'];
  },

  addMenuItems: function ( items ) {
    // procedurally center aligns text, vertically center aligns menu
    var menuHeight = 0;
    var currentHeight = 0;
    this.menuItems = [];
    for (var j = 0; j < items.length; j++) {
      if (items[j].small) {
        menuHeight += 4;
      } else {
        var itemSize = items[j].size || 3;
        menuHeight += itemSize*2;
      }
    }
    for (var i = 0; i < items.length; i++) {

      if (!items[items.length-i-1].text) continue;
      // this is currently the only font. Supports normal and bold.
      // google typeface.js for how to add more.
      var bevelEnabled,
          bevel,
          mat,
          bold,
          size,
          font = items[items.length-i-1].font || 'helvetiker';

      if (items[items.length-i-1].small) {
        size = 2;
        bold = 'normal';
        bevelEnabled = false;
        bevel = 0;
        mat = 'MeshBasicMaterial';
      } else {
        size = items[items.length-i-1].size || 3;
        bold = items[items.length-i-1].bold ? 'bold' : 'normal';

        if (items[items.length-i-1].flat) {
          bevelEnabled = false;
          bevel = 0;
          mat = 'MeshBasicMaterial';
        } else {
          bevelEnabled = true;
          bevel = 0.2;
          mat = 'MeshPhongMaterial';
        }
      }

      var menuItemGeo = new THREE.TextGeometry(items[items.length-i-1].text, {font: font, size: size, height: size/2, weight: bold, bevelEnabled: bevelEnabled, bevelThickness: bevel, bevelSize: bevel});
      var menuItemMaterial = new THREE[mat]({color: 0x00CC00, ambient: 0x00FF00, specular: 0x33FF33, shininess: 5});
      var menuItem = new THREE.Mesh(menuItemGeo, menuItemMaterial);

      if (items[items.length-i-1].text === '%b') {
        menuItem.visible = false;
      }

      menuItem.position.setY((currentHeight)-(menuHeight/2)+(size/2)); // MATH?
      menuItem.position.setX(menuItem.geometry.boundingSphere.radius*-0.5);
      menuItem.menuItemSelectCallback = items[items.length-i-1].action || null;
      menuItem.theRoomYouWillJoin = items[items.length-i-1].room;

      this.menuBox.add( menuItem );
      this.menuItems.push( menuItem );
      currentHeight += size*2;
    }
  },

  clearMenu: function () {
    // Why did I think this would work?
    // Turns out it's just leaving invisible ghosts of
    // your menu screens physically floating out in space.
    // todo: not that.
    for (var i = 0; i < this.menuBox.children.length; i++) {
      this.menuBox.children[i].visible = false;
    }
    this.menuItems = [];
    this.menuBox.children = [];
  },

  open: function () {
    if (this.menuScreen !== 'default') {
      this.showDefaultMenu();
    }
    this.displayed = true;
    this.menuBox.visible = true;
    for (var i = 0; i < this.menuBox.children.length; i++) {
      this.menuBox.children[i].visible = true;
    }
    this.HUD.canvas.style.display = 'none';
    this.HUD.oculusCanvas.style.display = 'none';
  },

  close: function () {
    if (!this.game.room) return;

    this.displayed = false;
    this.menuBox.visible = false;
    this.cursorPosition = 0;
    for (var i = 0; i < this.menuBox.children.length; i++) {
      this.menuBox.children[i].visible = false;
    }
    if (this.menuScreen !== 'default') {
      this.clearMenu();
    }
    if (this.oculus.detected) {
      this.HUD.oculusCanvas.style.display = 'block';
    } else {
      this.HUD.canvas.style.display = 'block';
    }
  },

  hoverItem: function ( item ) {
    // changes appearance of hovered item to make it obvious
    // which one you have hovered. red can be a placeholder.
    if (item && this.hoveredItem !== item) {
      this.unhoverItem(this.hoveredItem);
      this.hoveredItem = item;
      if (this.hoveredItem.menuItemSelectCallback) {
        item.material.color.setHex(0xCC0000);
        if (item.material.ambient) {
          item.material.ambient.setHex(0xFF0000);
          item.material.specular.setHex(0xFF3333);
        }
      }
    }
  },

  unhoverItem: function ( item ) {
    if (this.hoveredItem) {
      item.material.color.setHex(0x00CC00);
      if (item.material.ambient) {
        item.material.ambient.setHex(0x00FF00);
        item.material.specular.setHex(0x33FF33);
      }
    }
  },

  selectItem: function () {
    // todo: cache menu screens during game load
    // currently recreating text mesh on every screen switch.
    if (!this.game.gameOverBoolean && this.hoveredItem.menuItemSelectCallback) {
      this.clearMenu();
      this[this.hoveredItem.menuItemSelectCallback]();
      this.cursorPosition = 0;
    }
  },

  updateHovered: function (direction) {
    if (this.displayed && this.menuItems.length > 0) {
      if (this.oculus.detected) {
        // Oculus menu navigation
        // Divides the field of view by the number of menu
        // items and moves hover up and down with head motion
        // todo: use ray casting to select items more accurately

        var viewingAngleX = Math.PI/4 * (this.oculus.quat.x);
        var viewingAngleY = Math.PI/4 * (this.oculus.quat.y);
        var tilt = ~~((this.menuItems.length/2 * this.oculus.quat.x) * 6 + ~~(this.menuItems.length/2));
        var hover = this.menuItems[tilt];
        this.hoverItem(hover);

        this.menuBox.position.setY((-150*Math.sin(viewingAngleX))/Math.sin(Math.PI/4));
        this.menuBox.position.setX((150*Math.sin(viewingAngleY))/Math.sin(Math.PI/4));
        // console.log(this.selectorRay.intersectObjects(this.menuBox.children));
      } else {
        // todo: skip over items with no action property
        if (direction === 'up' && this.cursorPosition < this.menuItems.length-1) {
          this.cursorPosition++;
        } else if (direction === 'down' && this.cursorPosition > 0) {
          this.cursorPosition--;
        }
        this.hoverItem(this.menuItems[this.cursorPosition]);
      }
    }
  },

  // -- GAME SPECIFIC FUNCTIONS AND MENU SCREENS
  // methods referenced in a menuItem's 'action'
  // property need to be defined here.

  showInitialMenu: function () {
    this.menuScreen = 'init';
    this.displayed = true;
    this.menuBox.visible = true;
    this.HUD.canvas.style.display = 'none';
    this.HUD.oculusCanvas.style.display = 'none';

    this.addMenuItems([
      {text: 'JOIN GAME', size: 5, action: 'showRoomList'},
      {text: 'CREATE GAME', size: 5, action: 'showCreateRoom'},
      {text: 'CREDITS', size: 5, action: 'showCredits'},
      {text: 'QUIT', size: 5, action: 'disconnect'}
    ]);
  },

  showDefaultMenu: function () {
    this.menuScreen = 'default';

    this.addMenuItems([
      {text: 'JOIN ROOM', size: 5, action: 'showRoomList'},
      {text: 'LEADERBOARD', size: 5, action: 'showScoreboard'},
      {text: 'QUIT', size: 5, action: 'disconnect'}
    ]);
  },

  showRoomList: function () {
    this.menuScreen = 'rooms';
    var that = this;

    $.get('/rooms', function (data) {
      var roomList = [{text: 'JOIN GAME', size: 5},{text:'name    players', size: 3, flat: true}];
      for (var room in data) {
        roomList.push({text: room + ' . . . ' + data[room], small: true, action: 'joinRoom', room: room});
      }
      if (that.game.room) {
        roomList.push({text: 'BACK', size: 3, action: 'showDefaultMenu'});
      } else {
        roomList.push({text: 'BACK', size: 3, action: 'showInitialMenu'});
      }
      that.addMenuItems(roomList);
    });
  },

  joinRoom: function () {
    this.game.roomEntered = true;
    room = this.hoveredItem.theRoomYouWillJoin;
    // room = 'asdf';
    this.game.room = room;
    this.game.comm.connectSockets();
    this.close();
  },

  showCreateRoom: function () {
    this.menuScreen = 'create';
    var prefix = this.roomNamePrefix[Math.floor(Math.random()*this.roomNamePrefix.length)];
    var suffix = this.roomNameSuffix[Math.floor(Math.random()*this.roomNameSuffix.length)];

    var roomName = prefix.toUpperCase() + '-' + suffix.toUpperCase();

    this.addMenuItems([
      {text: 'NAME: '+roomName, size: 5},
      {text: 'CHANGE NAME', size: 4, action: 'showCreateRoom'}, // todo: make an updateMenuItem function
      {text: 'INVASION MODE', size: 5, action: 'joinRoom', room: roomName},
      {text: 'FREE-FOR-ALL', size: 5, action: 'joinRoom', room: roomName}
    ]);
  },

  showScoreboard: function () {
    this.menuScreen = 'scoreboard';
    var that = this;

    $.get('/rooms/'+this.game.room, function (data) {
      var players = [{text: 'LEADERBOARD', size: 5, score: Infinity}];
      for (var name in data.kills) {
        players.push({text: name+' . . . '+data[name], small: true, score: data[name]});
      }
      players.sort(function (a, b) { return a.score > b.score; });
      that.addMenuItems(players);
    });
  },

  showTestMenu: function () {
    this.menuScreen = 'test';
    this.addMenuItems([
      {text: 'SAMPLE TEXT 1', size: 5},
      {text: 'SAMPLE TEXT 2', size: 2},
      {text: 'SAMPLE TEXT 3', size: 4},
      {text: 'SAMPLE TEXT 4', size: 3}
    ]);
  },

  showCredits: function () {
    this.menuScreen = 'creds';
    this.addMenuItems([
      {text: 'SATELLITE', size: 6},
      {text: '%b', size: 3},
      {text: 'Team Lead, Client-Server Architecture, Build Automation, Website Design', small: true},
      {text: 'PHILIP ALEXANDER', size: 4},
      {text: '%b', size: 3},
      {text: 'NPC Artificial Intelligence, Gameplay Mode Design, Multiplayer', small: true},
      {text: 'BRANDON COOPER', size: 4},
      {text: '%b', size: 3},
      {text: 'Oulus Rift Integration, Flight Controls, In-Game UI, Aditional Graphics, Lighting', small: true},
      {text: 'ERIC HANNUM', size: 4},
      {text: '%b', size: 3},
      {text: 'Server-Side Predictive Player Movement, Socket.io Integration', small: true},
      {text: 'ANDREW LU', size: 4},
      {text: '%b', size: 3},
      {text: 'Combat Mechanics, Weapon Design, Lighting, Particle Systems, Pyrotechnics', small: true},
      {text: 'GARY RYAN', size: 4},
      {text: '%b', size: 3},
      {text: 'Camera System, Environment Design, 3D Radar, Tactical Navigation Systems', small: true},
      {text: 'ANDREW SPADE', size: 4},
      {text: '%b', size: 3},
      {text: 'NPC Controller, Artificial Intelligence, Unit Testing, Website Design', small: true},
      {text: 'JOAO STEIN', size: 4},
      {text: '%b', size: 3},
      {text: 'Project Manager, Unit Testing, Network Optimization, Server-Side Predictive Physics', small: true},
      {text: 'SAM STITES', size: 4},
      {text: '%b', size: 3},
      {text: 'HUD, Flight Controls, Game Logic, Multiplayer Support, Audio Design', small: true},
      {text: 'FELIX TRIPIER', size: 4},
      {text: '%b', size: 7},
      {text: 'and Special Thanks to', small: true},
      {text: 'LARRY DAVIS', size: 3}

    ]);
  },

  disconnect: function () {
    // leave the game. possibly just by redirecting to home page?
    console.log('Disconnecting...');
  },

  gameOver: function (killer, baseDestroyed, message) {
    this.clearMenu();
    this.displayed = true;
    this.menuBox.visible = true;
    this.HUD.canvas.style.display = 'none';
    this.HUD.oculusCanvas.style.display = 'none';

    this.menuScreen = 'dead';

    var items = [
      {text: 'YOU DIED', size: 6},
      {text: 'YOU WERE KILLED BY '+killer.toUpperCase()},
      {text: 'RESPAWNING IN 6 SEC...'},
      {text: 'DISCONNECT', size: 5, action: 'disconnect'}
    ];

    if (baseDestroyed) {
      items.splice(0, 2, {text: message, size: 6}, {text: baseDestroyed + ' destroyed'});
    }
    this.addMenuItems(items);
  }
});
