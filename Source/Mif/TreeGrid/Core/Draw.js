/*
Mif.TreeGrid.Draw
*/
Mif.TreeGrid.Draw={

	structure: function(tree){
		var html=['<div class="mif-treegrid-header">'];
		html.push('<div class="mif-treegrid-row">');
		tree.options.cols.each(function(col){
			html.push('<div class="mif-treegrid-col" style="width:',tree.options.colWidth,'px">',col,'</div>');
		});
		html.push('<div style="clear:both"></div>');
		html.push('</div>');
		html.push('</div>');
		//body
		html.push('<div class="mif-treegrid-body"></div>');
		//footer
		html.push('<div clsss="treegird-footer"></div>');
		tree.wrapper.innerHTML=html.join('');
		['header', 'body', 'footer'].each(function(part){
			tree[part]=tree.wrapper.getElement('.mif-treegrid-'+part);
		});
	},
	
	getIndent: function(node){
		var html=['<span class="mif-treegrid-indent">']
		while(node.parentNode){
			node=node.parentNode;
			html.push('<span class="mif-treegrid-indent-bit"></span>');
		}
		html.push('</span>');
		return html.join('');
	},

	getHTML: function(node,html){
		var prefix=node.tree.DOMidPrefix;
		if($defined(node.property.checked)){
			if(!node.hasCheckbox) node.property.checked='nochecked';
			var checkbox='<span class="mif-treegrid-checkbox mif-treegrid-node-'+node.property.checked+'" uid="'+node.UID+'"></span>';
		}else{
			var checkbox='';
		}
		html=html||[];
		html.push('<div class="mif-treegrid-row"','" uid="',node.UID,'">');
		html.push('<div class="mif-treegrid-col mif-treegrid-treecol" style="width:',tree.options.colWidth,'px">');//open tree col
		html.push(this.getIndent(node));
		html.push(
		'<span class="mif-treegrid-node ',(node.isLast() ? 'mif-treegrid-node-last' : ''),'" id="',prefix,node.UID,'">',
			'<span class="mif-treegrid-node-wrapper ',node.property.cls,'" uid="',node.UID,'">',
				'<span class="mif-treegrid-gadjet mif-treegrid-gadjet-',node.getGadjetType(),'" uid="',node.UID,'"></span>',
				'<span class="mif-treegrid-light"><span class="mif-treegrid-left"></span>',
					checkbox,
					'<span class="mif-treegrid-icon ',node.property.closeIcon,'" uid="',node.UID,'"></span>',
					'<span class="mif-treegrid-name" uid="',node.UID,'">',node.property.name,'</span>',
				'<span class="mif-treegrid-right"></span></span>',
			'</span>',
		'</span>'
		);
		html.push('</div>');//close tree col
		for(var i=1, l=node.tree.options.cols.length;i<l;i++){
			html.push('<div class="mif-treegrid-col" style="width:',tree.options.colWidth,'px">',node.property['col'+i],'</div>');
		}
		html.push('<div style="clear:both"></div>');
		html.push('</div>');//close row
		html.push('<div class="mif-treegrid-children" style="display:none"></div>');//children
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
		tree.body.innerHTML=this.getHTML(tree.root).join('');
		tree.fireEvent('drawRoot');
	},
	
	forestRoot: function(tree){
		var container=new Element('div').addClass('mif-treegrid-children-root').injectInside(tree.wrapper);
		Mif.TreeGrid.Draw.children(tree.root, container);
	},
	
	node: function(node){
		return new Element('div').set('html', this.getHTML(node).join('')).getFirst();
	},
	
	update: function(node){
		if(!node) return;
		if( (node.tree.forest && node.isRoot()) || (node.getParent() && !node.getParent().$draw) ) return node;
		if(!node.hasChildren()) node.property.open=false;
		node.getDOM('name').set('html', node.property.name);
		node.getDOM('wrapper').className='mif-treegrid-node-wrapper '+node.property.cls;
		node.getDOM('gadjet').className='mif-treegrid-gadjet mif-treegrid-gadjet-'+node.getGadjetType();
		node.getDOM('icon').className='mif-treegrid-icon '+node.property[node.isOpen() ? 'openIcon' : 'closeIcon'];
		node.getDOM('node')[(node.isLast() ?'add' : 'remove')+'Class']('mif-treegrid-node-last');
		node.select(node.isSelected());
		node.tree.updateHover();
		if(node.$loading) {
			node.tree.fireEvent('updateNode', node);
			return node;
		}
		var children=node.getDOM('children');
		children.className='mif-treegrid-children';
		if(node.isOpen()){
			if(!node.$draw) Mif.TreeGrid.Draw.children(node);
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
				var children=node.tree.wrapper.getElement('.mif-treegrid-children-root');
			}else{
				var children=node.parentNode.getDOM('children');
			}
			domNode.injectTop(children);
		}
	}
	
};
