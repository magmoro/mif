#!D:\python25\python

import cgi, simplejson, os, shutil
from lxml import etree


print "content-disposition: attachment; filename=mif.js\n"
#print "Content-Type:text/html\n"

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
node=tree.find('/Source/Core/Mif/')

def get_nodes(items):
	nodes=[]
	for item in items:
		nodes.append(tree.find(item[5:]))
	return nodes

nodes=get_nodes(items)

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

file=''

for file_name in file_paths:
	file+=open(current_dir+'/../'+file_name+'.js').read()
	
print file
