#!python

import os, re

root='../Source/resources'
css={}

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

def get_css(path, obj, root):
	for f in os.listdir(path):
		target=os.path.join(path,f)
		if os.path.isdir(target):
			get_css(target, obj, root)
		elif target.endswith('.css'):
			css_file=open(target).read()
			obj[relpath(target, root)]=process_css(css_file)
			
			
def process_css(file):
	parsed=[]
	def parse_bg(matchobj):
		bg=matchobj.group(0)
		obj={}
		parsed.append(obj)
		def replace_background(matchobj):
			return matchobj.group(1)

		bg=re.sub(r'\s*background\s*:(.*)$', replace_background, bg)

		def replace_url(matchobj):
			obj['url']=matchobj.group(1)
			return ''

		bg=re.sub(r'url\([\',"](.*?)[\',"]\)', replace_url, bg)

		def replace_repeats(matchobj):
			obj['repeat']=matchobj.group(0)
			return ''

		bg=re.sub(r'(repeat-x|repeat-y|repeat|no-repeat)', replace_repeats, bg)

		def replace_color(matchobj):
			obj['color']=matchobj.group(0)
			return ''

		bg=re.sub(r'#[0-9A-Fa-f]+', replace_color, bg)

		def replace_position(matchobj):
			obj['positionX']=matchobj.group(1)
			obj['positionY']=matchobj.group(2)
			return ''

		bg=re.sub(r'(-?[0-9]+)px\s+(-?[0-9]+)px?', replace_position, bg)

		return matchobj.group(0)+'MOOOOOOOOOOOOOOOOOO'
	p=re.compile('^\s*background\s*:.*', re.M)
	file=re.sub(p, parse_bg, file)
	print repr(parsed)
	#print file
	return file
			
get_css(root, css, root)

open('css', 'w').write(repr(css))

			
