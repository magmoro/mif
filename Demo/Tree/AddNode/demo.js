window.addEvent('domready',function(){
	SimpleTree = new Mif.Tree({
		container: $('tree_container'),
		types: {
			folder:{
				openIcon: 'mif-tree-open-icon',
				closeIcon: 'mif-tree-close-icon'
			}
		},
		dfltType:'folder'
	})
	.load({
		url: 'assets/files/simpleTree.json'
	})
	.addEvent('load', function(){
		this.root.recursive(function(){
			this.toggle();
		});
		this.select(this.root);
	});
	
	
	$('add_node').addEvent('click', function(){
		var current=SimpleTree.selected;
		SimpleTree.add({name: $('node_name').value}, current, $('where').getElement(':selected').innerHTML);
		return false;
	});
	
});