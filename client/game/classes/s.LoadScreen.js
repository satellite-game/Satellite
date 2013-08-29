s.LoadScreen = new Class( {

	construct: function(){
		console.log('create load screen');
		this.el = $('<div class="load_screen">' +
						'<section class="main">' +
							'<div class="spinner"></div>' +
							'<h1>loading...</h1>'+
						'</section>' +
					'</div>');
        this.el.appendTo('body');
	},

	remove: function(){
		console.log('remove load screen');
		this.el.hide();
	}
} );
