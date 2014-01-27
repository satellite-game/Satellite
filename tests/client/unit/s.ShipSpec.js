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
});