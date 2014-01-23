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

    // PlaneGeometry would be better than a cube for this but harder to write because 
    // it would need to be rotated and all it's child objects would need to be rotated back.
    // Optimize at your own risk.
    this.menuBox = new THREE.Mesh( new THREE.CubeGeometry(2500, 2500, 1), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.7}) );

    // Adding menu item format: {text: 'text_string', font: 'font_name_string(optional)'};
    this.addMenuItems([{text: 'JOIN GAME'}, {text: 'DISCONECT'}, {text: 'LEADERBOARD'}]);

    this.menuBox.position.setZ(-150);
    this.menuBox.visible = false;

    this.camera.add( this.menuBox );

    if (this.oculus.detected) {
      this.menuBox.position.setZ(-50);
    }
  },
  addMenuItems: function ( items ) {
    // procedurally center aligns text, vertically center aligns menu
    var menuHeight = items.length * 10;
    for (var i = 0; i < items.length; i++) {
      // this is currently the only font and it's only in bold
      // google typeface.js for how to add more.
      var font = items[items.length-i-1].font || 'helvetiker';
      var menuItemGeo = new THREE.TextGeometry(items[items.length-i-1].text, {font: font, size: 5, height: 5, weight: 'bold', bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3});
      var menuItemMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00});
      var menuItem = new THREE.Mesh(menuItemGeo, menuItemMaterial);
      menuItem.position.setY((10*i)-(menuHeight/2)+2.5); // MATH!
      menuItem.position.setX(menuItem.geometry.boundingSphere.radius*-0.5);
      menuItem.visible = false;
      this.menuBox.add( menuItem );
    }
  },
  clearMenu: function () {
    // I'm really surprised it's this easy.
    // I wonder if the menu items are even being garbage collected.
    // I mean, I ASSUME they are...
    this.menuBox.children = [];
  },
  open: function () {
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
  },
  updateSelection: function () {
    if (this.displayed) {
      // todo: the part where you interact with the menu at all.
    }
  }
});