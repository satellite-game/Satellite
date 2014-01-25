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
    s.loader.load('/base/tests/mock/' + name + '.json', loaded.bind(null, name));
  });
};

// Init the game one time before running the tests
s.init();
