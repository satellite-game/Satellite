/*
Satellite
Copyright (C) 2013 Larry Davis
*/

var s = {
    config: {
        weapons: {
            bullets: {
                color: {
                    alliance: 'blue',
                    rebels: 'red'
                },
                damage: 10,
                velocity: 8000
            }
        }
    },

	init: function() {
		console.log('Satellite starting...');

		// Create a projector for 2D <-> 3D calculations
		s.projector = new THREE.Projector();

		// Create a model loader
		s.loader = new THREE.JSONLoader();

		// Create game
		s.game = new s.SatelliteGame();
	}
};
