describe('Bot class', function () {

  beforeEach(function () {
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

    s.init();

    var bot = new s.Bot({
      game: s.game,
      name: 'bot 1',
      shipClass: 'human_ship_heavy',
      position: [22498, -25902, 24976],
      rotation: [0, Math.PI / 2, 0],
      alliance: 'enemy'
    });
  });

  it('should create new Bot instance', function () {
    expect(true).to.equal(true);
  });
});