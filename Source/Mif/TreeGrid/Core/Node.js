/*
Mif.TreeGrid.Node
*/
Mif.TreeGrid.Node = new Class({

	$family: {name: 'mif:tree:node'},

	Implements: [Events],
	
	initialize: function(structure, options) {
		$extend(this, structure);
		$extend(this.property={}, options);
		this.children=[];
		this.$calculate();
		
		this.UID=Mif.TreeGrid.Node.UID++;
		Mif.TreeGrid.Nodes[this.UID]=this;
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
		if(what=='row') return node.getParent().getParent();
		if(what=='children') return node.getParent().getParent().getNext();
		return wrapper.getElement('.mif-treegrid-'+what);
	},
	
	getGadjetType: function(){
		return (this.property.loadable && !this.isLoaded()) ? 'plus' : (this.hasChildren() ? (this.isOpen() ? 'minus' : 'plus') : 'none');
	},
	
	toggle: function(state, animate) {
		if(this.property.open==state || this.$loading) return;
		animate=$pick(animate, this.property.animateToggle, this.tree.options.animateToggle);
		var tree=this.tree;
		var parent=this.getParent();
		if(parent && parent.$toggling && animate){	
			var self=this;
			function toggle_child(){
				self.toggle(state, animate);
				tree.removeEvent('toggle', toggle_child);
			}
			tree.addEvent('toggle', toggle_child);
			return this;
		}
		
		if(this.property.loadable && !this.property.loaded) {
			var load=function(){
                this.toggle();
                this.removeEvent('load', load);
            }.bind(this);
            this.addEvent('load',load);
            this.load();
            return;
		}
		if(!this.hasChildren()) {
			this.fireEvent('toggle');
			return;
		}
		this.$toggling=true;
		this.property.open = !this.property.open;
		//Mif.TreeGrid.Draw.update(this);
		if(!this.$draw) Mif.TreeGrid.Draw.children(this);	
		var self=this;
		function complete(){
			self.$toggling=false;
			Mif.TreeGrid.Draw.update(self).tree.$getIndex().fireEvent('toggle', [self, self.property.open]);
			self.fireEvent('toggle');
		}
		
		if(!animate){
			complete();
			return this;
		}
		if(!this.slide){
			var children=this.getDOM('children');
			
			this.slide=new Fx.Slide(children, {
				link: 'cancel',
				onComplete: function(){
					this.completing=false;
					children.setStyle('display', self.isOpen() ? 'block' : 'none').store('margin-top', children.getStyle('margin-top'));
					//UNWRAP
					var wrapper=this.wrapper;
					children.inject(wrapper, 'before');
					wrapper.dispose();
					//UNWRAP
					if(Browser.Engine.gecko) self.tree.container.getFirst().reinject();
					complete();
				},
				onBeforeStart: function(){
					if(this.completing) return;
					this.completing=true;
					var el=this.element;
					var margin=el.retrieve('margin-top');
					if(margin) el.setStyle('margin-top', margin);
					el.style.display='block';
					var wrapper=this.wrapper;
					wrapper.style.position='relative';
					this.offset=el.offsetHeight;
					if(this.open) wrapper.setStyle('height', this.offset);
					//WRAP
					if(children.parentNode!=wrapper){
						wrapper.inject(children, 'after');
						children.inject(wrapper);//WRAP
					}else if(Browser.Engine.gecko){//fix ff bug
						wrapper.reinject();
					}
				},
				duration: 250,
				fps: 50
			});
			this.isOpen() ? this.slide.hide() : this.slide.show();
		}
		this.slide.start(this.isOpen() ? 'in' : 'out');
		return this;
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
		Mif.TreeGrid.Draw.update(this);
		return this;
	},

	removeType: function(type){
		this.property.type.erase(type);
		this.$calculate();
		Mif.TreeGrid.Draw.update(this);
		return this;
	},
	
	set: function(props){
		this.tree.fireEvent('beforeSet', [this]);
		$extend(this, props);
		this.$calculate();
		Mif.TreeGrid.Draw.update(this);
		this.tree.fireEvent('set', [this, props]);
	},
	
	get: function(property){
		return this.property[property];
	},
	
	updateOpenState: function(){
		if(this.property.open){
			this.property.open=false;
			Mif.TreeGrid.Draw.update(this);
			this.toggle(true);
		}
	}
	
});

Mif.TreeGrid.Node.UID=0;
Mif.TreeGrid.Nodes={};