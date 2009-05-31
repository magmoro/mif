window.addEvent('domready',function(){
	tree = new Mif.Tree({
		initialize: function(){
			//new Mif.Tree.Highlight(this);
			new Mif.Tree.Drag(this);
		},
		container: $('container'),// tree container
		types: {// node types
			folder:{
				openIcon: 'mif-tree-node-open',//css class open icon
				closeIcon: 'mif-tree-node-close'// css class close icon
			}
		},
		dfltType:'folder',//default node type
		height: 19//node height
	});
	
	var json=[
		{
			"name": "root",
			"children": [
				{
					"name": "node11111111111111111111111111111"
				},
				{
					"name": "node2",
					"open": true,
					"children":[
						{
							"name": "node2.1",
							"open": true,
							"children": [
								{
									"name": 'some child',
									"children": [
										{
											"name": 'some child',
											"children": [
												{
													"name": 'some child'
												}
											]
										}
									]
								},
								{
									"name": 'some other child'
								},
								{
									"name": 'some other child2'
								},
								{
									"name": 'some other child3'
								}
							]
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						}
					]
				},
				{
					"name": "some name"
				},
				{
					"name": "some name"
				},
				{
					"name": "node2",
					"open": true,
					"children":[
						{
							"name": "node2.1",
							"open": true,
							"children": [
								{
									"name": 'some child',
									"children": [
										{
											"name": 'some child',
											"children": [
												{
													"name": 'some child'
												}
											]
										}
									]
								},
								{
									"name": 'some other child'
								},
								{
									"name": 'some other child2'
								},
								{
									"name": 'some other child3'
								}
							]
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						},
						{
							"name": "node2.2"
						}
					]
				},
				{
					"name": "some name"
				},
				{
					"name": "some name"
				},
				{
					"name": "some name"
				},
				{
					"name": "some name"
				},
				{
					"name": "some name"
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