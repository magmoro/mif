/*
Mif.TreeGrid.Drag.Element.js
*/
Mif.TreeGrid.Drag.Element=new Class({

	Implements: [Options, Events],

	initialize: function(element, options){
		
		this.element=$(element);
		
		this.setOptions(options);
		
	},
	
	getElement: function(){
		return this.element;
	},
	
	onleave: function(){
		this.where='notAllowed';
		Mif.TreeGrid.Drag.ghost.firstChild.className='mif-tree-ghost-icon mif-tree-ghost-'+this.where;
	},
	
	onenter: function(){
		this.where='inside';
		Mif.TreeGrid.Drag.ghost.firstChild.className='mif-tree-ghost-icon mif-tree-ghost-'+this.where;
	},
	
	drop: function(){
		Mif.TreeGrid.Drag.ghost.dispose();
		this.fireEvent('drop', Mif.TreeGrid.Drag.current);
	}
	

});
