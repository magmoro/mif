/*
Mif.Tree.Node
*/
Mif.Tree.Node = new Class({

	$family: {name: 'mif:tree:node'},

	Implements: [Events],
	
	initialize: function(structure, options) {
		$extend(this, structure);
		$extend(this.property={}, options);
		this.children=[];
		this.$calculate();
		
		this.UID=Mif.Tree.Node.UID++;
		Mif.Tree.Nodes[this.UID]=this;
	},
	
	$calculate: function(){
		this.property.type=$splat(this.property.type||this.tree.dfltType);
		this.property.type.each(function(type){
			$mix(this.property, this.tree.types[type]);
		}, this);
		$mix(this.property, $unlink(this.tree.defaults));
	},
	
	getDOM: function(what){
		var node=$(this.tree.DOMidPrefix+this.UID);
		if(what=='node') return node;
		var wrapper=node.getFirst();
		if(what=='wrapper') return wrapper;
		if(what=='children') return wrapper.getNext();
		return wrapper.getElement('.mif-tree-'+what);
	},
	
	getGadjetType: function(){
		return (this.property.loadable && !this.isLoaded()) ? 'plus' : (this.hasChildren() ? (this.isOpen() ? 'minus' : 'plus') : 'none');
	},
	
	toggle: function(state) {
		if(this.property.open==state || this.$loading || this.$toggling) return;
		if(this.property.loadable && !this.property.loaded) {
			var load=function(){
                this.toggle();
                //this.removeEvent('load', load);
            }.bind(this);
            this.addEvent('load',load);
            this.load();
            return;
		}
		if(!this.hasChildren()) return;
		var next=this.getNextVisible();
		this.property.open = !this.property.open;
		state=this.property.open;
		if(!this.$draw) Mif.Tree.Draw.children(this);
		var children=this.getDOM('children');	
		var gadjet=this.getDOM('gadjet');
		var icon=this.getDOM('icon');
		children.style.display=this.isOpen() ? 'block' : 'none';
		gadjet.className='mif-tree-gadjet mif-tree-gadjet-'+this.getGadjetType();
		icon.className='mif-tree-icon '+this.property[this.isOpen() ? 'openIcon' : 'closeIcon'];
		this.tree.hoverState.gadjet=false;
		this.tree.hover();
		this.tree.$getIndex();
		this.tree.fireEvent('toggle', [this, this.property.open]);
	},
	
	recursive: function(fn, args){
		args=$splat(args);
		if(fn.apply(this, args)!==false){
			this.children.each(function(node){
				if(node.recursive(fn, args)===false){
					return false;
				}
			});
		}
		return this;
	},
	
	isOpen: function(){
		return this.property.open;
	},
	
	isLoaded: function(){
		return this.property.loaded;
	},
	
	isLast: function(){
		if(this.parentNode==null || this.parentNode.children.getLast()==this) return true;
		return false;
	},
	
	isFirst: function(){
		if(this.parentNode==null || this.parentNode.children[0]==this) return true;
		return false;
	},
	
	isRoot: function(){
		return this.parentNode==null ? true : false;
	},
	
	getChildren: function(){
		return this.children;
	},
	
	hasChildren: function(){
		return this.children.length ? true : false;
	},
	
	index: function(){
		if( this.isRoot() ) return 0;
		return this.parentNode.children.indexOf(this);
	},
	
	getNext: function(){
		if(this.isLast()) return null;
		return this.parentNode.children[this.index()+1];
	},
	
	getPrevious: function(){
		if( this.isFirst() ) return null;
		return this.parentNode.children[this.index()-1];
	},
	
	getFirst: function(){
		if(!this.hasChildren()) return null;
		return this.children[0];
	},
	
	getLast: function(){
		if(!this.hasChildren()) return null;
		return this.children.getLast();		
	},
	
	getParent: function(){
		return this.parentNode;
	},
	
	getNextVisible: function(){
		var current=this;
		if(current.isRoot()){
			if(!current.isOpen() || !current.hasChildren()) return false;
			return current.getFirst();
		}else{
			if(current.isOpen() && current.getFirst()){
				return current.getFirst();
			}else{
				var parent=current;
				do{
					current=parent.getNext();
					if(current) return current;
				}while( parent=parent.parentNode );
				return false;
			}
		}
	},
	
	getPreviousVisible: function(){
		var current=this;
		if( current.isFirst() && ( !current.parentNode || (current.tree.forest && current.parentNode.isRoot()) ) ){
			return false;
		}else{
			if( current.getPrevious() ){
				current=current.getPrevious();
				while( current.isOpen() && current.getLast() ){
					current=current.getLast();
				}
				return current;
			}else{
				return current.parentNode;
			}
		}
	},
	
	getVisiblePosition: function(){
		return this.tree.$index.indexOf(this);
	},
		
	contains: function(node){
		do{
			if(node==this) return true;
			node=node.parentNode;
		}while(node);
		return false;
	},

	addType: function(type){
		this.property.type.include(type);
		this.$calculate();
		Mif.Tree.Draw.update(this);
		return this;
	},

	removeType: function(type){
		this.property.type.erase(type);
		this.$calculate();
		Mif.Tree.Draw.update(this);
		return this;
	},
	
	set: function(props){
		this.tree.fireEvent('beforeSet', [this]);
		$extend(this, props);
		this.$calculate();
		Mif.Tree.Draw.update(this);
		this.tree.fireEvent('set', [this, props]);
	},
	
	get: function(property){
		return this.property[property];
	},
	
	updateOpenState: function(){
		if(this.property.open){
			this.property.open=false;
			this.toggle();
		}
	}
	
});

Mif.Tree.Node.UID=0;
Mif.Tree.Nodes={};