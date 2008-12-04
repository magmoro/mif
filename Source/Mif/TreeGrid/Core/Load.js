/*
Mif.TreeGrid.Load
*/
Mif.TreeGrid.Load={
		
	children: function(children, parent, tree){
		for( var i=children.length; i--; ){
			var child=children[i];
			var subChildren=child.children;
			var node=new Mif.TreeGrid.Node({tree:tree, parentNode: parent}, child);
			if( tree.forest || parent != undefined){
				parent.children.unshift(node);
			}else{
				tree.root=node;
			}
			if(subChildren && subChildren.length){
				arguments.callee(subChildren, node, tree);
			}
		}
		if(parent) parent.property.loaded=true;
		tree.fireEvent('loadChildren', parent);
	}
	
};

Mif.TreeGrid.implement({

	load: function(options){
		var tree=this;
		this.loadOptions=this.loadOptions||$lambda({});
		function success(json){
			if(tree.forest){
				tree.root=new Mif.TreeGrid.Node({
					tree: tree,
					parentNode: null
				});
				var parent=tree.root;
			}else{
				var parent=null;
			}
			Mif.TreeGrid.Load.children(json, parent, tree);
			Mif.TreeGrid.Draw[tree.forest ? 'forestRoot' : 'root'](tree);
			tree.$getIndex();
			tree.fireEvent('load');
			return tree;
		}
		options=$extend($extend({
			isSuccess: $lambda(true),
			secure: true,
			onSuccess: success,
			method: 'get'
		}, this.loadOptions()), options);
		if(options.json) return success(options.json);
		new Request.JSON(options).send();
		return this;
	}
	
});

Mif.TreeGrid.Node.implement({
	
	load: function(options){
		this.$loading=true;
		options=options||{};
		this.addType('loader');
		var self=this;
		function success(json){
			Mif.TreeGrid.Load.children(json, self, self.tree);
			delete self.$loading;
			self.property.loaded=true;
			self.removeType('loader');
			self.fireEvent('load');
			self.tree.fireEvent('loadNode', self);
			return self;
		}
		options=$extend($extend($extend({
			isSuccess: $lambda(true),
			secure: true,
			onSuccess: success,
			method: 'get'
		}, this.tree.loadOptions(this)), this.loadOptions), options);
		if(options.json) return success(options.json);
		new Request.JSON(options).send();
		return this;
	}
	
});
