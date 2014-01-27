/*
Satellite
Copyright (C) 2013 Larry Davis
*/

var s = {
    config: {
        ship: {
            hull: 120,
            shields: 80,
            maxSpeed: 1500
        },
        base: {
            shields: 1000
        },
        sound: {
            enabled: true,
            silentDistance: 10000,
            sounds: {
                laser: "/game/sounds/laser.mp3"
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
