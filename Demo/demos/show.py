#!python

import os, cgi

print "Content-Type: text/html \n\n"


#query=cgi.parse_qs(os.environ['QUERY_STRING'])


#print query['path'][0]
uri=os.environ['REQUEST_URI']
uri_parts=uri.split('/')
path_parts=uri_parts[-3:-1]
path='/'.join(path_parts)
html=open(path+'/.html').read()

js='<script type="text/javascript" src="/Build/mif.js"></script>'
css='<link rel="stylesheet" href="/Build/mif.css" type="text/css"></link>'
title=path_parts[0]+' &mdash; '+path_parts[1]+'. Mif Demo.'


html=html.replace('{{js}}',js).replace('{{css}}',css).replace('{{title}}',title)
print html

