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
  var recurse = function(){
    if(max > this._maxDepth) {
    	return;
    }
    var mid = findMidPoint(sector);
    // split into fours and push it into children
    // increase depth
    // call recurse on each child . 
  };
  recurse();
}
oct.prototype.nearest = function() {

};

oct.prototype.contains = function( pak ) { 

};

oct.prototype.search = function( min, max ) { // shrink or expand
 // same as
};


var cube = function( min, max, quadrant) {
	 this.minmax = [min, max];
   this._node = [];
   this._children =[];
};

module.exports = rtree;