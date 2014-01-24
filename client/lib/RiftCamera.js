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

  var height = 800;
  var width = 640;

  var winWid = window.innerWidth/2;

  this.render = function ( scene, camera ) {
    camera.fov = 120;
    var autoClear = renderer.autoClear;

    renderer.autoClear = false;
    renderer.clear();

    // radar renderer. Either too small and too dense or
    // too big and... just too big. Don't think this is
    // goint to work in a Rift.

    if (scene.name === 'radarScene') {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';

      // left eye
      camera.setViewOffset( width+200, height-300, width*-0.08, 0, width, height );
      renderer.setViewport( 0, 0, winWid, height );

      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      requestAnimationFrame(this.render);

      // right eye
      camera.setViewOffset( width+200, height-300, width*0.08, 0, width, height );
      renderer.setViewport( winWid, 0, winWid, height );

      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      requestAnimationFrame(this.render);
    } else {

      // left eye
      camera.setViewOffset( width, height, width*-0.08, 0, width, height );
      renderer.setViewport( 0, 0, winWid, height );

      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      requestAnimationFrame(this.render);

      // right eye
      camera.setViewOffset( width, height, width*0.08, 0, width, height );
      renderer.setViewport( winWid, 0, winWid, height );

      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      requestAnimationFrame(this.render);
    }

    renderer.autoClear = autoClear;
  };
};
