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
});
