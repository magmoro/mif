/*
Mif.TreeGrid.Checkbox
*/
Mif.TreeGrid.implement({

	initCheckbox: function(type){
		this.checkboxType=type||'simple';
		this.defaults.checked='unchecked';
		this.defaults.hasCheckbox=true;
		this.wrapper.addEvent('click',this.checkboxClick.bindWithEvent(this));
		if(this.checkboxType=='simple') return;
		this.addEvent('loadChildren', function(node){
			if(!node || node.property.checked=='unchecked') return;
			node.recursive(function(){
				this.property.checked='checked';
			});
		});
	},
	
	checkboxClick: function(event){
		if(this.mouse.target!='checkbox') {return;}
		this.mouse.node['switch']();
	},
	
	getChecked: function(){
		var checked=[];
		this.root.recursive(function(){
			if(this.property.hasCheckbox && this.property.checked) checked.push(checked);
		});
		return checked;
	}

});

Mif.TreeGrid.Node.implement({

	'switch' : function(state){
		if(this.property.checked==state||!this.property.hasCheckbox) return;
		var type=this.tree.checkboxType;
		var checked=(this.property.checked=='checked') ? 'unchecked' : 'checked';
		this.tree.fireEvent(checked=='checked' ? 'check' : 'unCheck', this);
		var setState=function(node, state){
			if(!node.property.hasCheckbox) return;
			var oldState=node.property.checked;
			node.property.checked=state;
			if(!node.parentNode || (node.parentNode && node.parentNode.$draw)){
				node.getDOM('checkbox').removeClass('mif-tree-node-'+oldState).addClass('mif-tree-node-'+state);
			}
		};
		if(type=='simple'){
			setState(this, checked);
			return false;
		};
		this.recursive(function(){
			setState(this, checked);
		});
		function setParentCheckbox(node){
			if(!node.property.hasCheckbox) return;
			if(!node.parentNode || (node.tree.forest && !node.parentNode.parentNode)) return;
			var parent=node.parentNode;
			var state='';
			var children=parent.children;
			for(var i=children.length; i--; i>0){
				var child=children[i];
				if(!child.property.hasCheckbox) continue;
				var childState=child.property.checked;
				if(childState=='partially'){
					state='partially';
					break;
				}else if(childState=='checked'){
					if(state=='unchecked'){
						state='partially';
						break;
					}
					state='checked';
				}else{
					if(state=='checked'){
						state='partially';
						break;
					}else{
						state='unchecked';
					}
				}
			}
			if(parent.property.checked==state){return;};
			setState(parent, state);
			setParentCheckbox(parent);
		};
		setParentCheckbox(this);
	}

});
