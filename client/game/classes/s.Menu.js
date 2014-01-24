// This menu item is going to be 3D text floating in game in front of
// the camera. It's more complicated but it'll be cool in the oculus.

s.Menu = new Class({

  toString: 'Menu',

  construct: function ( options ) {
    this.displayed = false;
    this.camera = options.game.camera;
    this.HUD = options.game.HUD;
    this.oculus = options.game.oculus;
    this.menuItems = [];
    this.menuScreen = 'none';
    this.cursorPosition = 0;
    this.hoveredItem = null;

    // PlaneGeometry would be better than a cube for this but harder to write because 
    // it would need to be rotated and all it's child objects would need to be rotated back.
    // Optimize at your own risk.
    this.menuBox = new THREE.Mesh( new THREE.CubeGeometry(2500, 2500, 1), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.7}) );

    // Format for adding menu item object:
    // { text: 'displayed_text_string'(required),
    // action: 'callbackNameString' (called in context of 'this')(default null),
    // font: 'font_name_string'(default "helvetiker"),
    // bold: true/false (default false),
    // size: number(1-5ish)(defualt 3),
    // flat: true/false(changes shader, depth and bevel)(default false),
    // small: true/false(overides flat, bold, and size to make a standardized readable small font)(default false) };
    
    this.menuBox.position.setZ(-150);
    this.menuBox.visible = false;

    this.camera.add( this.menuBox );

    if (this.oculus.detected) {
      this.menuBox.position.setZ(-50);
    }

    // this.showDefaultMenu();
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
    this.menuItems = [];
    for (var i = 0; i < this.menuBox.children.length; i++) {
      this.menuBox.children[i].visible = false;
    }
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
    // todo: hide HUD while open.
    this.HUD.canvas.style.display = 'none';
    this.HUD.oculusCanvas.style.display = 'none';
  },

  close: function () {
    this.displayed = false;
    this.menuBox.visible = false;
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
    this[this.hoveredItem.menuItemSelectCallback]();
  },

  updateHovered: function () {
    if (this.displayed && this.menuItems.length > 0) {
      if (this.oculus.detected) {
        // Oculus menu navigation
        // Divides the field of view by the number of menu
        // items and moves hover up and down with head motion

        var viewingAngle = Math.PI/4 * (this.oculus.quat.x - this.oculus.compensationX);
        var tilt = ~~((this.menuItems.length/2 * this.oculus.quat.x - this.oculus.compensationX) * 6 + ~~(this.menuItems.length/2));
        var hover = this.menuItems[tilt];
        this.hoverItem(hover);

        this.menuBox.position.setY((-150*Math.sin(viewingAngle))/Math.sin(Math.PI/4)/2+4); // Man I don't know, math or something.
      } else {
        // todo: keyboard, mouse, and controller navigation
      }
    }
  },

  // -- GAME SPECIFIC FUNCTIONS AND MENU SCREENS

  showDefaultMenu: function () {
    this.menuScreen = 'default';
    this.addMenuItems([
      {text: 'JOIN GAME', size: 5, action: 'showRoomList'},
      {text: 'DISCONECT', size: 5, action: 'disconnect'},
      {text: 'LEADERBOARD', size: 5, action: 'showScoreboard'},
      {text: 'SAMPLE TEXT', size: 5, action: 'showTestMenu'}
    ]);
  },

  showRoomList: function () {
    this.clearMenu();
    this.menuScreen = 'rooms';
    // var roomNames = [];
    // // some database stuff to get list of existing rooms and order them by player count
    // var rooms = [{text: 'JOIN GAME', size: 5}];
    // for (var i = 0; i < roomNames.length; i++) {
    //   rooms.push({text: roomNames[i], small: true});
    // }
    // rooms.push({text: '+ CREATE NEW ROOM +', small: true, action: this.createRoom});
    // this.addMenuItems(rooms);
  },

  showScoreboard: function () {
    this.clearMenu();
    this.menuScreen = 'scoreboard';
    // var playerNames = [];
    // // some database stuff to get list of players and order them by score
    // var players = [{text: 'LEADERBOARD', size: 5}];
    // for (var i = 0; i < database.length; i++) {
    //   players.push({text: playerNames[i], small: true});
    // }

  },

  showTestMenu: function () {
    this.clearMenu();
    this.menuScreen = 'test';
    var players = [{text: 'SAMPLE TEXT 1', size: 5}, {text: 'SAMPLE TEXT 2', size: 5}, {text: 'SAMPLE TEXT 3', size: 5}, {text: 'SAMPLE TEXT 4', size: 5}];
    this.addMenuItems( players );
  },

  disconnect: function () {
    // leave the game. possibly just by just refreshing the page?
  }
});