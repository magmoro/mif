#!python

import cgi, simplejson, os, shutil
from lxml import etree


#print "content-disposition: attachment; filename=mif.js\n"
print "Content-Type:text/html\n"

form = cgi.FieldStorage()
item_fields=form["items[]"]
items=[]
for field in item_fields:
	items.append(field.value)

compression=form['compression'].value




current_dir=os.path.dirname(__file__)
build_dir=current_dir+'/../Build'

"""
#remove Build
try:
	shutil.rmtree(build_dir)
except:
	pass
#mkdir Build
os.mkdir(build_dir)
"""


tree=etree.parse('../Source/deps.xml')
nodes=[]
def walk(node):
	for child in node:
		path=tree.getpath(child)
		if path in items:
			nodes.append(child)
		walk(child)
		
walk(tree.getroot())

def get_file_paths(nodes):
	file_paths=[]
	for node in nodes:
		children=node.getchildren()
		if not len(children):
			file_paths.append(tree.getpath(node)[6:])
		else:
			for child in children:
				file_paths.append(tree.getpath(child)[6:])
	return file_paths
		
file_paths=get_file_paths(nodes)
#js
scripts=''

for file_name in file_paths:
	scripts+='<script type="text/javascript" src="/'+file_name+'.js'+'"></script>\n'	

open('../Build/scripts', 'w').write(scripts)


#css

def process_css(css):
	return css

def get_folders(file_paths):
	folders=[]
	for file in file_paths:
		folder='/'.join(file.split('/')[1:-1])
		if not folder in folders:
			folders.append(folder)
	return folders
	
folders=get_folders(file_paths)
print '<pre>'
css=''
for folder in folders:
	try:
		file=open('../Source/resources/'+folder+'/.css').read()
		css+=process_css(file)+'\n'
	except:
		pass
		
open('../Build/mif.css', 'w').write(css)

