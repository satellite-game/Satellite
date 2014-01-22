var oct = function( dimensions, maxDepth ) { // should be an object that is x y z - default will be 30k or an array. Sigh.
  this._tree = dimensions || [ 30000, 30000,30000 ];
  this._maxDepth = maxDepth || 1;
  this._children = [];
};


oct.prototype = Object.create({});

oct.prototype.insert = function( obj ) { 
// given the right x-y-z  move the object into the correct node

};


oct.prototype.makeTree= function( ) {
	var x = {};
	x.q1 = new cube( [(this._tree[0]/4), (this._tree[1]/4), (this._tree[2]/4)], [0,0,0] );
	x.q2 = new cube( [(this._tree[0]/4 * -1), (this._tree[1]/4), (this._tree[2]/4)], [0,0,0] );
	x.q3 = new cube( [(this._tree[0]/4 * -1), (this._tree[1]/4 * -1), (this._tree[2]/4 * -1)] , [0,0,0]);
	x.q4 = new cube( [(this._tree[0]/4), (this._tree[1]/4 * -1), (this._tree[2]/4 )], [0,0,0] );
	x.q5 = new cube( [(this._tree[0]/4), (this._tree[1]/4), (this._tree[2]/4) * -1], [0,0,0] );
	x.q6 = new cube( [(this._tree[0]/4 * -1 ), (this._tree[1]/4), (this._tree[2]/4) * -1 ], [0,0,0] );
	x.q7 = new cube( [(this._tree[0]/4) * -1, (this._tree[1]/4 * -1), (this._tree[2]/4) * -1], [0,0,0] );
	x.q8 = new cube( [(this._tree[0]/4), (this._tree[1]/4 * -1), (this._tree[2]/4 * -1)],  [0,0,0]);

	for(var i in x) {
	  this._children.push(x[i]);
	};
  
  for(var z = 0; z < this._children.length) {
  	this.populate(this._children[z]);
  };
};

oct.prototype.populate = function ( sector ) {
	var max = 0;
  var recurse = function( cube ) {
    if(max > this._maxDepth) {
    	return;
    };
    var mid = divideSector(cube);
    for(var i = 0; i < mid.length; i++) {
      sector._children.push(new cube(mid[i][0], mid[i][1]);
    };
    for(var i = 0; i < sector._children) {
      recurse(sector._children[i]);
    };
    max++; 
  };
  recurse( sector );
}
oct.prototype.nearest = function() {

};

oct.prototype.contains = function( pak ) { 

};

oct.prototype.search = function( min, max ) { // shrink or expand
 // same as
};

var divideSector = function( sector ){
  var max = sector.
  var mp = this.minmax[0] / 2;
  var result = [];
  result.push([[sector.minmax[1]],[mp]]); //1
  result.push([[sector.minmax[1]],[mp]]); //2
  result.push([[sector.minmax[1]],[mp]]); //3
  result.push([[sector.minmax[1]],[mp]]); //4
  result.push([[sector.minmax[1]],[mp]]); //5
  result.push([[sector.minmax[1]],[mp]]); //6
  result.push([[sector.minmax[1]],[mp]]); //7
  result.push([[sector.minmax[1]],[mp]]); //8

  return result;

}

var cube = function( max, min, quadrant) {
	 this.minmax = [max, min];
   this._node = [];
   this._children =[];
};

module.exports = rtree;