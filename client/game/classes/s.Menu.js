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
    this.menuScreen = 'default';

    // PlaneGeometry would be better than a cube for this but harder to write because 
    // it would need to be rotated and all it's child objects would need to be rotated back.
    // Optimize at your own risk.
    this.menuBox = new THREE.Mesh( new THREE.CubeGeometry(2500, 2500, 1), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.7}) );

    // Adding menu item format: {text: 'displayed_text_string'(required), font: 'font_name_string'(default "helvetiker"), bold: true/false (default false), size: number(1-5)(defualt 3), flat: true/false(changes shader, depth and bevel)(default false), small: true/false(overides flat, bold, and size to make a default readable small font)(default false)};
    
    this.menuBox.position.setZ(-150);
    this.menuBox.visible = false;

    this.camera.add( this.menuBox );

    if (this.oculus.detected) {
      this.menuBox.position.setZ(-50);
    }

    this.showDefaultMenu();
  },
  addMenuItems: function ( items ) {
    // procedurally center aligns text, vertically center aligns menu
    var menuHeight = 0;
    var currentHeight = 0;
    for (var j = 0; j < items.length; j++) {
      if (items[j].small) {
        menuHeight += 4;
      } else {
        var itemSize = items[j].size || 3;
        menuHeight += itemSize*2;
      }
    }
    for (var i = 0; i < items.length; i++) {
      // this is currently the only font and it's only in bold
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

      var menuItemGeo = new THREE.TextGeometry(items[items.length-i-1].text, {font: font, size: size, height: size*2, weight: bold, bevelEnabled: bevelEnabled, bevelThickness: bevel, bevelSize: bevel});
      var menuItemMaterial = new THREE[mat]({color: 0x00FF00});
      var menuItem = new THREE.Mesh(menuItemGeo, menuItemMaterial);
      menuItem.position.setY((currentHeight)-(menuHeight/2)+(size/2)); // MATH?
      menuItem.position.setX(menuItem.geometry.boundingSphere.radius*-0.5);
      menuItem.visible = false;
      this.menuBox.add( menuItem );
      currentHeight += size*2;
    }
  },
  clearMenu: function () {
    // I'm really surprised it's this easy.
    // I wonder if the menu items are even being garbage collected.
    // I mean, I ASSUME they are...
    // this.menuBox.children = [];
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
  },
  updateSelection: function () {
    if (this.displayed) {
      // todo: the part where you interact with the menu at all.
    }
  },
  showDefaultMenu: function () {
    this.menuScreen = 'default';
    this.addMenuItems([{text: 'JOIN GAME', size: 5}, {text: 'DISCONECT', size: 5}, {text: 'LEADERBOARD', size: 5}, {text: 'SMALL TEST TEXT 1', small: true}, {text: 'SMALL TEST TEXT 2', small: true}, {text: 'SMALL TEST TEXT 3', small: true}]);
  },
  showRoomList: function () {
    this.clearMenu();
    this.menuScreen = 'rooms';
    var roomNames = [];
    // some database stuff to get open rooms
    var rooms = [];
    for (var i = 0; i < roomNames.length; i++) {
      rooms.push({text: roomNames[i], small: true});
    }
    this.addMenuItems(rooms);
  }
});