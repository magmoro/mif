var Mif={version:'0.1dev'}

window.addEvent('domready', function(){
	$(document.body).addClass('mif-browser-'+Browser.Engine.name);
});

Element.implement({

	reinject: function(){
		var parent=this.getParent();
		if(parent) this.dispose().inject(parent);
		return this;
	}

});