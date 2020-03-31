import jinja2
from cairosvg import svg2png
from PIL import Image

import json
import os
from os import listdir
from os.path import isfile, join, splitext
import requests

templateLoader = jinja2.FileSystemLoader(searchpath="./")
templateEnv = jinja2.Environment(loader=templateLoader)
# url_faq = os.getenv("URL_FAQ")
# url_mb = os.getenv("URL_MB")
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

gen_favicons()
gen_static_pages()