import jinja2

templateLoader = jinja2.FileSystemLoader(searchpath="./")
templateEnv = jinja2.Environment(loader=templateLoader)

TEMPLATE_FILE = "index.html"
template = templateEnv.get_template(TEMPLATE_FILE)
print(template.render(),file=open("index.html","w"))
