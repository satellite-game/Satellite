s.Menu = new Class({

  toString: 'Menu',

  construct: function ( options ) {
    this.camera = options.camera;
    this.menuHeight = 50;
    this.menuItems = [];
    this.menuBox = new THREE.Mesh( new THREE.CubeGeometry(150, 100, 0), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.0}) );
    // Adding menu item format: {text: 'text_string', font: 'font_name_string(optional)'};
    addMenuItems([{text: 'JOIN GAME'}, {text: 'DISCONECT'}]);

    this.menuBox.position.setZ(-150);
    this.camera.add( menuBox );
  },
  addMenuItems: function ( items ) {
    this.menuHeight = items.length * 50;
    this.menuBox.scale.setY(this.menuHeight);
    for (var i = 0; i < items.length; i++) {
      var font = items[i].font || 'helvetiker';
      var menuItemGeo = new THREE.TextGeometry(items[i].text, {font: font, size: 50});
      var menuItemMaterial = new THREE.MeshLambertMaterial({color: 0x00FF00});
      var menuItem = new THREE.Mesh(menuItemGeo, menuItemMaterial);
      menuItem.position.setY(menuHeight - menuHeight*i);
      this.menuBox.add( menuItem );
    }
  }

});