describe('Bot class', function () {
  it('should create new Bot instance', function (done) {
    setTimeout(function () {
      var bot = new s.Bot({
        game: s.game,
        name: 'bot 1',
        shipClass: 'human_ship_heavy',
        position: [22498, -25902, 24976],
        rotation: [0, Math.PI / 2, 0],
        alliance: 'enemy'
      });

      expect(bot).to.be.an('object');
      expect(bot.isBot).to.equal(true);

      done();
    }, 1000);
  });

  it('should increment bot counter', function (done) {
    setTimeout(function () {
      var bot = new s.Bot({
        game: s.game,
        shipClass: 'human_ship_heavy',
        position: [22498, -25902, 24976],
        rotation: [0, Math.PI / 2, 0],
        alliance: 'enemy'
      });
      expect(s.game.botCount).to.equal(1);
      done();
    }, 1000);

  });
});