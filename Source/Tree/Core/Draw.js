/*
Mif.Tree.Draw
*/
Mif.Tree.Draw={

	getHTML: function(node,html){
		var prefix='mif-tree-';
		if($defined(node.property.checked)){
			if(!node.hasCheckbox) node.property.checked='nochecked';
			var checkbox='<span class="mif-tree-checkbox mif-tree-node-'+node.property.checked+'" uid="'+node.UID+'"></span>';
		}else{
			var checkbox='';
		}
		html=html||[];
		html.push(
		'<div class="mif-tree-node ',(node.isLast() ? 'mif-tree-node-last' : ''),'" id="',prefix,node.UID,'">',
			'<span class="mif-tree-node-wrapper ',node.property.cls,'" uid="',node.UID,'">',
				'<span class="mif-tree-gadjet mif-tree-gadjet-',node.getGadjetType(),'" uid="',node.UID,'"></span>',
				'<span class="mif-tree-light"><span class="mif-tree-left"></span>',
					checkbox,
					'<span class="mif-tree-icon ',node.property.closeIcon,'" uid="',node.UID,'"></span>',
					'<span class="mif-tree-name" uid="',node.UID,'">',node.property.name,'</span>',
				'<span class="mif-tree-right"></span></span>',
			'</span>',
			'<div class="mif-tree-children" style="display:none"></div>',
		'</div>'
		);
		return html;
	},
	
	children: function(parent, container){
		parent.property.open=true;
		parent.$draw=true;
		var html=[];
		var children=parent.children;
		for(var i=0,l=children.length;i<l;i++){
			this.getHTML(children[i],html);
		}
		container=container || parent.getDOM('children');
		container.set('html', html.join(''));
		parent.tree.fireEvent('drawChildren',[parent]);
	},
	
	root: function(tree){
		var domRoot=this.node(tree.root);
		domRoot.injectInside(tree.wrapper);
		tree.fireEvent('drawRoot');
	},
	
	forestRoot: function(tree){
		var container=new Element('div').addClass('mif-tree-children-root').injectInside(tree.wrapper);
		Mif.Tree.Draw.children(tree.root, container);
	},
	
	node: function(node){
		return new Element('div').set('html', this.getHTML(node).join('')).getFirst();
	},
	
	update: function(node){
		if(!node) return;
		if( (node.tree.forest && node.isRoot()) || (node.getParent() && !node.getParent().$draw) ) return node;
		if(!node.hasChildren()) node.property.open=false;
		node.getDOM('name').set('html', node.property.name);
		node.getDOM('wrapper').className='mif-tree-node-wrapper '+node.property.cls;
		node.getDOM('gadjet').className='mif-tree-gadjet mif-tree-gadjet-'+node.getGadjetType();
		node.getDOM('icon').className='mif-tree-icon '+node.property[node.isOpen() ? 'openIcon' : 'closeIcon'];
		node.getDOM('node')[(node.isLast() ?'add' : 'remove')+'Class']('mif-tree-node-last');
		node.select(node.isSelected());
		node.tree.updateHover();
		if(node.$loading) {
			node.tree.fireEvent('updateNode', node);
			return node;
		}
		var children=node.getDOM('children');
		children.className='mif-tree-children';
		if(node.isOpen()){
			if(!node.$draw) Mif.Tree.Draw.children(node);
			children.style.display='block';
			if(Browser.Engine.gecko){
				children.reinject();
			}
		}else{
			children.style.display='none';
		}
		node.tree.fireEvent('updateNode', node);
		return node;
	},
	
	updateDOM: function(node, domNode){
		domNode= domNode||node.getDOM('node');
		var previous=node.getPrevious();
		if(previous){
			domNode.injectAfter(previous.getDOM('node'));
		}else{
			if(node.tree.forest && node.parentNode.isRoot()){
				var children=node.tree.wrapper.getElement('.mif-tree-children-root');
			}else{
				var children=node.parentNode.getDOM('children');
			}
			domNode.injectTop(children);
		}
	}
	
};
