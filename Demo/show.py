#!python

import os, cgi

print "Content-Type: text/html \n\n"


query=cgi.parse_qs(os.environ['QUERY_STRING'])


print query['path'][0]

