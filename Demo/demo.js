var Demo=new Class({

	Implements: [Options],

	options:{
		url: 'get_demos.py'
	},

	initialize: function(){
		this.element=new Element('div', {'class': 'demo'});
		this.load();
	},
	
	load: function(){
		var request=new Request.JSON({
			url: this.options.url,
			method: 'get',
			onComplete:function(demos){
				this.demos=demos;
				this.draw();
			}.bind(this)
		});
		request.send();
	},
	
	draw: function(){
		var html=[];
		for(var kgroup in this.demos){
			html.push('<h2>'+kgroup+'</h2>');
			group=this.demos[kgroup];
			for(var demo in group){
				html.push('<a href="demos/'+kgroup+'/'+demo+'" target="_blank">'+demo+'</a>');
			}
		}
		this.element.set('html', html);
	},
	
	inject: function(element, how){
		this.element.inject(element, how);
	}
	
	
});

window.addEvent('domready', function(){
	var demo=new Demo;
	demo.inject('list');
	var element=new Element('div').setStyle('display', 'none').inject(document.body);
	var builder=new Builder({url:'../Source/deps.xml', downloadUrl: '../Builder/build.py'});
	builder.inject(element);
	builder.addEvent('ready', builder.checkAll);
	$('build').addEvent('click', function(){
		builder.element.getElement('form').submit();
	});
});