window.addEvent('domready',function(){
	tree = new Mif.Tree({
		initialize: function(){
			//new Mif.Tree.Highlight(this);
			new Mif.Tree.Drag(this);
			var storage=new Mif.Tree.CookieStorage(this);
			this.addEvent('load', function(){
				storage.restore();
			});
		},
		container: $('tree_container'),// tree container
		types: {// node types
			folder:{
				openIcon: 'mif-tree-open-icon',//css class open icon
				closeIcon: 'mif-tree-close-icon'// css class close icon
			}
		},
		dfltType:'folder',//default node type
		height: 19//node height
	});
	
	var json=[
		{
			"name": "root",
			"id" : "root",
			"children": [
				{
					"name": "node11111111111111111111111111111",
					"id": "node1"
				},
				{
					"name": "node2",
					"id": "node2",
					/* "open": true, */
					"children":[
						{
							"name": "node2.1",
							"id": "node2.1",
							/* "open": true, */
							"children": [
								{
									"name": 'some child',
									"id": "some_child",
									"children": [
										{
											"name": 'some child',
											"id": "some_another_child",
											"children": [
												{
													"name": 'some child',
													"id": "some"
												}
											]
										}
									]
								},
								{
									"name": 'some other child',
									"id": "uniq"
								}
							]
						},
						{
							"name": "node2.2",
							"id": "node2.2"
						}
					]
				},
				{
					"name": "node3",
					"id": "node3",
					"children": [
						{
							"name": "node3.1",
							"id": "node3.1",
							"children": [
								{
									"name": 'node3.1.1',
									"id": "node3.1.1"
								}
							]
						}
					]
				}
			]
		}
	];
	
	// load tree from json.
	tree.load({
		json: json
	});
	
	//tree.root.toggle(true);
	
});