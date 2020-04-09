import jinja2

import json
import os
from os import listdir
from os.path import isfile, join, splitext

EXCLUDE_FILES = ['navbar.html', 'header.html', 'footer.html', '404.html']

onlyfiles = [f for f in listdir() if splitext(f)[1]==".html"]
templateLoader = jinja2.FileSystemLoader(searchpath="./")
templateEnv = jinja2.Environment(loader=templateLoader)
def gen_templates():
    for f in onlyfiles:
        if EXCLUDE_FILES.__contains__(f):
            continue
        TEMPLATE_FILE = f
        template = templateEnv.get_template(TEMPLATE_FILE)
        print(template.render(),file=open(f,"w"))

def gen_sitemap():
    sitemap_file = open("sitemap.xml","w")
    sitemap_file.write('<?xml version="1.0" encoding="UTF-8"?>')
    sitemap_file.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for f in onlyfiles:
        if EXCLUDE_FILES.__contains__(f):
            continue
        sitemap_file.write(
            '''
            <url>
                <loc>%s</loc>
            </url>
            '''
        %("https://covidkashmir.org/"+f.replace("index","").replace(".html","")))
    sitemap_file.write('</urlset>')
    sitemap_file.close()


def gen_redirects():
    redirects_file = open("_redirects","a")
    for k,v in API_ENDPOINTS.items():
        redirects_file.write("\n%s %s 200"%(v, os.getenv(k)))
    redirects_file.close()


gen_redirects()
gen_templates()
gen_sitemap()