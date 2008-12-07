/*
Mif.Tree.KeyNav
*/
Mif.Tree.KeyNav=new Class({
	
	initialize: function(tree){
		this.tree=tree;
		var wrapper=tree.wrapper;
		this.bound={
			init: this.init.bind(this),
			attach: this.attach.bind(this),
			detach: this.detach.bind(this)
		}
		tree.addEvents({
			'focus': this.bound.attach,
			'blur': this.bound.detach
		});
	},
	
	attach: function(){
		var event=Browser.Engine.trident||Browser.Engine.webkit ? 'keydown' : 'keypress';
		document.addEvent(event, this.bound.init);
	},
	
	detach: function(){
		var event=Browser.Engine.trident||Browser.Engine.webkit ? 'keydown' : 'keypress';
		document.removeEvent(event, this.bound.init);
	},
	
	init: function(event){
		if(!['down','left','right','up', 'pgup', 'pgdown', 'end', 'home'].contains(event.key)) return;
		var tree=this.tree;
		if(!tree.selected){
			tree.select(tree.forest ? tree.root.getFirst() : tree.root);
		}else{
			var current=tree.selected;
			switch (event.key){
				case 'down': this.goForward(current);event.stop();break;  
				case 'up': this.goBack(current);event.stop();break;   
				case 'left': this.goLeft(current);event.stop();break;
				case 'right': this.goRight(current);event.stop();break;
				case 'home': this.goStart(current);event.stop();break;
				case 'end': this.goEnd(current);event.stop();break;
				case 'pgup': this.goPageUp(current);event.stop();break;
				case 'pgdown': this.goPageDown(current);event.stop();break;
			}
		}
		var height=tree.height;
		/* function autoScroll(){
			var wrapper=tree.wrapper;
			var i=tree.selected.getVisiblePosition();
			var top=i*height-wrapper.scrollTop;
			var bottom=top+height;
			if(top<height){
				wrapper.scrollTop-=height;
			}
			if(wrapper.offsetHeight-bottom<height){
				wrapper.scrollTop+=height;
			}
		}
		autoScroll(); */
		tree.scrollTo(tree.selected);
	},

	goForward: function(current){
		var forward=current.getNextVisible();
		if( forward ) this.tree.select(forward)
	},
	
	goBack: function(current){
		var back=current.getPreviousVisible();
		if (back) this.tree.select(back);
	},
	
	goLeft: function(current){
		if(current.isRoot()){
			if(current.isOpen()){
				current.toggle();
			}else{
				return false;
			}
		}else{
			if( current.hasChildren() && current.isOpen() ){
				current.toggle();
			}else{
				if(current.tree.forest && current.getParent().isRoot()) return false;
				return this.tree.select(current.getParent());
			}
		}
	},
	
	goRight: function(current){
		if(!current.hasChildren()&&!current.loadable){
			return false;
		}else if(!current.isOpen()){
			return current.toggle();
		}else{
			return this.tree.select(current.getFirst());
		}
	},
	
	goStart: function(){
		this.tree.select(tree.$index[0]);
	},
	
	goEnd: function(){
		this.tree.select(tree.$index.getLast());
	},
	
	goPageDown: function(current){
		var tree=this.tree;
		var count=(tree.container.clientHeight/tree.height).toInt()-1;
		var newIndex=Math.min(tree.$index.indexOf(current)+count, tree.$index.length-1);
		tree.select(tree.$index[newIndex]);
	},
	
	goPageUp: function(current){
		var tree=this.tree;
		var count=(tree.container.clientHeight/tree.height).toInt()-1;
		var newIndex=Math.max(tree.$index.indexOf(current)-count, 0);
		tree.select(tree.$index[newIndex]);
	}
});
