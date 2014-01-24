describe('Bot class', function () {

  beforeEach(function () {
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
    expect(bot).to.be.an('object');
  });
});