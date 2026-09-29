import re, json, html, os
base=os.path.dirname(os.path.abspath(__file__))
md=open(os.path.join(base,'..','base-conocimiento','base-de-conocimiento.md'),encoding='utf-8').read()
def inline(t):
    t=html.escape(t,quote=False)
    t=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',t)
    t=re.sub(r'`(.+?)`',r'<code>\1</code>',t)
    t=re.sub(r'(?<!\*)\*(?!\s)(.+?)\*(?!\*)',r'<em>\1</em>',t)
    t=re.sub(r'(https://\S+)',r'<a href="\1">\1</a>',t)
    return t
def bold_lead(a):
    m=re.match(r'^(Sí|No)([.,])',a)
    return ('<strong>%s</strong>%s'%(m.group(1),m.group(2))+a[m.end():]) if m else a
def convert(block):
    out=[];lines=block.strip('\n').split('\n');i=0;ul=[];ol=[];tb=[]
    def flush():
        nonlocal ul,ol,tb
        if ul: out.append('<ul>'+''.join('<li>%s</li>'%inline(x) for x in ul)+'</ul>'); ul=[]
        if ol: out.append('<ol>'+''.join('<li>%s</li>'%inline(x) for x in ol)+'</ol>'); ol=[]
        if tb:
            rows=[r for r in tb if not re.match(r'^\|[\s\-|]+\|$',r)]
            cells=[[c.strip() for c in r.strip('|').split('|')] for r in rows]
            h='<table><thead><tr>'+''.join('<th>%s</th>'%inline(c) for c in cells[0])+'</tr></thead><tbody>'
            h+=''.join('<tr>'+''.join('<td>%s</td>'%inline(c) for c in r)+'</tr>' for r in cells[1:])+'</tbody></table>'
            out.append(h); tb=[]
    pending_h3=False
    for ln in lines:
        if ln.startswith('### '): flush(); out.append('<h3>%s</h3>'%inline(ln[4:])); pending_h3=True; continue
        if ln.startswith('|'): tb.append(ln); continue
        if ln.startswith('- '): ul.append(ln[2:]); continue
        m=re.match(r'^\d+\. (.*)',ln)
        if m: ol.append(m.group(1)); continue
        flush()
        if not ln.strip(): continue
        if pending_h3 and not ln.startswith('*'):
            out.append('<p>%s</p>'%bold_lead(inline(ln)) if False else '<p>%s</p>'%inline_bold(ln)); pending_h3=False; continue
        out.append('<p>%s</p>'%inline(ln))
    flush(); return '\n'.join(out)
def inline_bold(a):
    m=re.match(r'^(Sí|No)([.,])',a)
    if m: return '<strong>%s</strong>%s'%(m.group(1),inline(a[m.end():]) if False else inline(m.group(2)+a[m.end():]))
    return inline(a)
parts=re.split(r'\n## ',md)
sections=[]
for p in parts[1:]:
    title,_,body=p.partition('\n')
    if title.strip().startswith('Pendiente'): continue
    sections.append((title.strip(),'<h2>%s</h2>\n%s'%(inline(title.strip()),convert(body))))
STYLE='body{font-family:Arial,Helvetica,sans-serif;max-width:760px;margin:24px auto;padding:0 16px;color:#0F1D30;line-height:1.55}h1{font-size:26px}h2{font-size:22px;margin-top:32px;border-bottom:2px solid #A33B3B;padding-bottom:4px}h3{font-size:17px;margin:20px 0 4px}p{margin:4px 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:6px 8px;text-align:left}'
def doc(title,inner): return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>%s</title><style>%s</style></head><body><h1>%s</h1>\n%s</body></html>'%(title,STYLE,title,inner)
outdir=os.path.join(base,'texto-enriquecido') if os.path.basename(base)!='texto-enriquecido' else base
for f in os.listdir(outdir):
    if f.endswith('.html'): os.remove(os.path.join(outdir,f))
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower().replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u').replace('ñ','n')).strip('-')[:38].strip('-')
for n,(t,h) in enumerate(sections,1):
    open(os.path.join(outdir,'%02d-%s.html'%(n,slug(t))),'w',encoding='utf-8').write(doc('Twitrans 90 · '+t,h))
open(os.path.join(outdir,'00-todo.html'),'w',encoding='utf-8').write(doc('Twitrans 90 · Base de conocimiento de Javier','\n'.join(h for _,h in sections)))
json.dump([{'t':t,'h':h} for t,h in sections],open('/tmp/claude-0/sp/secciones.json','w'),ensure_ascii=False)
print(len(sections),'secciones')
