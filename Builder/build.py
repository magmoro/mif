#!python

import cgi, simplejson, os, shutil, re, base64
from lxml import etree


#print "content-disposition: attachment; filename=mif.js\n"
print "Content-Type:text/html\n"
print "<pre>"

def relpath(path, root=''):
	if not root:
		root=os.curdir
	path=os.path.normpath(path)
	root=os.path.normpath(root)
	common=os.path.commonprefix((path, root))
	
	tail=root[len(common):]

	if tail:
		parents=[]
		if root[len(common):]=='.':
			pass
		else:
			count_parents=len(root[len(common):].split(os.sep))
			for i in range(count_parents):
				parents.append('..')
	else:
		parents=['.']

	parents.extend(path[len(common):].split(os.sep))
	return '/'.join(os.path.normpath('/'.join(parents)).split(os.sep))


class Build():
	
	def __init__(self):
		self.resource_root='../Source/resources/'
		self.build_root='../__build__/'
		self.deps_path='../deps.xml'
		self.tree=etree.parse(self.deps_path)
		self.get_data()
		self.get_nodes()
		self.get_paths()
		self.get_folder_paths()
		
	def get_data(self):
		form = cgi.FieldStorage()
		paths=[]
		for field in form["paths[]"]:
			paths.append(field.value)
		self.paths=paths
		self.compression=form['compression'].value
		
	def get_nodes(self):
		nodes=[]
		def walk(node):
			for child in node:
				path=self.tree.getpath(child)
				if path in self.paths:
					nodes.append(child)
				walk(child)
		walk(self.tree.getroot())		
		self.nodes=nodes
		
	def get_paths(self):
		paths=[]
		def get_file_paths(nodes):
			for node in nodes:
				children=node.getchildren()
				if not len(children):
					paths.append(self.tree.getpath(node)[6:])
				else:
					for child in children:
						paths.append(self.tree.getpath(child)[6:])
		get_file_paths(self.nodes)			
		self.file_paths=paths
		
	def get_folder_paths(self):
		def get_folders(file_paths):
			folders=[]
			for file in file_paths:
				folder='/'.join(file.split('/')[1:-1])
				if not folder in folders:
					folders.append(folder)
			return folders
		folders=get_folders(self.file_paths)
		self.folder_paths=folders
		
	def join_css(self, paths):
		pass
		
	def get_js(self):
		js=''
		for file in self.file_paths:
			js=js+open('../'+file+'.js').read()
		self.js=js
		return js
		
	def get_css(self):
		css=''
		for folder in self.folder_paths:
			path=self.resource_root+folder+'/.css'
			if os.path.exists(path):
				css=css+self.convert_css(open(path).read(), folder)
		self.css=css
		return css
		
	def convert_css(self, css, folder):
		def to_data_uri(matchobj):
			path=os.path.join(os.path.join(self.resource_root, folder), matchobj.group(2))
			if os.path.exists(path):
				if path.endswith('.png'):
					type='png'
				elif path.endswith('.gif'):
					type='gif'
				else:
					type='jpeg'
				return matchobj.group(1)+'data:image/'+type+';base64,'+base64.standard_b64encode(open(path, 'rb').read())+matchobj.group(3)
			return matchobj.group(0)
		p=re.compile('^(\s*background(?:-image)?\s*:url\([\'"])(.*)([\'"]\).*)', re.M)
		result=re.sub(p, to_data_uri, css)
		return result
		
	def convert_css_ie(self, css):
		pass
		
	def save(self):
		open(self.build_root+'mif.js', 'w').write(self.get_js())
		open(self.build_root+'mif.css', 'w').write(self.get_css())
		
build=Build()

print build.get_css()
build.save()