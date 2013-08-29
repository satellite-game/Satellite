s.LoadScreen = new Class( {

	construct: function(){
		console.log('create load screen');
		this.el = $('<div class="load_screen">' +
						'<section class="main">' +
                            '<h1>loading</h1>'+
							'<div class="track"><i class="bar"></i></div>' +
						'</section>' +
					'</div>');
        this.el.appendTo('body');
	},

	remove: function(){
		console.log('remove load screen');
		this.el.hide();
	}
} );
