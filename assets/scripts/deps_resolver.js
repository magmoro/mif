var DepsResolver=new Class({

	Implements: [Events],
	
	initialize: function(){		
		
		
		this.panel=new Element('div', {'class': 'deps-resolver'});
		
		this.wrapper=new Element('div', {'class': 'deps-wrapper'}).inject(this.panel);
		/* this.download=new Element('button', {'class': 'download', 'value': 'download'}).inject(this.panel);
		this.download.addEvent('click', function(){
			console.log(this.getFiles());
		}.bind(this)); */
		this.tree={
			root: {
				children: [],
				parent: null,
				div: this.wrapper
			}
		};
		this.nodes={};
		//this.sortTree(this.tree);
		//this.buildHTML(json, 0, this.wrapper);
	},
	
	load: function(url){
		new Request.JSON({
			url: url,
			method: 'get',
			onComplete: function(json){
				this.buildTree(this.tree.root, json);
				this.setDeps(this.tree.root);
				this.setReqs(this.tree.root);
				this.draw(this.tree.root);
				//this.makeCollapsible();
				this.initChekboxes();
				this.initCheck();
				this.sortTree(this.tree);
				this.fireEvent('load');
			}.bind(this)
		}).send();
	},
	
	buildTree: function(parent, json){
		for(var p in json){
			var obj=json[p];
			if(p=='assets'){
				parent.assets=obj;
			}else if(p=='deps'){
				parent.deps=obj;
			}else if(p=='desc'){
				parent.desc=obj;
			}else if(this.isFile(obj)){
				obj.parent=parent;
				obj.name=p;
				obj.children=[];
				obj.file=true;
				parent.children.push(obj);
				this.nodes[this.getPath(obj)]=obj;
			}else{
				var folder={
					name: p,
					parent: parent,
					children: [],
					deps: obj.deps
				};
				parent.children.push(folder);
				this.nodes[this.getPath(folder)]=folder;
				this.buildTree(folder, obj);
			}
		}
	},
	
	getPath: function(node){
		var path=[];
		while(node.parent){
			path.push(node.name);
			node=node.parent;
		}
		path.push([]);
		return path.reverse().join('/');
	},
	
	setDeps: function(node){
		var children=node.children;
		for(var i=0,l=children.length;i<l;i++){
			var result=[];
			var child=children[i];
			var deps=child.deps||[];
			for(var j=0,m=deps.length;j<m;j++){
				var dep=deps[j];
				if(dep.substring(0,1)=='/'){
					result.push(this.nodes[dep]);
				}else{
					var script_name;
					node=child;
					while(node.parent){
						var script_name=node.name;
						node=node.parent;
					}
					result.push(this.nodes['/'+script_name+'/'+dep]);
				}
			}
			child.deps=result;
			this.setDeps(children[i]);
		}
	},
	
	setReqs: function(node){
		var children=node.children;
		for(var i=0,l=children.length;i<l;i++){
			var result=[];
			var child=children[i];
			var deps=child.deps;
			child.reqs=child.reqs||[];
			for(var j=0,m=deps.length;j<m;j++){
				var dep=deps[j];
				dep.reqs= (dep.reqs||[]).include(child);
			}
			this.setReqs(children[i]);
		}
	},
	
	sortTree: function(){
		this.sorted=[];
		this.sortNodes(this.tree.root);
	},
	
	sortNodes: function(node){
		
		var children=node.children;
		for(var i=0, l=children.length;i<l;i++){
			var child=children[i];
			this.sort(child);
			this.sortNodes(child);
		}
	},
	
	sort: function(node){
		if(this.sorted.contains(node)) return;
		this.sorted.push(node);
		var deps=node.deps;
		if(!deps) return;
		for(var i=0, l=deps.length;i<l;i++){
			var dep_node=deps[i];
			this.setOrder(node, dep_node);
			this.sort(dep_node);
		}
	},
	
	setOrder: function(node1, node2){
		
		var parents1=this.getParents(node1);
		var parents2=this.getParents(node2);
		var common=null;
		for(var i=0, l=parents1.length;i<l;i++){
			if(parents2[i]==parents1[i]){
				common=parents1[i];
			}else{
				break;
			}
		}
		if(common==node1||common==node2) return;
		if(common.children.indexOf(parents2[i])>common.children.indexOf(parents1[i])){
			common.children.erase(parents2[i]);
			common.children.inject(parents2[i], parents1[i], 'before');
		}
	},
	
	getParents: function(node){//and self
		var parents=[];
		while(node){
			parents.push(node);
			node=node.parent;
		}
		return parents.reverse();
	},
	
	getLevel: function(node){
		var level=-1;
		while(node){
			node=node.parent;
			level++;
		}
		return level;
	},
	
	draw: function(node){
		var children=node.children;
		var parent=node.div;
		for(var i=0, l=children.length;i<l;i++){
			var child=children[i];
			var level=this.getLevel(child);
			var desc=child.desc ? '('+child.desc+')' : '';
			var name=child.name;
			if(child.file){
				var file=new Element('div', {'class': 'file'}).inject(parent);
				var path=this.getPathToFile(child);
				var name=new Element('a', {'class': 'file-name', 'href': path, target: '_blank', 'html': name+'.js'}).inject(file);
				var desc=new Element('span', {'class': 'file-desc', 'html': desc}).inject(file);
				var checkbox=new Element('div', {'class': 'checkbox'}).inject(file, 'top');
				/* if(obj.assets){
					this.setAssets(file);
				} */
			}else{
				var folder=new Element('div', {'class': 'folder deps-level-'+level}).inject(parent);
				var name=new Element('span', {'class': 'folder-name', 'html': name}).inject(folder);
				var desc=new Element('span', {'class': 'file-desc', 'html': desc}).inject(folder);
				var checkbox=new Element('div', {'class': 'checkbox'}).inject(folder, 'top');
				var container=new Element('div', {'class': 'deps-container'}).inject(parent);
				child.div=container;
				this.draw(child);
			}
			child.checkbox=checkbox;
			checkbox.store('node', child);
			/* if(assets){
				new Element('div', {'class': 'assets'}).inject(parent);
			} */
		}
		
	},
	
	makeCollapsible: function(){
		$$('.folder').each(function(el){
			var next=el.getNext();
			var slider=new Fx.Slide(next,{
				onComplete: function(){
					this.wrapper.setStyle('height', 'auto');
				}
			});
			el.addEvent('click', function(){
				slider.toggle();
			});
		});
	},
	
	initChekboxes: function(){
		$$('.checkbox').addEvent('mouseenter', function(){
			this.addClass('checkbox-hover');
		});
		$$('.checkbox').addEvent('mouseleave', function(){
			this.removeClass('checkbox-hover');
		});
	},
	
	isFile: function(obj){
		for(var p in obj){
			if(!DepsResolver.key_words.contains(p)) return false;
		}
		return true;
	},
	
	getPathToFile: function(node){
		return this.getPath(node)+'.js';
	},
	
	buildLevel: function(){
		
	},
	
	inject: function(el){
		this.panel.inject(el);
		this.initCheck();
	},
	
	initCheck: function(){
		$$('.file').each(function(el){
			var checkbox=el.getElement('.checkbox');
			var node=checkbox.retrieve('node');
			el.addEvent('click', function(event){
				
				var target=event.target;
				if(target && target.get('tag')=='a') return;
				var state = checkbox.hasClass('checked') ? true : false;
				if(!state){
					this.check(node);
				}else{
					this.uncheck(node);
				}
			}.bind(this));
		}, this);
		$$('.folder .checkbox').each(function(checkbox){
			var node=checkbox.retrieve('node');
			checkbox.addEvent('click', function(event){
				var state = checkbox.hasClass('checked') ? true : (checkbox.hasClass('partialy') ? 'partialy' : false);
				if(state===true){
					this.uncheck(node);
				}else{
					this.check(node);
				}
				return false;
			}.bind(this));
		}, this);
	},
	
	check: function(node){
		this.checked=[];
		this.checkNode(node);
	},
	
	checkNode: function(node, partialy){
		if(this.checked.contains(node)){
			return;
		}
		if(!node.parent) return;
		this.checked.push(node);
		node.checked=partialy ? 'partialy' : true;
		if(node.file){
			node.checkbox.addClass('checked');
		}else{
			var what='checked';
			var children=node.children;
			for(var i=0,l=children.length;i<l;i++){
				if(!children[i].checked){
					what='partialy';
					break;
				}
			}
			node.checkbox.addClass(what);
		}
		this.checkParents(node);
		if(!node.file && !partialy){
			for(var i=0,l=node.children.length;i<l;i++){
				this.checkNode(node.children[i]);
			}
		}
		var deps=node.deps;
		for(var i=0, l=deps.length;i<l;i++){
			this.checkNode(deps[i]);
		}
	},
	
	checkParents: function(node, uncheck){
		while(true){
			node=node.parent;
			if(!node.parent) break;
			if(!uncheck && !this.checked.contains(node)){
				this.checkNode(node, true);
			}
			var what='unchecked';
			var children=node.children;
			for(var i=0,l=children.length;i<l;i++){
				var checked=children[i].checked;
				if(checked==='partialy'){
					what='partialy';
					break;
				}
				if(what=='checked' && checked!==true){
					what='partialy';
					break;
				}else if(checked===true){
					what='checked';
				}
			}
			node.checked= (what=='partialy' ? 'partialy' : (what=='checked' ? true : false));
			if(what=='unchecked'){
				node.checkbox.removeClass('checked').removeClass('partialy');
			}else{
				var remove=what=='checked' ? 'partialy' : 'checked';
				node.checkbox.addClass(what).removeClass(remove);
			}
		}
	},
	
	uncheck: function(node){
		this.unchecked=[];
		this.uncheckNode(node);
	},
	
	uncheckNode: function(node){
		if(this.unchecked.contains(node)){
			return;
		}
		if(!node.parent) return;
		this.unchecked.push(node);
		node.checked=false;
		node.checkbox.removeClass('checked').removeClass('partialy');
		var parent=node;
		while(true){
			parent=parent.parent;
			if(!parent.parent) break;
			var reqs=parent.reqs;
			for(var i=0, l=reqs.length;i<l;i++){
				this.uncheckNode(reqs[i]);
			}
		}
		for(var i=0,l=node.children.length;i<l;i++){
			this.uncheckNode(node.children[i]);
		}
		this.checkParents(node, true);
		var reqs=node.reqs;
		for(var i=0, l=reqs.length;i<l;i++){
			this.uncheckNode(reqs[i]);
		}
	},
	
	getFiles: function(){
		return this.getNodeFiles(this.tree.root);
	},
	
	getNodeFiles: function(node){
		var files=[];
		var children=node.children;
		for(var i=0,l=children.length;i<l;i++){
			var child=children[i];
			if(child.file && child.checked){
				files.push(this.getPath(child)+'.js');
			}
			files.extend(this.getNodeFiles(child));
		}
		return files;
	},
	
	getScripts: function(root){
		root=root||'';
		var scripts=[];
		this.getFiles().each(function(file){
			scripts.push('<script type="text/javascript" src="'+root+file+'"></script>');
		});
		return scripts.join('\n');
	}
	
	

});

DepsResolver.key_words=['deps', 'desc', 'optional', 'assets'];

Array.implement({
	
	inject: function(added, current, where){//inject added after or before current;
		var pos=this.indexOf(current)+(where=='before' ? 0 : 1);
		for(var i=this.length-1;i>=pos;i--){
			this[i+1]=this[i];
		}
		this[pos]=added;
		return this;
	}
	
});
