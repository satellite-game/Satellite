/**
 * Provides observer pattern for basic eventing
 *
 * @class	
 * @extends BaseClass
 */
var EventEmitter = new Class(/** @lends EventEmitter# */{
	/** @constructs */
	construct: function() {
		this._events = {};
	},
	
	/**
	 * Destroy references to events and listeners.
	 */
	destruct: function() {
		delete this._events;
	},
	
	/**
	 * Attach an event listener
	 *
	 * @param {String} evt		Name of event to listen to
	 * @param {Function} func	Function to execute
	 *
	 * @returns {EventEmitter}	this, chainable
	 */
	on: function(evt, func) {
		var listeners = this._events[evt] = this._events[evt] || [];
		listeners.push(func);
		
		return this;
	},

	/**
	 * Remove an event listener
	 *
	 * @param {String} evt		Name of event that function is bound to
	 * @param {Function} func	Bound function
	 *
	 * @returns {EventEmitter}	this, chainable
	 */
	off: function(evt, func) {
		var listeners = this._events[evt];
		if (listeners !== undefined);
			listeners.splice(listeners.indexOf(func), 1);
		
		return this;
	},
	
	/**
	 * Trigger an event
	 *
	 * @param {String} evt		Name of event to trigger
	 * @param {Arguments} args	Additional arguments are passed to the listener functions
	 *
	 * @returns {EventEmitter}	this, chainable
	 */
	trigger: function(evt) {
		var listeners = this._events[evt];
		if (listeners !== undefined) {
			for (var i = 0, n = listeners.length; i < n; i++) {
				listeners[i].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
		
		return this;
	}
});
