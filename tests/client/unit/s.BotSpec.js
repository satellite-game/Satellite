describe('Bot class', function () {

  var makePlayer = function (name) {
    return new s.Player({
      game: s.game,
      shipClass: 'human_ship_heavy',
      position: new THREE.Vector3(23498, -25902, 24976),
      name: name,
      rotation: new THREE.Vector3( 0, Math.PI/2, 0 ),
      alliance: 'alliance'
    });
  };

  var makeBot = function () {
    return new s.Bot({
      game: s.game,
      shipClass: 'human_ship_heavy',
      position: [22498, -25902, 24976],
      rotation: [0, Math.PI / 2, 0],
      alliance: 'enemy'
    });
  };

  var runSpecs = function (specs, done) {
    setTimeout(function () {
      s.game.player = makePlayer('Player one');
      var bot = makeBot();

      specs(bot);
      done();
    }, 1000);
  };

  it('should create new Bot instance', function (done) {
    var specs = function (bot) {
      expect(bot).to.be.an('object');
      expect(bot.isBot).to.equal(true);
    };

    runSpecs(specs, done);
  });

  it('should increment bot counter', function (done) {
    var specs = function (bot) {
      // Expect 2 because the spec share the same game object
      // Previous test add the first one
      expect(s.game.botCount).to.equal(2);
    };

    runSpecs(specs, done);
  });

  it('should have botOptions property with default values', function (done) {
    var specs = function (bot) {
      expect(bot.botOptions).to.be.an('object');
      expect(bot.botOptions).to.have.property('rotationSpeed').and.to.not.equal(undefined);
      expect(bot.botOptions).to.have.property('pitchSpeed').and.to.not.equal(undefined);
      expect(bot.botOptions).to.have.property('yawSpeed').and.to.not.equal(undefined);
      expect(bot.botOptions).to.have.property('thrustImpulse').and.to.not.equal(undefined);
      expect(bot.botOptions).to.have.property('brakePower').and.to.not.equal(undefined);
      expect(bot.botOptions).to.have.property('velocityFadeFactor').and.to.not.equal(undefined);
      expect(bot.botOptions).to.have.property('rotationFadeFactor').and.to.not.equal(undefined);
    };

    runSpecs(specs, done);
  });

  describe('handle enemies', function () {
    it('should get enemies list', function (done) {
      var specs = function (bot) {
        expect(bot.getEnemyList).to.be.an('function');
        expect(bot.botEnemyList).to.equal(undefined);

        var player2 = makePlayer('Player two');
        s.game.enemies._list.push(player2);
        s.game.enemies._map[player2.name] = player2;

        bot.getEnemyList();

        expect(bot.botEnemyList).to.be.an('array');
        expect(bot.botEnemyList.length).to.equal(2);
        expect(bot.botEnemyList[0].name).to.equal('Player one');
        expect(bot.botEnemyList[1].name).to.equal('Player two');
      };

      runSpecs(specs, done);
    });

    it('should get closest enemy distance', function (done) {
      var specs = function (bot) {
        bot.getEnemyList();

        expect(bot.getClosestDistance).to.be.an('function');
        expect(bot.closestDistance).to.equal(undefined);
        bot.getClosestDistance();
        expect(bot.closestDistance).to.not.equal(undefined).and.to.not.equal(null);
      };

      runSpecs(specs, done);
    });
  });


});











