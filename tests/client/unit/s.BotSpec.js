describe('Bot class', function () {

  var makeBot = function (specs, done) {
    setTimeout(function () {
      s.game.player = new s.Player({
        game: s.game,
        shipClass: 'human_ship_heavy',
        position: new THREE.Vector3(23498, -25902, 24976),
        name: 'Player name',
        rotation: new THREE.Vector3( 0, Math.PI/2, 0 ),
        alliance: 'alliance'
      });

      var bot = new s.Bot({
        game: s.game,
        shipClass: 'human_ship_heavy',
        position: [22498, -25902, 24976],
        rotation: [0, Math.PI / 2, 0],
        alliance: 'enemy'
      });

      specs(bot);
      done();
    }, 1000);
  };

  it('should create new Bot instance', function (done) {
    var specs = function (bot) {
      expect(bot).to.be.an('object');
      expect(bot.isBot).to.equal(true);
    };

    makeBot(specs, done);
  });

  it('should increment bot counter', function (done) {
    var specs = function (bot) {
      // Expect 2 because the spec share the same game object
      // Previous test add the first one
      expect(s.game.botCount).to.equal(2);
    };

    makeBot(specs, done);
  });

  it('should get enemies list', function (done) {
    var specs = function (bot) {
      expect(bot.getEnemyList).to.be.an('function');
      expect(bot.botEnemyList).to.equal(undefined);
      bot.getEnemyList();
      expect(bot.botEnemyList).to.be.an('array');
      expect(bot.botEnemyList.length).to.equal(1);
      expect(bot.botEnemyList[0].name).to.equal('Player name');
    };

    makeBot(specs, done);
  });

});











