var Builder=new  Class({

	Implements: [Events, Options],
	
	options:{
		url: 'deps.xml',
		downloadUrl: 'download.py'
	},
	
	initialize: function(options){
		this.setOptions(options);
		this.element=new Element('div', {'class': 'builder'});
		this.load();
	},
	
	load: function(){
		new Request({
			url: this.options.url,
			method: 'get',
			onComplete: function(xmlString){
				var xmlDoc=XML.rootFromString(xmlString);
				this.xmlDoc=xmlDoc;
				this.makeHtml(xmlDoc);
				this.initEvents();
				this.fireEvent('ready');
			}.bind(this)
		}).send();
	},
	
	inject: function(element, how){
		this.element.inject(element, how);
	},
	
	makeHtml: function(xmlDoc){
		var documentElement=xmlDoc.documentElement;
		var children=documentElement.childNodes;
		var mainHtml=[];
		var externHtml=[];
		for(var i=0,l=children.length;i<l;i++){
			var child=children[i];
			if(child.nodeType==3) continue;
			var extern=child.tagName=='Extern' ? true : false;
			if(extern){
				externHtml.push(this.makeNodeHtml(child));
			}else{
				mainHtml.push('<h2>'+child.tagName+'</h2>');
				mainHtml.push(this.makeNodeHtml(child));
			};
		}
		this.element.set('html','<form action="'+this.options.downloadUrl+'" method="post">'+
			'<div class="main" id="main">'+mainHtml.join('')+'</div>'+
			'<div class="extern" id="extern"><h2>External scripts</h2>'+externHtml.join('')+'</div>'+
			'<div class="compress"><h2>Compressor</h2>'+
				'<div class="child">'+
					'<label for="packer"><input type="radio" name="compression" value="packer" id="packer" />Dean Edwards packer</label>'+
					'<label class="description" for="jsmin"><input type="radio" name="compression" value="none" id="jsmin" />jsmin</label>'+
					'<label class="description" for="uncompressed"><input type="radio" name="compression" value="uncompressed" id="uncompressed" checked="checked" />uncompressed</label>'+
				'</div>'+
			'</div>'+
			'<div class="download"><input type="submit" value="DOWNLOAD" id="download"></input></div>'+
			'</form>');
	},
	
	makeNodeHtml: function(root){
		var html=[];
		var children=root.childNodes;
		for(var i=0, l=children.length;i<l;i++){
			var child=children[i];
			if(child.nodeType==3) continue;
			var desc=child.getAttribute('desc') ? '<span class="desc"> &mdash; '+child.getAttribute('desc')+'</span>' : '';
			if(child.childNodes.length>0 && !child.getAttribute('group')){
				var hN='h'+(this.getLevel(child));
				
				html.push('<'+hN+'>'+child.tagName+desc+'</'+hN+'>');
				html.push('<div class="child">'+this.makeNodeHtml(child)+'</div>');
			}else{
				html.push('<div class="child"><label><input type="checkbox" name="paths[]" value="'+this.getXpath(child)+'"/><span class="name">'+child.tagName+'</span>'+desc+'</label></div>');
			}
		}
		return html.join('');
	},
	
	getLevel: function(node){
		var level=-1;
		while(node){
			node=node.parentNode;
			level++;
		}
		return level;
	},
	
	getXpath: function(node){
		var xpath=[];
		xpath.push(node.tagName);
		while(node.parentNode){
			node=node.parentNode;
			xpath.push(node.tagName);
		}
		return xpath.reverse().join('/');
	},
	
	initEvents: function(){
		this.element.getElements('input[type="checkbox"]').each(function(checkbox){
			checkbox.addEvent('click', function(){
				checkbox.checked ? this.check(checkbox) : this.uncheck(checkbox);
			}.bind(this));
		}, this);
	},
	
	getXmlNode: function(checkbox){
		return XML.getNode(this.xmlDoc, checkbox.getAttribute('value'));
	},
	
	getCheckbox: function(node){
		return this.element.getElement('input[value="'+this.getXpath(node)+'"]');
	},
	
	getDeps: function(xmlNode){
		var deps=xmlNode.getAttribute('deps');
		if(deps){
			deps=deps.split(' ');
			deps=deps.map(function(dep){
				if(dep.substring(0,1)=='/') dep='/deps'+dep;
				try{
					var node=XML.getNode(xmlNode, dep);
				}catch(e){}
				if(!node) throw new Error('xpath:"'+dep+'" from node:"'+this.getXpath(xmlNode)+'" return empty result');
				return node;
			}, this);
			return deps;
		}
		return [];
	},
	
	check: function(checkbox){
		checkbox.checked=true;
		this.checkDependants(checkbox);
	},
	
	checkDependants: function(checkbox){
		var xmlNode=this.getXmlNode(checkbox);
		var parent=xmlNode;
		while(1){
			parent=parent.parentNode;
			if(!parent||parent.tagName=='deps') break;
			this.checkNodes(this.getDeps(parent));
		}
		this.checkNodes(this.getDeps(xmlNode));
	},
	
	checkNodes: function(nodes){
		nodes.each(this.checkNode, this);
	},
	
	checkNode: function(node){
		if(node.childNodes.length && !node.getAttribute('group')){
			this.checkChildren(node);
		}
		var checkbox=this.getCheckbox(node);
		if(!checkbox) return;
		if(!checkbox.checked){
			this.check(checkbox);
		}
	},
	
	checkChildren: function(node){
		var children=node.childNodes;
		for(var i=0, l=children.length; i<l; i++){
			var child=children[i];
			if(child.nodeType==3) continue;
			this.checkNode(child);
		}
	},
	
	uncheck: function(checkbox){
		checkbox.checked=false;
		this.uncheckDepending(checkbox);
	},
	
	uncheckDepending: function(checkbox){
		this.element.getElements('input[type="checkbox"]:checked').each(function(input){
			var testNode=this.getXmlNode(input);
			var node=this.getXmlNode(checkbox);
			var deps=this.getDeps(testNode);
			while(1){
				testNode=testNode.parentNode;
				if(!testNode||testNode.tagName=='deps') break;
				deps.combine(this.getDeps(testNode));
			}
			if(!deps.length) return;
			while(1){
				if(deps.contains(node)){
					this.uncheck(input);
					return;
				}
				node=node.parentNode;
				if(!node||node.tagName=='deps') break;
				
			}
		}, this);
	},
	
	checkAll: function(){
		$('main').getElements('input[type="checkbox"]').each(function(checkbox){
			this.check(checkbox);
		}, this);
	}
	
});


var XML = {
  
	rootFromString: function(string){
		var root;
		if (Browser.Engine.trident){
			root = new ActiveXObject('Microsoft.XMLDOM');
			root.async = false;
			root.loadXML(string);
		}else{
			root = new DOMParser().parseFromString(string, 'text/xml');
		}
		return root;
	},
	
	getNodes: function(node, xpath){
		var found=[], foundNodes;
		var root=node.ownerDocument||node;
		if(Browser.Engine.trident){
			root.setProperty("SelectionLanguage","XPath");
			foundNodes=node.selectNodes(xpath)
			for(var i=0, l=foundNodes.length; i<l; i++) found.push(foundNodes[i]);
		}else{
			foundNodes=root.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			for (var i=0, l=foundNodes.snapshotLength; i<l; i++) found.push(foundNodes.snapshotItem(i));
		}
		return found;
	},
	
	getNode: function(node, xpath){
		return XML.getNodes(node, xpath)[0];
	}
	
}
