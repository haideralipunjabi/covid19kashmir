import jinja2
from cairosvg import svg2png
from PIL import Image

import json
import os
from os import listdir
from os.path import isfile, join, splitext
import requests

EXCLUDE_FILES = ['navbar.html', 'header.html', 'footer.html', '404.html']
API_ENDPOINTS = {
    "API_PATIENTS": "/api/patients/",
    "API_BULLETIN": "/api/bulletin/",
    "API_PHONES": "/api/phones/",
    "API_NEWS":"/api/news/",
    "API_ANALYTICS":"/api/analytics/",
    "API_STORES":"/api/stores/"
}
templateLoader = jinja2.FileSystemLoader(searchpath="./")
templateEnv = jinja2.Environment(loader=templateLoader)
onlyfiles = [f for f in listdir() if splitext(f)[1]==".html"]

URLS = {
    "mythbuster": os.getenv("URL_MYTHBUSTER"),
    "faq": os.getenv("URL_FAQ")
}
SOURCES = {
    "mythbuster": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
    "faq":"https://www.who.int/news-room/q-a-detail/q-a-coronaviruses"
}

def gen_favicons():
    icon_svg = "assets/media/icon.svg"
    manifest = json.load(open("manifest.json","r"))
    icons = manifest["icons"]
    for icon in icons:
        svg2png(url=icon_svg, write_to=icon["src"][1:], parent_width=int(icon["sizes"].split("x")[0]), parent_height=int(icon["sizes"].split("x")[1]))
    Image.open("assets/favicons/icon-512x512.png").save("assets/favicons/favicon.ico")
    template = templateEnv.get_template("favicons.html")
    print(template.render(icons=icons,appname=manifest["short_name"], appcolor=manifest["theme_color"], bgcolor=manifest["background_color"]),file=open("favicons.html","w"))

def gen_static_pages():
    jinja_env = jinja2.Environment(loader=templateLoader, undefined=jinja2.make_logging_undefined(base=jinja2.DebugUndefined))
    template = jinja_env.get_template("templates/who.html")
    for frmt in URLS.keys():
        json_data_mb = requests.get(URLS[frmt]).json()
        sheet_data = json_data_mb["feed"]["entry"]
        data = []
        for row in sheet_data:
            data.append({
                "question": row["gsx$q"]['$t'],
                "answer": row["gsx$a"]["$t"]
            })
        print(template.render(data=data, title=frmt.title(), source=SOURCES[frmt]), file=open(frmt+".html","w"))

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
    toml = open("netlify.toml","w")
    toml.write('''[[redirects]]
    from = "/api/live"
    to = "12"
    status = 200
    force = true
    headers = {Access-Control-Allow-Origin = "*"}
    '''%(os.getenv("API_LIVE")))

gen_favicons()
gen_static_pages()
gen_redirects()
gen_templates()
gen_sitemap()
