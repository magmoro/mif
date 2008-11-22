Mif.Tree.Highlight=new Class({
	
	initialize: function(tree){
		this.tree=tree;
		this.tree.highlight=this;
		this.type=this.tree.lightType;
		tree.container.addClass('mif-tree-light-'+this.type);
		
		if(!Browser.Engine.trident){
			this.initScrollWrapper();
		}
		
		this.node={};
		this.light={};
		
		this.initLight('selected');
		this.initLight('dragged');
		this.initLight('');
		
		if(!Browser.Engine.trident){
			this.setScrollWrapper();
			
			tree.addEvent('toggle', this.setScrollWrapper.bind(this));
			
			tree.addEvent('updateNode', function(){
				this.setScrollWrapper();
			}.bind(this));
			
		}
		tree.wrapper.addEvent('scroll', function(){
			['selected', 'dragged', 'default'].each(function(type){
				this.setLight(this.node[type], type);
			}, this);
		}.bind(this));
		
		
		tree.addEvent('hover', function(node, target, state){
			//if(!(target=='name'||target=='icon')) return;
			var condition=tree.lightType=='node' ? (tree.hoverState.icon || tree.hoverState.name) : tree.hoverState.node;
			if(  !( condition )  ){
				//console.log('rem');
				this.removeLight('default');
			}else{
				this.setLight(node, 'default');
			}
		}.bind(this));
		
		
		
		
		tree.addEvent('select', function(node){
			this.setLight(node, 'selected');
		}.bind(this));
		
		tree.addEvent('toggle', function(node){
			var selected=tree.getSelected();
			if(!selected) return;
			if(selected.getVisiblePosition()!=-1){
				this.setLight(selected, 'selected');
			}else{
				this.removeLight('selected');
			}
		}.bind(this));
		
		
		tree.drag.addEvent('start', function(){
			this.setLight(this.tree.drag.current, 'dragged');
		}.bind(this));
		
		tree.drag.addEvent('complete', function(){
			this.removeLight('dragged');
		}.bind(this));
		
		
		tree.addEvent('remove', function(){
			['selected', 'dragged', 'default'].each(function(type){
				this.removeLight(type);
			}, this);
			if(!Browser.Engine.trident){
				this.setScrollWrapper();
			}
		}.bind(this));
		
		
	},
	
	initScrollWrapper: function(){
		this.scrollWrapper={};
		this.rasporka={};
		['selected', 'dragged', 'default'].each(function(type){
			this.scrollWrapper[type]=new Element('div').setStyles({
				position: 'absolute',
				overflow: 'hidden'
			}).inject(this.tree.container, 'top');
		
			this.rasporka[type]=new Element('div').setStyles({
				position: 'absolute'
			}).inject(this.scrollWrapper[type]);
			
			this.tree.container.setStyle('overflow', 'hidden');
		}, this);
	},
	
	setScrollWrapper: function(){
		['selected', 'dragged', 'default'].each(function(type){
			this.scrollWrapper[type].setStyles({
				width: this.tree.wrapper.scrollWidth,
				height: this.tree.wrapper.scrollHeight
			});
		
			this.rasporka[type].setStyles({
				width:2*this.tree.wrapper.scrollWidth+500,
				height: this.tree.wrapper.scrollHeight*2+this.tree.height,
				left:0,
				top:0
			});
			
			this.light[type].setStyles({'top': this.tree.wrapper.scrollHeight, 'left': this.tree.wrapper.scrollWidth});
			
			if(this.node[type]) this.setLight(this.node[type], type);
		}, this);
	},
	
	initLight: function(type){
		type=type||'default';
		
		var light=new Element('div', {'class': 'mif-tree-light' + (type!='default' ? ('-'+type) : '')});
		if(!Browser.Engine.trident){
			light.inject(this.scrollWrapper[type]);
		}else{
			light.inject(this.tree.wrapper, 'top')
		}
		this.light[type]=light;
		
		var left=new Element('div', {'class': 'mif-tree-light-left' + (type!='default' ? ('-'+type) : '')});
		var right=new Element('div', {'class': 'mif-tree-light-right' + (type!='default' ? ('-'+type) : '')});
		
		light.adopt(left, right);
	},
	
	setLight: function(node, type){
		if(!node) return;
		var tree=this.tree;
		
		var left=0;
		if(this.type=='node'){
			el=node.getDOM('wrapper');
			while(el && el!=tree.wrapper){
				left+=el.offsetLeft;
				el=el.offsetParent;
			}
			left+=node.getDOM('gadjet').offsetWidth;
		}else{
			left+=tree.wrapper.scrollLeft;
		}
		var icon=node.getDOM('icon');
		var name=node.getDOM('name');
		var width=this.type=='node' ? name.offsetLeft-icon.offsetLeft+name.offsetWidth : tree.wrapper.clientWidth;
		if(!Browser.Engine.trident){
			left=left-tree.wrapper.scrollLeft;
			this.scrollWrapper[type].scrollTop=tree.wrapper.scrollHeight-node.getVisiblePosition()*tree.height+tree.wrapper.scrollTop;
			this.scrollWrapper[type].scrollLeft=tree.wrapper.scrollWidth-left
		}else{
			this.light[type].setStyles({
				top: node.getVisiblePosition()*tree.height,
				left: left
			});
		}
		this.light[type].setStyles({
			width: width
		});
		this.node[type]=node;
	},
	
	removeLight: function(type){
		if(!this.node[type]) return;
		this.light[type].setStyle('width', 0);
		this.node[type]=false;
	}

});