/*
Satellite
Copyright (C) 2013 Larry Davis
*/

var s = {
	init: function() {
		console.log('Satellite starting...');
	},
	config: {
		camera: {
			type: 'chase'
		},

		comm: {
			server: 'localhost:3000', // hostname:port (without http://)
			interval: 15
		},

		colors: {
			friend: 0x886A00,
			enemy: 0x880000
		},

		controls: {
			mouse: {
				sensitivity: 8,
				inverted: false
			},
			gamepad: {
				sensitivity: 1.25,
				inverted: true
			}
		},

		sound: {
			enabled: false,
			silentDistance: 1500,
			sounds: {

			}
		},

		models: [

		]
	}
};
