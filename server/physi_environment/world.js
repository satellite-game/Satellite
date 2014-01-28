var THREE = require('./libs/three.js');
var Ammo = require('./libs/ammo.js');
var Physijs = require('./libs/physi.js')(THREE, Ammo);

// Create the scene
this.scene = scene = new Physijs.Scene();



// MAYBE////

// // Physics engine ready state
// // TODO: This event seems to fire before the engine is actually doing anything
// this.physicsStarted = false;
// this.scene.addEventListener(
//   'ready',
//   function() {
//     self.physicsStarted = true;
//     self.tryInitialize();
//   }
// );