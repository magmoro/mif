#!python

import os, re, Image, shutil

root='../Source/resources'
imgs={}

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

def process_img(img, path, root):
	p=re.compile('(.*?)(?:\[padding=(.*?)\]|\[resizeX=(.*?)\]|\[resizeY=(.*?)\]|\[resizeXY=(.*?)\]|\[(repeat)\]|\[(repeatX)\]|\[(repeatY)\]|\[(noRepeat)\]|\[(asis)\]|\[margin=(.*?)\])*.(png|gif|jpg)$')
	match=p.match(img).groups()
	return {
		"name": match[0],
		"padding": match[1],
		"resizeX": match[2],
		"resizeY": match[3],
		"resizeXY": match[4],
		"repeat": match[5],
		"repeatX": match[6],
		"repeatY": match[7],
		"noRepeat": match[8],
		"asis": match[9],
		"margin": match[10],
		"type": match[11],
		"path": relpath(os.path.normpath(os.path.join(path, match[0])), root)
	}
	
def get_imgs(path, obj, root):
	for f in os.listdir(path):
		target=os.path.join(path,f)
		if os.path.isdir(target):
			get_imgs(target, obj, root)
		elif target.endswith('.png') or target.endswith('.gif') or target.endswith('.jpg'):
			img=process_img(f, path, root)
			obj[relpath(target, root)]=img
			
get_imgs(root, imgs, root)

images={
	'gif': {
		'repeat':[],
		'repeatX':[],
		'repeatY':[],
		'noRepeat':[],
		'asis': []
	},
	'png': {
		'repeat':[],
		'repeatX':[],
		'repeatY':[],
		'noRepeat':[],
		'asis': []
	},
	'jpg': {
		'repeat':[],
		'repeatX':[],
		'repeatY':[],
		'noRepeat':[],
		'asis': []
	}
}

for img in imgs:
	props=imgs[img]
	type=props['type']
	path=props['path']
	im=Image.open(os.path.join(root,img))
	if props['margin']:
		print props['margin']
		bits=map(int, re.split('[ ]*',props['margin']))
		newim=Image.new('RGBA', (im.size[0]+bits[0]+bits[2], im.size[1]+bits[1]+bits[3]), (0, 0, 0, 0))
		newim.paste(im, (bits[0], bits[1]))
		im=newim
	size=im.size
	if props['repeatY']:
		images[type]['repeatY'].append({
			'img': im,
			'path': path+'.'+type
		})
	elif props['repeatX']:
		images[type]['repeatX'].append({
			'img': im,
			'path': path+'.'+type
		})
	elif props['repeat']:
		images[type]['repeat'].append({
			'img': im,
			'path': path+'.'+type
		})
	elif props['noRepeat']:
		images[type]['noRepeat'].append({
			'img': im,
			'path': path+'.'+type
		})
	elif props['asis']:
		images[type]['asis'].append({
			'img': im,
			'path': path+'[asis]'+'.'+type
		})
	elif props['resizeX']:
		bits=map(int, re.split('[ ]*',props['resizeX']))
		images[type]['repeatX'].append({
			'img': im.crop((bits[0], 0, bits[0]+1, size[1])),
			'path': path+'[c]'+'.'+type
		})
		images[type]['noRepeat'].extend([
			{
				'img': im.crop((0, 0, bits[0] ,size[1])),
				'path': path+'[l]'+'.'+type
			},
			{
				'img': im.crop((size[0]-bits[0], 0, size[0], size[1])),
				'path': path+'[r]'+'.'+type
			}
		])
	elif props['resizeY']:
		bits=map(int, re.split('[ ]*',props['resizeY']))
		images[type]['repeatY'].append({
			'img': im.crop((0, bits[0], size[0], bits[0]+1)),
			'path': path+'[c]'+'.'+type
		})
		images[type]['noRepeat'].extend([
			{
				'img': im.crop((0, 0, size[0] ,bits[0])),
				'path': path+'[t]'+'.'+type
			},
			{
				'img': im.crop((0, size[1]-bits[1], size[0], size[1])),
				'path': path+'[b]'+'.'+type
			}
		])
	elif props['resizeXY']:
		bits=map(int, re.split('[ ]*',props['resizeXY']))
		images[type]['repeatX'].extend([
			{
				'img': im.crop((bits[0], 0, bits[0]+1, bits[1])),
				'path': path+'[t]'+'.'+type
			},
			{
				'img': im.crop((bits[0], size[1]-bits[3], bits[0]+1, size[1])),
				'path': path+'[b]'+'.'+type
			}
		])
		images[type]['repeatY'].extend([
			{
				'img': im.crop((0, bits[1], bits[0], bits[1]+1)),
				'path': path+'[l]'+'.'+type
			},
			{
				'img': im.crop((size[0]-bits[2], bits[1], size[0], bits[1]+1)),
				'path': path+'[r]'+'.'+type
			}
		])
		images[type]['noRepeat'].extend([
			{
				'img': im.crop((0, 0, bits[0], bits[1])),
				'path': path+'[tl]'+'.'+type
			},
			{
				'img': im.crop((size[0]-bits[2], 0, size[0], bits[1])),
				'path': path+'[tr]'+'.'+type
			},
			{
				'img': im.crop((0, size[1]-bits[3], bits[0], size[1])),
				'path': path+'[bl]'+'.'+type
			},
			{
				'img': im.crop((size[0]-bits[2], size[1]-bits[3], size[0], size[1])),
				'path': path+'[br]'+'.'+type
			}
		])
		images[type]['repeat'].append({
			'img': im.crop((bits[0], bits[1], bits[0]+1, bits[1]+1)),
			'path': path+'[c]'+'.'+type
		})
	else:
		images[type]['noRepeat'].append({
			'path':  path+'.'+type,
			'img': im
		})


#mkdir Build
build_dir='../Build'

for type in images:
	folder=build_dir+'/'+type
	try:
		shutil.rmtree(folder)
	except:
		pass
	os.mkdir(folder)
	repeat_types=images[type]
	for rtype in repeat_types:
		os.mkdir(folder+'/'+rtype)
		imgobjs=repeat_types[rtype]
		if rtype=='asis':
			for obj in imgobjs:
				try:
					shutil.move(os.path.join(root, obj['path']) ,folder+'/'+rtype+'/'+obj['path'].replace('/','_'))
				except:
					pass
		elif rtype=='noRepeat':
			maxWidth=0
			totalHeight=0
			for obj in imgobjs:
				size=obj['img'].size
				if size[0]>maxWidth:
					maxWidth=size[0]
				obj['position']=[0, totalHeight]	
				totalHeight=totalHeight+size[1]
			if totalHeight==0:
				pass
			else:
				im=Image.new('RGBA', (maxWidth, totalHeight), (0, 0, 0, 0))
				for obj in imgobjs:
					im.paste(obj['img'], (0, obj['position'][1]))
				im.save(folder+'/'+rtype+'/'+'total.'+'png')
		else:
			for obj in imgobjs:
				obj['img'].save(folder+'/'+rtype+'/'+obj['path'].replace('/','_'))
	