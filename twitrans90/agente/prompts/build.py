import re, json, os
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda *p: open(os.path.join(here,*p),encoding='utf-8').read().strip()
P=[{'t':'Javi · Prompt principal','u':'Va en el campo de instrucciones del agente. Sustituye entero al anterior.','x':rd('..','javi','prompt-conversacion.txt')},
   {'t':'Javi · Base de conocimiento','u':'Todo lo que sabe Javi de Twitrans, en texto plano. Va en el campo de conocimiento. Sustituye entera a la anterior.','x':rd('..','javi','prompt-base-de-conocimiento.txt')},
   {'t':'Rol y personalidad','u':'Campo de personalidad o rol del agente.','x':rd('01-rol-y-personalidad.txt')},
   {'t':'Objetivo','u':'Campo de objetivo o meta del agente.','x':rd('02-objetivo.txt')},
   {'t':'Instrucciones generales','u':'Campo de instrucciones generales, si la plataforma lo tiene aparte del prompt principal.','x':rd('03-instrucciones.txt')},
   {'t':'Mensajes de bienvenida','u':'Primer mensaje. Uno con el taller abierto y otro con el taller cerrado.','x':rd('04-bienvenida.txt')}]
p=os.path.join(here,'pagina.html')
s=open(p,encoding='utf-8').read()
s=re.sub(r'var P = \[.*?\];\n',lambda m:'var P = '+json.dumps(P,ensure_ascii=False)+';\n',s,count=1,flags=re.S)
open(p,'w',encoding='utf-8').write(s)
print(len(P),'textos')
