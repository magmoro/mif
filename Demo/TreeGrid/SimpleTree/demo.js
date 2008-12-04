window.addEvent('domready',function(){
	tree = new Mif.TreeGrid({
		initialize: function(){
			//new Mif.Tree.Highlight(this);
		},
		container: $('tree_container'),// tree container
		types: {// node types
			folder:{
				openIcon: 'mif-tree-open-icon',//css class open icon
				closeIcon: 'mif-tree-close-icon'// css class close icon
			}
		},
		dfltType:'folder',//default node type
		height: 19,//node height
		cols: ['name', 'url'],
		animateToggle: true
	});

	var json=[
		{
			"name": "root",
			"col1": "html://mifjs.net/",
			"children": [
				{
					"name": "node1",
					"col1": "html://mifjs.net/node1"
				},
				{
					"name": "node2",
					"col1": "html://mifjs.net/node2",
					"open": true,
					"children":[
						{
							"name": "node2.1",
							"col1": "html://mifjs.net/node2.1",
							"open": true,
							"children": [
								{
									"name": 'node2.1.1',
									"col1": "html://mifjs.net/node2.1.1",
									"children": [
										{
											"name": 'node2.1.1.1',
											"col1": "html://mifjs.net/node2.1.1.1"
										},
										{
											"name": 'node2.1.1.2',
											"col1": "html://mifjs.net/node2.1.1.2"
										}
									]
								},
								{
									"name": 'node2.1.2',
									"col1": "html://mifjs.net/node2.1.2"
									
								},
								{
									"name": 'node2.1.3',
									"col1": "html://mifjs.net/node2.1.3"
								},
								{
									"name": 'node2.1.4',
									"col1": "html://mifjs.net/node2.1.4"
								}
							]
						},
						{
							"name": "node2.2",
							"col1": "html://mifjs.net/node2.2"
						},
						{
							"name": "node2.3",
							"col1": "html://mifjs.net/node2.3"
						}
					]
				},
				{
					"name": "node3",
					"col1": "html://mifjs.net/node2.3"
				}
			]
		}
	];
	
	// load tree from json.
	tree.load({
		json: json
	});
	
	tree.root.toggle();
	
});