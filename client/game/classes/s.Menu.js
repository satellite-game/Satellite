s.Menu = new Class({

  toString: 'Menu',

  construct: function ( options ) {
    this.displayed = false;
    this.game = options.game;
    this.camera = options.game.camera;
    this.HUD = options.game.HUD;
    this.oculus = options.game.oculus;
    this.gamepad = options.game.gamepad;

    this.menuItems = [];
    this.menuScreen = 'none';
    this.cursorPosition = 0;
    this.scrollable = true;
    this.hoveredItem = null;
    this.menuHeight = 0;

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
    //   action: 'callbackNameString' (called in context of 'this' when selected)(default null),
    //   font:   'font name string'(default "helvetiker"),
    //   bold:   true/false (default false),
    //   size:   number(1-5ish)(defualt 3),
    //   flat:   true/false(changes shader, depth and bevel)(default false),
    //   small:  true/false(overides flat, bold, and size to make a standard readable small font)(default false)
    // };
    
    this.menuBox.position.setZ(-150);
    this.menuBox.visible = false;

    this.camera.add( this.menuBox );
    this.camera.add( this.selectorRay );
    // this.camera.add( this.selectorHelper );

    if (this.oculus.detected) {
      this.menuBox.position.setZ(-50);
    }

    // todo: more kind of space themed things for this
    this.roomNamePrefix = ['Space', 'Wolf', 'Jupiter', 'PlFanet', 'Purple', 'Nova', 'M', 'Rad', 'Moon', 'Vector', 'Orion', 'Terra', 'Danger', 'Solar', 'Starlight', 'Spice', 'Lumpy', 'Outer', 'Deep-Space', 'Medusa', 'Hydra', 'Extrasolar', 'Rebel', 'Alliance'];
    this.roomNameSuffix = ['Base', '359', 'Station', 'X', 'Y', 'Z', 'Dimension', 'Zone', 'Quadrant', 'Alpha', '83', 'Sector', 'Prime', 'Dome', 'Prospect', 'Expanse', 'Imperium', 'Outpost', '1999', '64', 'Rift', 'Cloud', 'Nebula', 'Colony', 'Blockade', 'Fleet', 'System', 'Omega', 'Beta', 'Abyss'];
  },

  addMenuItems: function ( items ) {
    // procedurally center aligns text, vertically center aligns menu
    var currentHeight = 0;
    this.menuItems = [];
    for (var j = 0; j < items.length; j++) {
      if (items[j].small) {
        this.menuHeight += 4;
      } else {
        var itemSize = items[j].size || 3;
        this.menuHeight += itemSize*2;
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
          height,
          font = items[items.length-i-1].font || 'helvetiker';

      if (items[items.length-i-1].small) {
        size = 2;
        bold = 'normal';
        bevelEnabled = false;
        bevel = 0;
        mat = 'MeshBasicMaterial';
        height = 0.5;
      } else {
        size = items[items.length-i-1].size || 3;
        bold = items[items.length-i-1].bold ? 'bold' : 'normal';

        if (items[items.length-i-1].flat) {
          bevelEnabled = false;
          bevel = 0;
          mat = 'MeshBasicMaterial';
          height = size/4;
        } else {
          bevelEnabled = true;
          bevel = 0.2;
          mat = 'MeshPhongMaterial';
          height = size/2;
        }
      }

      if (items[items.length-i-1].text !== '%b') {
        var menuItemGeo = new THREE.TextGeometry(items[items.length-i-1].text, {font: font, size: size, height: height, weight: bold, bevelEnabled: bevelEnabled, bevelThickness: bevel, bevelSize: bevel});
        var menuItemMaterial = new THREE[mat]({color: 0x00CC00, ambient: 0x00FF00, specular: 0x33FF33, shininess: 5});
        var menuItem = new THREE.Mesh(menuItemGeo, menuItemMaterial);

        menuItem.position.setX(menuItem.geometry.boundingSphere.radius*-0.5);
        menuItem.position.setY((currentHeight)-(this.menuHeight/2)+(size/2));
        menuItem.position.setZ(1);
        menuItem.menuItemSelectCallback = items[items.length-i-1].action || null;
        menuItem.theRoomYouWillJoin = items[items.length-i-1].room;
        menuItem.text = items[items.length-i-1].text;

        this.menuBox.add( menuItem );
        this.menuItems.push( menuItem );
      } else {
        this.menuItems.push('%b');
      }
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
    this.menuHeight = 0;
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

    this.hoverItem(this.menuItems[this.cursorPosition]);
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
        item.material.color.setHex(0x00CCCC);
        if (item.material.ambient) {
          item.material.ambient.setHex(0x00FFFF);
          item.material.specular.setHex(0x33FFFF);
        }
      }
    }
  },

  unhoverItem: function ( item ) {
    if (this.hoveredItem && this.hoveredItem !== '%b') {
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
    if (!this.game.gameOverBoolean && this.hoveredItem && this.hoveredItem.menuItemSelectCallback) {
      this.scrollable = true;
      this.clearMenu();
      var oldScreen = this.menuScreen;
      this[this.hoveredItem.menuItemSelectCallback]();
      this.cursorPosition = this.menuScreen === oldScreen ? this.cursorPosition : this.menuItems.length-1;
      this.hoverItem(this.menuItems[this.cursorPosition]);
      this.menuBox.position.setY((this.cursorPosition)*(this.menuHeight/this.menuItems.length*-1)+this.menuHeight/2-this.menuHeight/this.menuItems.length/2);
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
        if (this.scrollable) this.hoverItem(hover);

        if (this.menuScreen !== 'creds') this.menuBox.position.setY((-150*Math.sin(viewingAngleX))/Math.sin(Math.PI/4));
        this.menuBox.position.setX((150*Math.sin(viewingAngleY))/Math.sin(Math.PI/4));
      } else if (this.scrollable) {
        if (direction === 'up' && this.cursorPosition < this.menuItems.length-1) {
          this.cursorPosition++;
          while (this.menuItems[this.cursorPosition] === '%b') {
            this.cursorPosition++;
          }
        } else if (direction === 'down' && this.cursorPosition > 0) {
          this.cursorPosition--;
          while (this.menuItems[this.cursorPosition] === '%b') {
            this.cursorPosition--;
          }
        }
        
        // todo: skip over unselectable items.
        
        // var currentCursor = this.cursorPosition;
        // if (direction === 'up' && this.cursorPosition < this.menuItems.length-1) {
        //   while (currentCursor < this.menuItems.length-1) {
        //     currentCursor++;
        //     if (!!this.menuItems[currentCursor].menuItemSelectCallback) {
        //       this.cursorPosition = currentCursor;
        //       return;
        //     }
        //   }
        // } else if (direction === 'down' && this.cursorPosition > 0) {
        //   while (currentCursor > 0) {
        //     currentCursor--;
        //     if (!!this.menuItems[currentCursor].menuItemSelectCallback) {
        //       this.cursorPosition = currentCursor;
        //       return;
        //     }
        //   }
        // }

        // todo: skip over unselectable items.
        
        // var currentCursor = this.cursorPosition;
        // if (direction === 'up' && this.cursorPosition < this.menuItems.length-1) {
        //   while (currentCursor < this.menuItems.length-1) {
        //     currentCursor++;
        //     if (!!this.menuItems[currentCursor].menuItemSelectCallback) {
        //       this.cursorPosition = currentCursor;
        //       return;
        //     }
        //   }
        // } else if (direction === 'down' && this.cursorPosition > 0) {
        //   while (currentCursor > 0) {
        //     currentCursor--;
        //     if (!!this.menuItems[currentCursor].menuItemSelectCallback) {
        //       this.cursorPosition = currentCursor;
        //       return;
        //     }
        //   }
        // }

        this.scrollPosition = (this.cursorPosition)*(this.menuHeight/this.menuItems.length*-1)+this.menuHeight/2-this.menuHeight/this.menuItems.length/2;

        var that = this;
        var easeOut = function () {
          if (Math.abs(that.menuBox.position.y - that.scrollPosition) > 0.05) {
            that.menuBox.position.y += (that.scrollPosition - that.menuBox.position.y)/4;
          } else {
            that.menuBox.position.setY(that.scrollPosition);
            that.game.unhook(easeOut);
          }
        };

        this.game.hook(easeOut);
        this.hoverItem(this.menuItems[this.cursorPosition]);
      }
    }

    // todo: an addMenuScreen method that will create a
    // complete menu screen callable from an item's
    // 'action' property. For creating entries in the
    // method section below.

    // todo: add a proper back button action
  },

  // -- GAME SPECIFIC FUNCTIONS AND MENU SCREENS
  // methods referenced in a menuItem's 'action'
  // property need to be defined here.

  showStartMenu: function () {
    this.menuScreen = 'start';
    this.displayed = true;
    this.menuBox.visible = true;
    this.scrollable = false;

    this.HUD.canvas.style.display = 'none';
    this.HUD.oculusCanvas.style.display = 'none';

    var startMenuText = [
      {text: 'SATELLITE', size: 7},
      {text: '%b'},
      {text: 'START', action: 'showInitialMenu'},
      {text: '%b', size: 2}
    ];

    if (!this.oculus.detected) {
      startMenuText.push({text: 'No Oculus Rift active. Install vr.js and restart your browser.', small: true});
    } else {
      startMenuText.push({text: 'OCULUS RIFT DETECTED', flat: true, size: 3});
    }

    if (!this.gamepad.gamepads.length) {
      startMenuText.push(
        {text: 'No gamepad active. Press any face button to activate.', small: true},
        {text: 'No flightstick active. Pull trigger to activate.', small: true}
      );
    } else {
      startMenuText.push(
        {text: 'GAMEPAD/FLIGHTSTICK DETECTED', flat: true, size: 3},
        {text: 'Press FIRE to start.', small: true}
      );
    }

    this.addMenuItems(startMenuText);
    console.log(this.menuItems);

    this.cursorPosition = this.menuItems.length-3;
    this.hoverItem(this.menuItems[this.cursorPosition]);
  },

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
      {text: 'RESUME', size: 5, action: 'close'},
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
      roomList.push({text: 'BACK', size: 3, action: 'back'});
      that.addMenuItems(roomList);
    });
  },

  back: function () {
    if (this.game.roomEntered) {
      this.showDefaultMenu();
    } else {
      this.showInitialMenu();
    }
  },

  joinRoom: function () {
    this.game.roomEntered = true;
    room = this.hoveredItem.theRoomYouWillJoin;
    this.game.room = room;
    this.game.comm.connectSockets();
    this.close();
  },

  showCreateRoom: function () {
    this.menuScreen = 'create';
    var prefix = this.roomNamePrefix[Math.floor(Math.random()*this.roomNamePrefix.length)];
    var suffix = this.roomNameSuffix[Math.floor(Math.random()*this.roomNameSuffix.length)];

    this.game.room = this.game.room || prefix.toUpperCase() + '-' + suffix.toUpperCase();
    var bots = this.game.humansOnly ? 'OFF' : 'ON';

    this.addMenuItems([
      {text: 'NAME: '+this.game.room.toUpperCase(), size: 5},
      {text: 'CHANGE NAME', size: 4, action: 'shuffleRoom'},
      {text: 'BOTS: '+bots, size: 4, action: 'toggleBots'},
      {text: '%b', size: 2},
      {text: 'INVASION MODE', size: 5, action: 'createRoom'},
      {text: 'FREE-FOR-ALL', size: 5, action: 'createRoom'},
      {text: 'BACK', size: 3, action: 'back'}
    ]);
  },

  createRoom: function () {
    this.game.roomEntered = true;
    room = this.game.room;
    if (this.hoveredItem.text === 'INVASION MODE') {
      this.game.teamMode = true;
    } else {
      this.game.teamMode = false;
    }
    this.game.comm.connectSockets();
    this.close();
  },

  // todo: make an updateMenuItem function!
  shuffleRoom: function () {
    var prefix = this.roomNamePrefix[Math.floor(Math.random()*this.roomNamePrefix.length)];
    var suffix = this.roomNameSuffix[Math.floor(Math.random()*this.roomNameSuffix.length)];

    this.game.room = prefix.toUpperCase() + '-' + suffix.toUpperCase();
    this.showCreateRoom();
  },

  toggleBots: function () {
    this.game.humansOnly = !this.game.humansOnly;
    this.showCreateRoom();
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

  showCredits: function () {
    this.menuScreen = 'creds';
    this.addMenuItems([
      {text: 'SATELLITE', size: 7, bold: true},
      {text: '%b', size: 5},
      {text: 'Team Lead, Client-Server Architecture, Build Automation, Website Design', small: true},
      {text: 'PHILIP ALEXANDER', size: 4},
      {text: '%b', size: 2},
      {text: 'NPC Artificial Intelligence, Gameplay Mode Design, Multiplayer', small: true},
      {text: 'BRANDON COOPER', size: 4},
      {text: '%b', size: 2},
      {text: 'Oulus Rift Integration, Flight Controls, In-Game UI, Aditional Graphics', small: true},
      {text: 'ERIC HANNUM', size: 4},
      {text: '%b', size: 2},
      {text: 'Server-Side Predictive Player Movement, Socket.io Integration', small: true},
      {text: 'ANDREW LU', size: 4},
      {text: '%b', size: 2},
      {text: 'Combat Mechanics, Weapon Design, Lighting, Particle Systems, Pyrotechnics', small: true},
      {text: 'GARY RYAN', size: 4},
      {text: '%b', size: 2},
      {text: 'Camera System, Environment Design, 3D Radar, Tactical Navigation Systems', small: true},
      {text: 'ANDREW SPADE', size: 4},
      {text: '%b', size: 2},
      {text: 'NPC Controller, Artificial Intelligence, Unit Testing, Website Development', small: true},
      {text: 'JOAO STEIN', size: 4},
      {text: '%b', size: 2},
      {text: 'Project Manager, Unit Testing, Network Optimization, Server-Side Predictive Physics', small: true},
      {text: 'SAM STITES', size: 4},
      {text: '%b', size: 2},
      {text: 'HUD, Flight Controls, Game Logic, Multiplayer Support, Audio Design', small: true},
      {text: 'FELIX TRIPIER', size: 4},
      {text: '%b', size: 5},
      {text: 'Special Thanks to', small: true},
      {text: 'LARRY DAVIS', size: 3},
      {text: 'HACK REACTOR', size: 3},
      {text: '%b', size: 18},
      {text: 'Thanks for playing!', size: 6, action: 'back'}
    ]);

    this.scrollable = false;
    this.cursorPosition = 0;
    this.hoverItem(this.menuItems[this.cursorPosition]);
    this.autoScrollMenu(2);
  },

  autoScrollMenu: function (speed) {
    speed = speed || 1;
    this.menuBox.position.setY(this.menuHeight/-2);
    var that = this;
    this.game.hook(function () {
      if (that.menuBox.position.y < that.menuHeight/2) {
        that.menuBox.position.y += speed/20;
      }
    });
  },

  disconnect: function () {
    console.log('Disconnecting.');
    window.location.href = "http://satellite-game.com";
  },

  gameOver: function (killer, baseDestroyed, message) {
    this.menuScreen = 'dead';

    this.clearMenu();
    this.displayed = true;
    this.menuBox.visible = true;
    this.HUD.canvas.style.display = 'none';
    this.HUD.oculusCanvas.style.display = 'none';

    var items = [
      {text: 'YOU DIED', size: 6},
      {text: 'YOU WERE KILLED BY '+killer.toUpperCase()},
      {text: 'RESPAWNING IN 6 SEC...'},
      {text: '%b', size: 2},
      {text: 'DISCONNECT', size: 5, action: 'disconnect'}
    ];

    if (baseDestroyed) {
      items.splice(0, 2, {text: message.toUpperCase(), size: 6}, {text: baseDestroyed.toUpperCase() + ' DESTROYED'});
    }
    this.addMenuItems(items);
  }
});
