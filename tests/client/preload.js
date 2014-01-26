/*
s.util.loadModels is declared again to override s.loader.load()
path to use '/base/tests/mock' making it work with karma.
*/

s.util.loadModels = function(options) {
  var toLoad = options.models.length;

  // Hold models
  var models = {};

  var loaded = function(name, geometry, materials) {
    // Store model and materials
    models[name] = {
      geometry: geometry,
      materials: materials
    };

    // Track progress
    toLoad--;
    if (toLoad === 0) {
      console.log('Models loaded!');
      if (typeof options.complete === 'function')
        options.complete(models);
    }
    else {
      var pct = (options.models.length-toLoad)/options.models.length*100;

      console.log('Loading models: '+pct.toFixed(0)+'%');
      if (typeof options.progress === 'function')
        options.progress(pct, models[name]);
    }
  };

  options.models.forEach(function(name, index) {
    s.loader.load('/base/tests/mock/models/' + name + '.json', loaded.bind(null, name));
  });
};

/*
s.util.loadTextures is declared again to override new THREE.ImageUtils.loadTexture()
path to use '/base/tests/mock' making it work with karma.
*/

s.util.loadTextures = function(options) {
  var toLoad = options.textures.length;

  // Hold textures
  var textures = {};

  var loaded = function(name, texture) {
    // Store texture
    textures[name] = texture;

    // Track progress
    toLoad--;
    if (toLoad === 0) {
      console.log('Textures loaded!');
      if (typeof options.complete === 'function')
        options.complete(textures);
    }
    else {
      var pct = (options.textures.length-toLoad)/options.textures.length*100;

      console.log('Loading textures: '+pct.toFixed(0)+'%');
      if (typeof options.progress === 'function')
        options.progress(pct, textures[name]);
    }
  };

  options.textures.forEach(function(name, index) {
    // Strip file extension
    var shortName = name.split('.')[0];

    new THREE.ImageUtils.loadTexture('/base/tests/mock/textures/' + name, {}, loaded.bind(null, shortName));
  });
};


// Init the game one time before running the tests
s.init();
