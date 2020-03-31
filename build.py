import jinja2
from cairosvg import svg2png
from PIL import Image

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

def gen_favicons():
    icon_svg = "assets/media/icon.svg"
    manifest = json.load(open("manifest.json","r"))
    icons = manifest["icons"]
    for icon in icons:
        svg2png(url=icon_svg, write_to=icon["src"][1:], parent_width=int(icon["sizes"].split("x")[0]), parent_height=int(icon["sizes"].split("x")[1]))
    Image.open("assets/favicons/icon-512x512.png").save("assets/favicons/favicon.ico")
    template = templateEnv.get_template("favicons.html")
    print(template.render(icons=icons,appname=manifest["short_name"], appcolor=manifest["theme_color"], bgcolor=manifest["background_color"]),file=open("favicons.html","w"))

def gen_redirects():
    redirects_file = open("_redirects","a")
    redirects_file.write("/api/patients/ " + os.getenv("API_PATIENT_DATA") + " 200")
    redirects_file.close()

gen_redirects()
gen_favicons()
gen_templates()
gen_sitemap()