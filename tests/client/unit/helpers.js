beforeEach(function () {
  makeDistanceStub = function (bot, distance) {
    return sinon.stub(bot, 'getClosestDistance', function () {
      bot.closestDistance = distance;
      bot.target = bot.botEnemyList[0];
    });
  };

  makeGetEnemyPositionsStub = function (bot, x, y, z) {
    return sinon.stub(bot, 'getEnemyPositions', function () {
      bot.target = bot.target.root;
      bot.moveStates.vTarget3D = bot.target.position.clone();
      bot.moveStates.vTarget2D = s.projector.projectVector(bot.moveStates.vTarget3D, bot.camera);
      bot.moveStates.vTarget2D.x = x;
      bot.moveStates.vTarget2D.y = y;
      bot.moveStates.vTarget2D.z = z;
    });
  };

  makePlayer = function (name) {
    return new s.Player({
      game: s.game,
      shipClass: 'human_ship_heavy',
      position: new THREE.Vector3(23498, -25902, 24976),
      name: name,
      rotation: new THREE.Vector3( 0, Math.PI/2, 0 ),
      alliance: 'alliance'
    });
  };

  makeBot = function () {
    return new s.Bot({
      game: s.game,
      shipClass: 'human_ship_heavy',
      position: [22498, -25902, 24976],
      rotation: [0, Math.PI / 2, 0],
      alliance: 'enemy'
    });
  };

  runSpecs = function (specs, done) {
    setTimeout(function () {
      s.game.player = makePlayer('Player one');
      var bot = makeBot();
      specs(bot);
      done();
    }, 400);
  };
});