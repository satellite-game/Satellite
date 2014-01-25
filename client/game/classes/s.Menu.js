// This menu item is going to be 3D text floating in game in front of
// the camera. It's more complicated but it'll be cool in the oculus.

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

    this.selectorRay = new THREE.Raycaster(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,1), 0, 300);
    // this.selectorHelper = new THREE.ArrowHelper(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-0.3), 50, 0xFF00FF);

    // PlaneGeometry would be better than a cube for this but harder to write because 
    // it would need to be rotated and all it's child objects would need to be rotated back.
    // Optimize at your own risk.
    this.menuBox = new THREE.Mesh( new THREE.CubeGeometry(2500, 2500, 1), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.7}) );

    // Format for adding menu item object:
    // {
    //   text:   'displayed text string'(required),
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

      var menuItemGeo = new THREE.TextGeometry(items[items.length-i-1].text, {font: font, size: size, height: size, weight: bold, bevelEnabled: bevelEnabled, bevelThickness: bevel, bevelSize: bevel});
      var menuItemMaterial = new THREE[mat]({color: 0x00CC00, ambient: 0x00FF00, specular: 0x33FF33, shininess: 5});
      var menuItem = new THREE.Mesh(menuItemGeo, menuItemMaterial);

      menuItem.position.setY((currentHeight)-(menuHeight/2)+(size/2)); // MATH?
      menuItem.position.setX(menuItem.geometry.boundingSphere.radius*-0.5);
      menuItem.menuItemSelectCallback = items[items.length-i-1].action || null;

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
    if (item) {
      if (this.hoveredItem !== item) {
        this.unhoverItem(this.hoveredItem);
        this.hoveredItem = item;
      }
      item.material.color.setHex(0xCC0000);
      if (item.material.ambient) {
        item.material.ambient.setHex(0xFF0000);
        item.material.specular.setHex(0xFF3333);
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
    if (this.hoveredItem.menuItemSelectCallback) {
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

        var viewingAngle = Math.PI/4 * (this.oculus.quat.x - this.oculus.compensationX);
        var tilt = ~~((this.menuItems.length/2 * this.oculus.quat.x - this.oculus.compensationX) * 6 + ~~(this.menuItems.length/2));
        var hover = this.menuItems[tilt];
        this.hoverItem(hover);

        this.menuBox.position.setY((-150*Math.sin(viewingAngle))/Math.sin(Math.PI/4)/2+4); // ...ish
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

    this.addMenuItems([
      {text: 'JOIN GAME', size: 5, action: 'showRoomList'},
      {text: 'CREATE GAME', size: 5, action: 'createRoom'},
      {text: 'SAMPLE MENU', size: 5, action: 'showTestMenu'},
      {text: 'QUIT', size: 5, action: 'disconnect'}
    ]);
  },

  showDefaultMenu: function () {
    this.menuScreen = 'default';

    this.addMenuItems([
      {text: 'CHANGE ROOM', size: 5, action: 'showRoomList'},
      {text: 'LEADERBOARD', size: 5, action: 'showScoreboard'},
      {text: 'SAMPLE MENU', size: 5, action: 'showTestMenu'},
      {text: 'DISCONECT', size: 5, action: 'disconnect'}
    ]);
  },

  showRoomList: function () {
    this.menuScreen = 'rooms';

    $.get({
      url: '/rooms',
      datatype: 'json',
      success: function (data) {

        var roomList = [{text: 'JOIN GAME', size: 5}];
        for (var i = 0; i < data.length; i++) {
          roomList.push({text: data[i].name + '...' + data[i].players, small: true, action: 'joinRoom', room: rooms[i].name});
        }
        roomList.push({text: '+ CREATE NEW ROOM +', small: true, action: 'createRoom'});
        this.addMenuItems(roomList);
      },
      error: function (err) {
        throw new Error('Failed to get room list from /rooms');
      }
    });
    // this.addMenuItems([
    //   {text: 'SELECT A ROOM', size: 5},
    //   {text: 'hey strong bad', small: true, action: 'joinRoom', room: 'asdf'},
    //   {text: 'you jumped over', small: true, action: 'joinRoom', room: 'test'},
    //   {text: 'some a muh busses', small: true, action: 'joinRoom', room: 'puh fuh fuh'}
    // ]);
  },

  joinRoom: function () {
    var room = this.hoveredItem.room;
    // some socket changing stuff.
    // then basically just remove the player and respawn
    // sim-fuckin-ple.
    this.game.roomSelected = true;
    this.game.comm.connectSockets(room);
    this.close();
  },

  createRoom: function () {
    console.log('No.');
  },

  showScoreboard: function () {
    this.menuScreen = 'scoreboard';

    $.get({
      url: '/scores',
      datatype: 'json',
      data: {room: s.game.comm.room},
      success: function (data) {

        var players = [{text: 'LEADERBOARD', size: 5}];
        for (var i = 0; i < data.length; i++) {
          players.push({text: data[i].name+'...'+data[i].score, small: true});
        }
        this.addMenuItems(players);

      },
      error: function (err) {
        throw new Error('Failed to get player scores from /' + this.game.comm.room);
      }
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

  disconnect: function () {
    // leave the game. possibly just by redirecting to home page?
    console.log('Disconnecting...');
  },

  gameOver: function (killer) {
    this.clearMenu();
    this.displayed = true;
    this.menuBox.visible = true;
    this.HUD.canvas.style.display = 'none';
    this.HUD.oculusCanvas.style.display = 'none';

    this.menuScreen = 'dead';
    this.addMenuItems([
      {text: 'YOU DIED', size: 6},
      {text: 'YOU WERE KILLED BY '+killer.toUpperCase()},
      {text: 'RESPAWNING IN 6 SEC...'},
      {text: ' '},
      {text: 'DISCONNECT', size: 5, action: 'disconnect'}
    ]);
  }
});
