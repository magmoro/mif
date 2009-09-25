var Mif={version:'0.1dev'};

window.addEvent('domready', function(){
	$(document.body).addClass('mif-browser-'+Browser.Engine.name);
});

Element.implement({

	reinject: function(){
		var parent=this.getParent();
		if(parent) {
			var previous=this.getPrevious();
			this.dispose();
			previous ? this.inject(previous, 'after') : this.inject(parent);
		}
		return this;
	},
	
	setContent: function(content){
		alert(content);
		return (typeof content == 'string') ? this.set('html', content) : this.adopt(content);
	}

});

Event.Keys.extend({
	'pgdown': 34,
	'pgup': 33,
	'home': 36,
	'end': 35
});

Mif.ids={};

Mif.$=function(id){
	return Mif.ids[id];
}