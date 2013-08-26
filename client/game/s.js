/*
Satellite
Copyright (C) 2013 Larry Davis
*/

var s = {
    config: {
        weapons: {
            turret: {
                color: {
                    alliance: 0x00F2FF,
                    rebels: 0xFF0000
                },
                damage: 10,
                velocity: 2000
            },
            missile: {
                color: {
                    alliance: 'green',
                    rebels: 'red'
                },
                damage: 10,
                velocity: 2000
            }
        },
        ship: {
        hull: 80
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
