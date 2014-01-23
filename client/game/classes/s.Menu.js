s.Menu = new Class({

  toString: 'Menu',

  construct: function ( options ) {
    this.camera = options.camera;
    this.menuItems = [];
    this.menuBox = new THREE.Mesh( new THREE.CubeGeometry(2500, 2500, 0), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.7}) );
    // Adding menu item format: {text: 'text_string', font: 'font_name_string(optional)'};
    this.addMenuItems([{text: 'JOIN GAME'}, {text: 'DISCONECT'}, {text: 'LEADERBOARD'}]);

    this.menuBox.position.setZ(-150);
    this.camera.add( this.menuBox );
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
      this.menuBox.add( menuItem );
    }
  },
  clearMenu: function () {
    // I'm surprised it's this easy
    // I wonder if the menu items are even being garbage collected
    // I mean, I ASSUME they are...
    this.menuBox.children = [];
  },
  show: function () {

  },
  hide: function () {

  }
});