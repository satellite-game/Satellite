s.util = {};

Math.toDegrees = function(radians) {
	return radians * 180/Math.PI;
};

Math.toRadians = function(degrees) {
	return degrees * Math.PI/180;
};

/**
	Load models
	
	@param {Object} options  Options object
	@param {Array} models  Array of model names to load
	@param {Function} complete  Function to call when loading is complete
	@param {Function} progress  Function to call when model is loaded
*/
s.util.loadModels = function(options) {
	var toLoad = options.models.length;

	// Hold models
	var models = {};

	var loaded = function(name, geometry, materials) {
		// Store model and materials
		models[name] = {
			geometry: geometry,
			materials: materials
		};
		
		// Track progress
		toLoad--;
		if (toLoad === 0) {
			console.log('Models loaded!');
			if (typeof options.complete === 'function')
				options.complete(models);
		}
		else {
			var pct = (options.models.length-toLoad)/options.models.length*100;

			console.log('Loading models: '+pct.toFixed(0)+'%');
			if (typeof options.progress === 'function')
				options.progress(pct, models[name]);
		}
	};
	
	options.models.forEach(function(name, index) {
		s.loader.load('game/models/'+name+'.json', loaded.bind(null, name));
	});
};

/**
	Get 3D coordinates of a 2D point
	
	@param {Number} x  2D x coordinate
	@param {Number} y  2D y coordinate
	@param {Number} width  Width of canvas
	@param {Number} height  Height of canvas
	@param {THREE.PerspectiveCamera} camera  three.js camera instance
*/
s.util.get3DCoords = function(x, y, width, height, camera) {
	// Convert to normalized device coordinates
	var ndc = s.util.getNDC(x, y, width, height);
	
	var startVector = new THREE.Vector3();
	var endVector = new THREE.Vector3();
	var dirVector = new THREE.Vector3();
	var goalVector = new THREE.Vector3();
	var t;
	
	// Create vectors above and below ground plane at our NDCs
	startVector.set(ndc.x, ndc.y, -1.0);
	endVector.set(ndc.x, ndc.y, 1.0);
	
	// Convert back to 3D world coordinates
	startVector = s.projector.unprojectVector(startVector, camera);
	endVector = s.projector.unprojectVector(endVector, camera);
	
	// Get direction from startVector to endVector
	dirVector.subVectors(endVector, startVector);
	dirVector.normalize();
	
	// Find intersection where y = 0
	t = startVector.y / -(dirVector.y);

	// Find goal point
	goalVector.set(
		startVector.x + t * dirVector.x,
		startVector.y + t * dirVector.y,
		startVector.z + t * dirVector.z
	);
	
	return goalVector;
};

/**
	Create a ray between two points
	
	@param {THREE.Vector3} pointA  Start point
	@param {THREE.Vector3} pointB  End point
*/
s.util.createRay = function(pointA, pointB) {
	var rayStart = pointA;
	var rayDirection = new THREE.Vector3();
	rayDirection.subVectors(pointB, pointA).normalize();
	
	return new THREE.Raycaster(rayStart, rayDirection);
};

/**
	Get the normalized device coordinate 
	
	@param {Number} x  2D x coordinate
	@param {Number} y  2D y coordinate
	@param {Number} width  Width of canvas
	@param {Number} height  Height of canvas
*/
s.util.getNDC = function(x, y, width, height) {
	return {
		x: (x / width) * 2 - 1,
		y: -(y / height) * 2 + 1
	};
};

/**
	Get 2D coordinates from a Vector3
	
	@param {THREE.Vector3} objVector  Vector representing the object position
	@param {Number} width  Width of canvas
	@param {Number} height  Height of canvas
*/
s.util.get2DCoords = function(objVector, width, height) {
	var vector3D = objVector.clone();
	
	var vector2D = this.projector.projectVector(vector3D, this.camera);
	
	vector2D.y = -(vector2D.y*height - height)/2;
	vector2D.x = (vector2D.x*width + width)/2;
	
	return vector2D;
};
