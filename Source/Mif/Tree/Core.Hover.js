/*
Mif.Tree.Hover
*/
Mif.Tree.implement({
	
	initHover: function(){
		this.wrapper.addEvent('mousemove', this.hover.bind(this));
		this.wrapper.addEvent('mouseout', this.hover.bind(this));
		this.wrapper.addEvent('mouseover', this.hover.bind(this));
		if(Browser.Engine.gecko){//prevent hover while mouse wheel,
			this.wrapper.addEvent('mousewheel', function(){
				this.wheelTime=$time();
			}.bind(this));
		}
		this.defaultHoverState={
			gadjet: false,
			checkbox: false,
			icon: false,
			name: false,
			node: false
		};
		this.hoverState=$unlink(this.defaultHoverState);
	},
	
	hover: function(){
		if(Browser.Engine.gecko && $time()-this.wheelTime<100) return;
		var cnode=this.mouse.node;
		var ctarget=this.mouse.target;
		this.t=$time();
		$each(this.hoverState, function(node, target, state){
			if(node==cnode && (target=='node'||target==ctarget)) return;
			if(node) {
				Mif.Tree.Hover.out(node, target);
				state[target]=false;
				this.fireEvent('hover', [node, target, 'out']);
			}
			if(cnode && (target=='node'||target==ctarget)) {
				Mif.Tree.Hover.over(cnode, target);
				state[target]=cnode;
				this.fireEvent('hover', [cnode, target, 'over']);
			}else{
				state[target]=false;
			}
		}, this);
		
	},
	
	updateHover: function(){
		this.hoverState=$unlink(this.defaultHoverState);
		this.hover();
	}
	
});

Mif.Tree.Hover={
	
	over: function(node, target){
		if(!node) return;
		var wrapper=node.getDOM('wrapper');
		wrapper.addClass((node.property.hoverClass)+'-'+target);
		if(node.selected) wrapper.addClass((node.property.hoverClass)+'-selected-'+target);
	},
	
	out: function(node, target){
		if(!node) return;
		var wrapper=node.getDOM('wrapper');
		wrapper.removeClass((node.property.hoverClass)+'-'+target).removeClass((node.property.hoverClass)+'-selected-'+target);
	}
	
};
