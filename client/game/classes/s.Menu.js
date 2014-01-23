s.Menu = new Class({

  toString: 'Menu',

  construct: function ( options ) {
    this.camera = options.camera;
    this.menuItems = [];
    this.menuBox = new THREE.Mesh( new THREE.CubeGeometry(25, 25, 0), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.0}) );
    // Adding menu item format: {text: 'text_string', font: 'font_name_string(optional)'};
    this.addMenuItems([{text: 'JOIN GAME'}, {text: 'DISCONECT'}, {text: 'TEST'}, {text: 'TEST2'}]);

    this.menuBox.position.setZ(-150);
    this.camera.add( this.menuBox );
  },
  addMenuItems: function ( items ) {
    var menuHeight = items.length * 10;
    for (var i = 0; i < items.length; i++) {
      var font = items[i].font || 'helvetiker';
      var menuItemGeo = new THREE.TextGeometry(items[i].text, {font: font, size: 5, height: 5, weight: 'bold'});
      var menuItemMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00});
      var menuItem = new THREE.Mesh(menuItemGeo, menuItemMaterial);
      menuItem.position.setY((10*i)-(menuHeight/2)+2.5);
      menuItem.position.setX(menuItem.geometry.boundingSphere.radius*-0.5);
      this.menuBox.add( menuItem );
    }
  }

});