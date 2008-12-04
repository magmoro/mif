var Mif={version:'0.1dev'}

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
	}

});