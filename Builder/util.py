#!python

import os

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