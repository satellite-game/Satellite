s.LoadScreen = new Class( {

	construct: function(){
		console.log('create load screen');
		this.el = $('<div class="load_screen">' +
						'<section class="main">' +
							'<div class="spinner"></div>' +
							'<h1>loading...</h1>'+
						'</section>' +
					'</div>');
        this.el.css({
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 101,
            backgroundColor: 'black'
        }).appendTo('body');
	},

	remove: function(){
		console.log('remove load screen');
		this.el.hide();
	}
} );