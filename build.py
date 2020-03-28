import jinja2
from os import listdir
from os.path import isfile, join, splitext

EXCLUDE_FILES = ['navbar.html', 'header.html', 'footer.html', '404.html']
onlyfiles = [f for f in listdir() if splitext(f)[1]==".html"]
templateLoader = jinja2.FileSystemLoader(searchpath="./")
templateEnv = jinja2.Environment(loader=templateLoader)

for f in onlyfiles:
    if EXCLUDE_FILES.__contains__(f):
        continue
    TEMPLATE_FILE = f
    template = templateEnv.get_template(TEMPLATE_FILE)
    print(template.render(),file=open(f,"w"))