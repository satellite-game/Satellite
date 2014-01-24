describe('mocha tests with chai', function(){

  it('should expose the Chai assert method', function(){
      assert.ok('everything', 'everything is ok');
  });

  it('should expose the Chai expect method', function(){
      expect('foo').to.not.equal('bar');
  });

});
