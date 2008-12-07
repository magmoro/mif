/*
Mif.TreeGrid
*/


function $mix(original, extended){
	for (var key in (extended || {})) {
		if(original[key]==undefined){
			original[key] = extended[key];
		}
	}
	return original;
};

if(!Mif) var Mif={};

Mif.TreeGrid = new Class({

	Implements: [new Events, new Options],
		
	options:{
		types: {},
		forest: false,
		animateScroll: true,
		animateToggle: true,
		expandTo: true,
		height: Fx.CSS.prototype.search('.mif-treegrid-wrapper')['line-height'],
		lightType: 'node',
		colWidth: 200
	},
	
	initialize: function(options) {
		this.setOptions(options);
		$extend(this, {
			types: this.options.types,
			forest: this.options.forest,
			animateScroll: this.options.animateScroll,
			height: this.options.height,
			dfltType: this.options.dfltType,
			lightType: this.options.lightType,// node - highlight icon and node, row - highlight row
			UID: 0,
			key: {},
			expanded: []
		});
		this.defaults={
			name: '',
			cls: '',
			openIcon: 'mif-tree-empty-icon',
			closeIcon: 'mif-tree-empty-icon',
			loadable: false,
			open: false,
			hoverClass: 'mif-treegrid-hover',
			selectClass: 'mif-treegrid-selected'
		};
		this.updateOpenState();
		if(this.options.expandTo) this.initExpandTo();
		Mif.TreeGrid.UID++;
		this.DOMidPrefix='mif-tree-';
		//this.wrapper=new Element('div').addClass('mif-tree-wrapper').injectInside(this.container);
		this.container=new Element('div', {'class': 'mif-treegrid-container'}).inject(this.options.container);
		this.container.set('html', '<table><tbody><tr><td></td></tr></tbody></table>').getFirst().addClass('mif-treegrid-wrapper');
		this.wrapper=this.container.getElement('td');
		Mif.TreeGrid.Draw.structure(this);
		this.initEvents();
		this.initScroll();
		this.initSelection();
		this.initHover();
		
	},
	
	initEvents: function(){
		this.body.addEvents({
			mousemove: this.mouse.bindWithEvent(this),
			mouseover: this.mouse.bindWithEvent(this),
			mouseout: this.mouse.bindWithEvent(this),
			mouseleave: this.mouseleave.bind(this),
			mousedown: $lambda(false),
			click: this.toggleClick.bindWithEvent(this),
			dblclick: this.toggleDblclick.bindWithEvent(this),
			keydown: this.keyDown.bindWithEvent(this),
			keyup: this.keyUp.bindWithEvent(this)
		});
		if(Browser.Engine.trident){
			this.wrapper.addEvent('selectstart', $lambda(false));
		}
	},
	
	$getIndex: function(){//set array of visible nodes.
		this.$index=[];
		var node=this.forest ? this.root.getFirst() : this.root;
		do{
			this.$index.push(node);
		}while(node=node.getNextVisible());
		return this;
	},
	
	mouseleave: function(){
		this.mouse.coords={x:null,y:null};
		this.mouse.target=false;
		this.mouse.node=false;
		if(this.hover) this.hover();
	},
	
	mouse: function(event){
		this.mouse.coords=this.getCoords(event);
		var target=this.getTarget(event);
		this.mouse.target=target.target;
		this.mouse.node	= target.node;
	},
	
	getTarget: function(event){
		var target=event.target, node, test=false;
		while(target && target!=this.body){
			test=target.className.match(/mif-treegrid-(gadjet)-[^n]|mif-treegrid-(icon)|mif-treegrid-(name)|mif-treegrid-(checkbox)|mif-treegrid-(row)/);
			if(test) break;
			target=target.parentNode;
		}
		
		if(!test){
			var y=this.mouse.coords.y;
			if(y==-1||!this.$index) {
				node=false;
			}else{
				node=this.$index[((y)/this.height).toInt()];
			}
			return {
				node: node,
				target: 'row'
			};
		}
		for(var i=5;i>0;i--){
			if(test[i]){
				var type=test[i];
				break;
			}
		}
		return {
			node: Mif.TreeGrid.Nodes[target.getAttribute('uid')],
			target: type
		};
	},
	
	getCoords: function(event){
		var position=this.body.getPosition();
		var x=event.page.x-position.x;
		var y=event.page.y-position.y;
		var body=this.body;
		if((y-body.scrollTop>body.clientHeight)||(x-body.scrollLeft>body.clientWidth)){//scroll line
			y=-1;
		};
		return {x:x, y:y};
	},
	
	keyDown: function(event){
		this.key=event;
		this.key.state='down';
	},
	
	keyUp: function(event){
		this.key={};
		this.key.state='up';
	},
	
	toggleDblclick: function(event){
		var target=this.mouse.target;
		if(!target) return;
		this.mouse.node.toggle();
	},
	
	toggleClick: function(event){
		if(this.mouse.target!='gadjet') return;
		this.mouse.node.toggle();
	},
	
	initScroll: function(){
		this.scroll=new Fx.Scroll(this.container);
	},
	
	scrollTo: function(node){
		var position=node.getVisiblePosition();
		var top=position*this.height;
		var up=top<this.container.scrollTop;
		var down=top>(this.container.scrollTop+this.container.clientHeight);
		if(position==-1 || ( !up && !down ) ) {
			this.scroll.fireEvent('complete');
			return false;
		}
		if(this.animateScroll){
			this.scroll.start(this.container.scrollLeft, top-(down ? this.container.clientHeight-this.height : 0));
		}else{
			this.scroll.set(this.container.scrollLeft, top-(down ? this.container.clientHeight-this.height : 0));
			this.scroll.fireEvent('complete');
		}
	},
	
	updateOpenState: function(){
		this.addEvents({
			'drawChildren': function(parent){
				var children=parent.children;
				for(var i=0, l=children.length; i<l; i++){
					children[i].updateOpenState();
				}
			},
			'drawRoot': function(){
				this.root.updateOpenState();
			}
		});
	},
	
	expandTo: function(node){
		if (!node) return this;
		var path = [];
		while( !node.isRoot() && !(this.forest && node.getParent().isRoot()) ){
			node=node.getParent();
			if(!node) break;
			path.unshift(node);
		};
		path.each(function(el){
			el.toggle(true)
		});
		return this;
	},
	
	initExpandTo: function(){
		this.addEvent('loadChildren', function(parent){
			if(!parent) return;
			var children=parent.children;
			for( var i=children.length; i--; ){
				var child=children[i];
				if(child.expandTo) this.expanded.push(child);
			}
		});
		function expand(){
			this.expanded.each(function(node){
				this.expandTo(node);
			}, this);
			this.expanded=[];
		};
		this.addEvents({
			'load': expand.bind(this),
			'loadNode': expand.bind(this)
		});
	}
	
});
Mif.TreeGrid.UID=0;

Mif.TreeGrid.version='1.1dev';