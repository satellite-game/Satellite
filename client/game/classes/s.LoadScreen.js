s.LoadScreen = new Class( {

	construct: function(){
		console.log('create load screen');
		this.el = $('<div class="load_screen">' +
						'<section class="main">' +
                            '<h1 class="message">initializing game</h1>'+
							'<div class="track"><i class="bar"></i></div>' +
						'</section>' +
					'</div>');
        this.el.appendTo('body');
        this.message = $('.message');
	},

	remove: function(){
		console.log('remove load screen');
		this.el.hide();
	},

    setMessage: function(text){
        this.message.html(text);
    }
} );
