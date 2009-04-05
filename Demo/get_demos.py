#!python

import sys, os, simplejson, os.path

print "Content-Type: text/html \n\n"

ignore=['assets']

def get_demos(root, obj, level=0):
	for f in os.listdir(root):
		path=os.path.join(root,f)
		if not os.path.isdir(path) or (f in ignore):
			continue
		if level==0:
			obj[f]={}
			get_demos(path, obj[f], 1)
		if level==1:
			obj[f]={}


demos={}
get_demos(os.path.dirname(__file__)+'/demos', demos)


print simplejson.dumps(demos)