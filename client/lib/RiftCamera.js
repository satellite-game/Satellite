/**
 * @author ehannum / http://github.com/ehannum
 * Based on RiftCamera.js by troffmo5 / http://github.com/troffmo5 but optimized
 * for use with Satellite: https://github.com/satellite-game/Satellite
 *
 * Effect to render the scene in stereo 3d side by side with lens distortion.
 * It is written to be used with the Oculus Rift (http://www.oculusvr.com/) but
 * it works also with other HMD using the same technology.
 */

THREE.OculusRiftEffect = function ( renderer ) {

  var duplicatedRenderer = new THREE.WebGLRenderer();

  for (var key in renderer) {
    duplicatedRenderer[key] = renderer[key];
  }

  var height = 800;
  var width = 640;

  var winWid = window.innerWidth/2;

  var toggle = false;

  var theCamera;

  this.render = function ( scene, camera ) {
    var autoClear = renderer.autoClear;

    renderer.autoClear = false;
    renderer.clear();

    // left eye
    camera.setViewOffset( width*0.9, height, 0, 0, width-(width*0.12), height );
    renderer.setViewport( 0, 0, winWid, height );

    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    requestAnimationFrame(this.render);

    // right eye
    camera.setViewOffset( width*0.9, height, 0, 0, width+(width*0.12), height );
    renderer.setViewport( winWid, 0, winWid, height );

    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    requestAnimationFrame(this.render);

    renderer.autoClear = autoClear;
  };
  toggle = !toggle;
};