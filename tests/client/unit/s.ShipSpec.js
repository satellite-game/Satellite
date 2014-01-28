describe('Ship class', function () {
  beforeEach(function (done) {
    var createPlayer = function () {
      playerShip = makePlayer('Player ship');
    };

    runAsync(createPlayer, done);
  });

  it('should have options object with default values', function (done) {
    var specs = function () {
      expect(playerShip.options).to.have.property('leftTurretOffset').and.to.not.equal(undefined);
      expect(playerShip.options).to.have.property('rightTurretOffset').and.to.not.equal(undefined);
      expect(playerShip.options).to.have.property('missileOffset').and.to.not.equal(undefined);
      expect(playerShip.options).to.have.property('turretFireTime').and.to.not.equal(undefined);
      expect(playerShip.options).to.have.property('botTurretFireTime').and.to.not.equal(undefined);
      expect(playerShip.options).to.have.property('missileFireTime').and.to.not.equal(undefined);
    };

    runAsync(specs, done);
  });

  it('should initialize ship properties', function (done) {
    var specs = function () {
      expect(playerShip).to.respondTo('initialize');
      expect(playerShip).to.have.property('materials').and.to.not.equal(undefined);
      expect(playerShip).to.have.property('root').and.to.not.equal(undefined);
      expect(playerShip).to.have.property('lastTurretFire').and.to.not.equal(undefined);
      expect(playerShip).to.have.property('lastMissileFire').and.to.not.equal(undefined);
      expect(playerShip).to.have.property('alliance').and.to.equal('alliance');
      expect(playerShip).to.have.property('hull').and.to.not.equal(undefined);
      expect(playerShip).to.have.property('shields').and.to.not.equal(undefined);
      expect(playerShip).to.have.property('lastTime').and.to.not.equal(undefined);
    };

    runAsync(specs, done);
  });

  it('should getOffset positions', function (done) {
    var specs = function () {
      var offSet = playerShip.getOffset(new THREE.Vector3(10, 0, 10));
      expect(offSet).to.be.an('object');
      expect(offSet).to.have.property('x').and.to.not.equal(undefined);
      expect(offSet).to.have.property('y').and.to.not.equal(undefined);
      expect(offSet).to.have.property('z').and.to.not.equal(undefined);
    };

    runAsync(specs, done);
  });

  describe('when fire', function () {
    it('should create a left and right turret', function (done) {
      var specs = function () {
        var spy = sinon.spy(playerShip, 'makeTurret');
        playerShip.fire('turret');
        expect(spy.called).to.equal(true);
      };

      runAsync(specs, done);
    });

    it('should update last turret fire time', function (done) {
      var specs = function () {
        var lastTurretFire = playerShip.lastTurretFire;
        playerShip.fire('turret');
        expect(playerShip.lastTurretFire).to.not.equal(lastTurretFire);
      };

      runAsync(specs, done);
    });

    it('should play laser sound', function (done) {
      var specs = function () {
        var spy = sinon.spy(playerShip.game.sound, 'play');
        playerShip.fire('turret');
        expect(spy.called).to.equal(true);
        spy.restore();
      };

      runAsync(specs, done);
    });

    it('should not play laser sound if it is a bot', function (done) {
      var specs = function () {
        var spy = sinon.spy(s.game.sound, 'play');
        var bot = makeBot();
        bot.fire('turret');
        expect(spy.called).to.equal(false);
        spy.restore();
      };

      runAsync(specs, done);
    });
  });

  describe('when setPosition', function () {
    beforeEach(function (done) {
      var setDefaultValues = function () {
        newPositions = [12, 34, 56];
        newRotations = [0.5, 0.5, 0.5];
        aVeloc = [1, 1, 1];
      };

      runAsync(setDefaultValues, done);
    });

    it('should be able to set its position', function (done) {
      var specs = function () {
        var oldPositionsX = playerShip.root.position.x;
        var oldPositionsY = playerShip.root.position.y;
        var oldPositionsZ = playerShip.root.position.z;

        playerShip.setPosition(newPositions);

        expect(playerShip.root.position.x).to.not.equal(oldPositionsX);
        expect(playerShip.root.position.y).to.not.equal(oldPositionsY);
        expect(playerShip.root.position.z).to.not.equal(oldPositionsZ);
      };

      runAsync(specs, done);
    });

    it('should be able to set its rotation', function (done) {
      var specs = function () {
        var oldX = playerShip.root.rotation.x;
        var oldY = playerShip.root.rotation.y;
        var oldZ = playerShip.root.rotation.z;

        playerShip.setPosition(newPositions, newRotations);

        expect(playerShip.root.rotation.x).to.not.equal(oldX);
        expect(playerShip.root.rotation.y).to.not.equal(oldY);
        expect(playerShip.root.rotation.z).to.not.equal(oldZ);
      };

      runAsync(specs, done);
    });
  });
});
