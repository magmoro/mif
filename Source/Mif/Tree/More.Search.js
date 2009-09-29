/*Mif.Tree.Search*/

Mif.Tree.implement({

	getNode: function(fun, root){
		var nodes=this.getNodes(fun, root, true);
		return nodes ? nodes[0] : false;
	},
	
	getNodes: function(fun, root, one){
		var nodes=[];
		function test(node){
			if(fun(node)==true){
				nodes.push(node);
				if(one) return false;
			}
		}
		this.recursive(test, root);
		return nodes;
	},
	
	recursive: function(fun, root){
		root=root||this.root;
		if(fun(root)==false){
			return false;
		};
		var children=root.children;
		for(var i=0, l=children.length;i<l;i++){
			if(this.recursive(fun, children[i])==false) break;
		}
		return this;
	},
	
	filter: function(fun, root){
		root=root||this.root;
		function filter(node){
			fun(node) ? node.hide() : node.show();
		}
		this.recursive(filter, root);
	}

});
