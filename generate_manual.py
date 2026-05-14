#!/usr/bin/env python3
"""
generate_manual.py — Genera pseudoweb_manual.pdf
Manual de PSeInt + PseudoWeb centrado en los 36 ejercicios.
Lee los enunciados directamente de exercises.js (sin duplicar datos).
"""

import re
import datetime
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY


# ── Paleta (mismo dark theme que la app: indigo + ámbar) ────────────────────
C_BG       = colors.HexColor("#0d0f1a")
C_SURFACE  = colors.HexColor("#1a1d2e")
C_SURFACE2 = colors.HexColor("#252840")
C_BORDER   = colors.HexColor("#303353")
C_ACCENT   = colors.HexColor("#818cf8")    # indigo
C_ACCENT2  = colors.HexColor("#fbbf24")    # ámbar
C_OK       = colors.HexColor("#86efac")
C_INFO     = colors.HexColor("#60a5fa")
C_ERR      = colors.HexColor("#f87171")
C_TEXT     = colors.HexColor("#e2e8f0")
C_MUTED    = colors.HexColor("#94a3b8")
C_WHITE    = colors.white

PAGE_W, PAGE_H = A4

# ── Estilos de texto ─────────────────────────────────────────────────────────
BASE = getSampleStyleSheet()
def S(name, **kw): return ParagraphStyle(name, parent=BASE['Normal'], **kw)

H1   = S('H1',   fontSize=22, textColor=C_ACCENT,  fontName='Helvetica-Bold', spaceAfter=12, spaceBefore=18, leading=28)
H2   = S('H2',   fontSize=15, textColor=C_ACCENT2, fontName='Helvetica-Bold', spaceAfter=8,  spaceBefore=14, leading=20)
H3   = S('H3',   fontSize=11, textColor=C_OK,      fontName='Helvetica-Bold', spaceAfter=4,  spaceBefore=10, leading=15)
BODY = S('BODY', fontSize=9.5, textColor=C_TEXT, leading=14, alignment=TA_JUSTIFY, spaceAfter=6)
MONO = S('MONO', fontSize=8.5, textColor=C_ACCENT2, fontName='Courier', leading=11, spaceAfter=4)
NOTE = S('NOTE', fontSize=8.5, textColor=C_INFO,  leading=12, leftIndent=10, spaceAfter=4, fontName='Helvetica-Oblique')
WARN = S('WARN', fontSize=8.5, textColor=C_ERR,   leading=12, leftIndent=10, spaceAfter=4, fontName='Helvetica-Oblique')

def P(t, st=BODY): return Paragraph(t, st)
def H(t, lv=1):    return Paragraph(t, [H1, H2, H3][lv - 1])
def M(t):          return Paragraph(t, MONO)
def SP(n=8):       return Spacer(1, n)
def HR():          return HRFlowable(width="100%", thickness=0.5, color=C_MUTED, spaceAfter=8)


# ── Helpers de tabla ─────────────────────────────────────────────────────────
def _cell(txt, color=None, bold=False, size=8.5, align=TA_LEFT, mono=False):
    font = ('Courier' if mono else 'Helvetica')
    if bold:
        font += '-Bold'
    st = ParagraphStyle(
        'c', fontName=font, fontSize=size,
        textColor=color or C_TEXT, alignment=align,
        leading=size + 3, wordWrap='CJK'
    )
    return Paragraph(str(txt), st)


def _table_style():
    return [
        ('BACKGROUND',    (0, 0), (-1, 0), C_SURFACE),
        ('TEXTCOLOR',     (0, 0), (-1, 0), C_ACCENT),
        ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE',      (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING',    (0, 0), (-1, 0), 6),
        ('ROWBACKGROUNDS',(0, 1), (-1, -1), [C_BG, C_SURFACE]),
        ('TEXTCOLOR',     (0, 1), (-1, -1), C_TEXT),
        ('FONTSIZE',      (0, 1), (-1, -1), 8.5),
        ('GRID',          (0, 0), (-1, -1), 0.3, C_MUTED),
        ('LEFTPADDING',   (0, 0), (-1, -1), 6),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 6),
        ('TOPPADDING',    (0, 1), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
        ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
    ]


def color_table(data, col_widths, extra=None):
    t = Table(data, colWidths=col_widths)
    style = _table_style()
    if extra:
        style.extend(extra)
    t.setStyle(TableStyle(style))
    return t


# ── Parser de exercises.js ───────────────────────────────────────────────────
def parse_exercises(text):
    """Extrae los ejercicios de exercises.js leyendo el JS como texto.
    El parser asume el formato consistente con el que están escritos."""
    # Localiza el inicio de cada ejercicio por su 'id:' al nivel del array
    id_re = re.compile(r"^\s{4}\{\s*\n\s+id:\s*'([^']+)'", re.MULTILINE)
    starts = [(m.start(), m.group(1)) for m in id_re.finditer(text)]
    exercises = []
    for i, (pos, ex_id) in enumerate(starts):
        end = starts[i + 1][0] if i + 1 < len(starts) else len(text)
        chunk = text[pos:end]
        ex = {'id': ex_id}
        m = re.search(r"grupo:\s*'([^']+)'", chunk)
        ex['grupo'] = m.group(1) if m else ''
        m = re.search(r"titulo:\s*'([^']+)'", chunk)
        ex['titulo'] = m.group(1) if m else ''
        m = re.search(r"nota:\s*'([^']*)'", chunk)
        ex['nota'] = m.group(1) if m else None
        m = re.search(r"enunciado:\s*`([^`]+)`", chunk)
        ex['enunciado'] = m.group(1).strip() if m else ''
        m = re.search(r"pistas:\s*\[([^\]]+)\]", chunk, re.DOTALL)
        if m:
            ex['pistas'] = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1))
        else:
            ex['pistas'] = []
        exercises.append(ex)
    return exercises


# ── Secciones del manual ─────────────────────────────────────────────────────
def cover_page(story):
    story.append(SP(60))
    story.append(P('PSEUDOWEB', ParagraphStyle(
        'ct', fontSize=34, textColor=C_ACCENT, fontName='Helvetica-Bold',
        alignment=TA_CENTER, leading=40)))
    story.append(P('Manual del alumno', ParagraphStyle(
        'cs', fontSize=18, textColor=C_ACCENT2, fontName='Helvetica',
        alignment=TA_CENTER, leading=24, spaceBefore=6)))
    story.append(SP(20))
    story.append(P('Compatible con la sintaxis de PSeInt · 36 ejercicios corregidos automáticamente',
                   ParagraphStyle('cs2', fontSize=11, textColor=C_MUTED, fontName='Helvetica-Oblique',
                                  alignment=TA_CENTER)))
    story.append(SP(30))
    story.append(HRFlowable(width='60%', thickness=1, color=C_ACCENT, hAlign='CENTER', spaceAfter=20))
    story.append(SP(40))
    table_data = [
        [_cell('Versión', C_ACCENT, bold=True),  _cell('PseudoWeb v0.6')],
        [_cell('Fecha',   C_ACCENT, bold=True),  _cell(datetime.date.today().strftime('%d / %m / %Y'))],
        [_cell('Idioma',  C_ACCENT, bold=True),  _cell('Español')],
        [_cell('Soporta', C_ACCENT, bold=True),  _cell('Linux · macOS · Windows (vía PSeInt) + cualquier navegador moderno (PseudoWeb)')],
        [_cell('Licencia',C_ACCENT, bold=True),  _cell('Uso educativo')],
    ]
    story.append(color_table(table_data, [4*cm, 12.5*cm]))
    story.append(SP(80))
    story.append(P('Una herramienta para introducir el pensamiento algorítmico en español',
                   ParagraphStyle('cs3', fontSize=10, textColor=C_MUTED, fontName='Helvetica-Oblique',
                                  alignment=TA_CENTER)))
    story.append(PageBreak())


def toc_page(story):
    story.append(H('Índice de contenidos'))
    story.append(SP(6))
    toc = [
        ('PARTE I', 'Sobre PSeInt y PseudoWeb'),
        ('  §1.1', '¿Qué es PSeInt? Descarga oficial para Windows / macOS / Linux'),
        ('  §1.2', '¿Qué es PseudoWeb? Diferencias y ventajas'),
        ('  §1.3', 'Atajos y flujo de trabajo típico'),
        ('', ''),
        ('PARTE II', 'Referencia de sintaxis del pseudocódigo'),
        ('  §2.1', 'Estructura del programa (Proceso/FinProceso)'),
        ('  §2.2', 'Variables y tipos (Definir … Como …)'),
        ('  §2.3', 'Entrada / Salida (Escribir, Leer)'),
        ('  §2.4', 'Operadores aritméticos, relacionales y lógicos'),
        ('  §2.5', 'Estructuras de control (Si, Segun, Mientras, Repetir, Para)'),
        ('  §2.6', 'Arreglos (Dimension)'),
        ('  §2.7', 'Funciones built-in (matemáticas, aleatorias, cadenas)'),
        ('', ''),
        ('PARTE III', 'Catálogo de 36 ejercicios'),
        ('  §3.1', 'Cómo se evalúa: 10 casos por ejercicio, nota sobre 10'),
        ('  §3.2', '① Básico'),
        ('  §3.3', '② Condicional simple'),
        ('  §3.4', '③ Condicional múltiple'),
        ('  §3.5', '④ Bucle Para'),
        ('  §3.6', '⑤ Bucle Mientras'),
        ('  §3.7', '⑥ Algoritmos clásicos'),
        ('  §3.8', '⑦ Listas (Dimension)'),
        ('  §3.9', '⑧ Menús con Segun'),
        ('  §3.10', '⑨ Bucle Repetir / Hasta Que'),
        ('  §3.11', '⑩ Números aleatorios'),
        ('  §3.12', '⑪ Cadenas de texto'),
        ('  §3.13', '⑫ Funciones matemáticas'),
        ('', ''),
        ('PARTE IV', 'Apéndices'),
        ('  §4.1', 'Errores comunes y cómo solucionarlos'),
        ('  §4.2', 'Tabla resumen de constructos'),
    ]
    data = [[_cell(sec, C_ACCENT, bold=True), _cell(title)] for sec, title in toc]
    story.append(Table(data, colWidths=[3*cm, 13.5*cm], style=TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.2, C_BORDER),
        ('VALIGN',    (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING',(0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ])))
    story.append(PageBreak())


def parte_1(story):
    story.append(H('PARTE I — Sobre PSeInt y PseudoWeb'))
    story.append(HR())

    story.append(H('1.1  ¿Qué es PSeInt? Descarga oficial', 2))
    story.append(P(
        'PSeInt (Pseudo-código Intérprete) es un programa de escritorio creado por Pablo Novara '
        'en la Universidad Nacional del Litoral (Argentina, ~2003). Permite escribir, ejecutar y depurar '
        'algoritmos en pseudocódigo en español. Es la herramienta de referencia en cursos universitarios '
        'de introducción a la programación en toda Latinoamérica y España.'
    ))
    story.append(P('Software libre (GPL), multiplataforma. Descarga oficial:'))
    story.append(SP(4))
    descargas = [
        [_cell('Sistema operativo', C_ACCENT, bold=True),
         _cell('Enlace de descarga', C_ACCENT, bold=True),
         _cell('Notas', C_ACCENT, bold=True)],
        [_cell('Windows 7 / 10 / 11', bold=True),
         _cell('<u>sourceforge.net/projects/pseint/files/</u> · busca "Windows"', mono=True, size=7.5),
         _cell('Instalador .exe (~30 MB) o ZIP portable')],
        [_cell('macOS 10.13+', bold=True),
         _cell('<u>sourceforge.net/projects/pseint/files/</u> · busca "MacOS"', mono=True, size=7.5),
         _cell('Archivo .dmg para arrastrar a Aplicaciones')],
        [_cell('Linux x86_64', bold=True),
         _cell('<u>sourceforge.net/projects/pseint/files/</u> · busca "Linux"', mono=True, size=7.5),
         _cell('AppImage portable o .tar.gz. En Fedora: <font face="Courier">sudo dnf install pseint</font> (en algunos repos)')],
        [_cell('Página oficial', bold=True),
         _cell('<u>https://pseint.sourceforge.io/</u>', mono=True, size=7.5),
         _cell('Documentación, capturas, foro de ayuda')],
    ]
    story.append(color_table(descargas, [3.8*cm, 7.0*cm, 5.7*cm]))
    story.append(P(
        'Verifica siempre la integridad del fichero comparando el SHA-256 antes de instalar; '
        'la página de SourceForge publica los hashes oficiales. Evita descargar PSeInt desde sitios '
        'que no sean SourceForge o pseint.sourceforge.io.',
        NOTE
    ))

    story.append(H('1.2  ¿Qué es PseudoWeb?', 2))
    story.append(P(
        'PseudoWeb es un IDE web complementario a PSeInt: se abre con doble clic sobre <font face="Courier">index.html</font> '
        'en cualquier navegador moderno (Firefox, Chrome, Edge, Safari) y no requiere instalación. '
        'Está pensado como apoyo en clase, en aulas sin permisos de instalación, o cuando se trabaja '
        'desde un ordenador prestado.'
    ))
    story.append(P('Diferencias resumidas:'))
    diffs = [
        [_cell('Aspecto', C_ACCENT, bold=True),
         _cell('PSeInt (escritorio)', C_ACCENT, bold=True),
         _cell('PseudoWeb (navegador)', C_ACCENT, bold=True)],
        [_cell('Instalación'), _cell('Sí (Win/macOS/Linux)'), _cell('No: doble clic en HTML')],
        [_cell('Sintaxis'), _cell('Pseudocódigo PSeInt'), _cell('Compatible PSeInt (con limitaciones)')],
        [_cell('Diagrama de flujo'), _cell('Sí, automático'), _cell('No (pendiente)')],
        [_cell('Depurador paso a paso'), _cell('Sí'), _cell('No (pendiente)')],
        [_cell('Funciones definidas por el usuario'), _cell('Sí'), _cell('No (solo built-in)')],
        [_cell('Exportar a C++ y otros lenguajes'), _cell('Sí'), _cell('No')],
        [_cell('Sistema de ejercicios corregidos'), _cell('No nativo'), _cell('Sí: 36 ejercicios, nota 0-10')],
        [_cell('Autoguardado'), _cell('Manual'), _cell('Automático en localStorage')],
    ]
    story.append(color_table(diffs, [4.2*cm, 6*cm, 6.3*cm]))
    story.append(P(
        'Recomendación: usa PSeInt en casa o en aulas con instalación permitida (es más completo); '
        'usa PseudoWeb para practicar ejercicios con corrección automática y para escenarios donde '
        'no puedas instalar nada. La sintaxis es compatible: el código que escribes en uno se ejecuta '
        'casi siempre tal cual en el otro.',
        NOTE
    ))

    story.append(H('1.3  Atajos y flujo de trabajo en PseudoWeb', 2))
    flujo = [
        [_cell('Atajo / botón', C_ACCENT, bold=True), _cell('Qué hace', C_ACCENT, bold=True)],
        [_cell('Ctrl + Enter   ó   F5', mono=True), _cell('Ejecuta el programa actual')],
        [_cell('Tab', mono=True), _cell('Inserta 4 espacios (indentación)')],
        [_cell('Botón "+ Nuevo"'), _cell('Borra el editor y carga la plantilla Proceso/FinProceso')],
        [_cell('Selector "Cargar ejemplo"'), _cell('38 ejemplos en 12 grupos didácticos')],
        [_cell('Botón "📝 Ejercicios"'), _cell('Catálogo de 36 ejercicios con corrección automática')],
        [_cell('Botón "Limpiar salida"'), _cell('Vacía el panel derecho sin afectar al editor')],
        [_cell('Escape (en modales)'), _cell('Cierra el modal abierto')],
    ]
    story.append(color_table(flujo, [4.5*cm, 12*cm]))
    story.append(P(
        'El editor guarda su contenido automáticamente cada 400 ms en el almacenamiento del navegador '
        '(<font face="Courier">localStorage</font>). Si recargas la página o vuelves al día siguiente, '
        'tu último programa sigue ahí.',
        NOTE
    ))
    story.append(PageBreak())


def parte_2(story):
    story.append(H('PARTE II — Referencia de sintaxis'))
    story.append(HR())

    # 2.1 Estructura
    story.append(H('2.1  Estructura del programa', 2))
    story.append(P(
        'Todo programa empieza con <font face="Courier">Proceso NombreDelPrograma</font> y termina con '
        '<font face="Courier">FinProceso</font>. <font face="Courier">Algoritmo/FinAlgoritmo</font> es un alias '
        'aceptado. El nombre del proceso no afecta a la ejecución, pero es buena práctica que describa '
        'la tarea.'
    ))
    story.append(_code_block(
        'Proceso HolaMundo\n'
        '    Escribir "¡Hola, mundo!"\n'
        'FinProceso'
    ))

    # 2.2 Variables y tipos
    story.append(H('2.2  Variables y tipos', 2))
    story.append(P(
        'Las variables se declaran con <font face="Courier">Definir nombre Como Tipo</font>. '
        'Se pueden declarar varias a la vez separadas por coma.'
    ))
    tipos = [
        [_cell('Tipo', C_ACCENT, bold=True), _cell('Valores que admite', C_ACCENT, bold=True), _cell('Ejemplo', C_ACCENT, bold=True)],
        [_cell('Entero', bold=True),   _cell('Números enteros con signo. Truncan al asignar.'), _cell('Definir n Como Entero', mono=True, size=8)],
        [_cell('Real',   bold=True),   _cell('Números con decimales (coma flotante)'), _cell('Definir x Como Real', mono=True, size=8)],
        [_cell('Numero', bold=True),   _cell('Alias genérico para Real'), _cell('Definir y Como Numero', mono=True, size=8)],
        [_cell('Caracter / Cadena / Texto', bold=True), _cell('Cadenas de caracteres entre comillas dobles'), _cell('Definir nombre Como Cadena', mono=True, size=8)],
        [_cell('Logico', bold=True),   _cell('Verdadero o Falso'),    _cell('Definir ok Como Logico', mono=True, size=8)],
    ]
    story.append(color_table(tipos, [3.4*cm, 7.5*cm, 5.6*cm]))
    story.append(P(
        'La asignación se hace con <font face="Courier">&lt;-</font> (no <font face="Courier">=</font>). '
        'Las variables declaradas como <font face="Courier">Entero</font> truncan automáticamente al asignar: '
        '<font face="Courier">n &lt;- 7 / 2</font> deja <font face="Courier">n = 3</font>.',
        NOTE
    ))

    # 2.3 Entrada / Salida
    story.append(H('2.3  Entrada / Salida', 2))
    story.append(P(
        '<font face="Courier">Escribir</font> imprime uno o más valores (separados por comas). '
        '<font face="Courier">Leer</font> espera a que el usuario teclee un valor.'
    ))
    story.append(_code_block(
        'Definir nombre Como Cadena\n'
        'Definir edad   Como Entero\n'
        'Escribir "¿Cómo te llamas?"\n'
        'Leer nombre\n'
        'Escribir "¿Cuántos años tienes?"\n'
        'Leer edad\n'
        'Escribir "Hola, ", nombre, ". Tienes ", edad, " años."'
    ))

    # 2.4 Operadores
    story.append(H('2.4  Operadores', 2))
    ops = [
        [_cell('Categoría', C_ACCENT, bold=True), _cell('Operadores', C_ACCENT, bold=True), _cell('Ejemplo', C_ACCENT, bold=True)],
        [_cell('Aritméticos'),  _cell('+  −  ×  /  ^  MOD', mono=True),         _cell('a MOD b   →   resto de a entre b', mono=True, size=8)],
        [_cell('Relacionales'), _cell('=  &lt;&gt;  &lt;  &gt;  &lt;=  &gt;=', mono=True), _cell('Si a &gt;= 5 Entonces …', mono=True, size=8)],
        [_cell('Lógicos'),      _cell('Y   O   NO', mono=True),                  _cell('Si a &gt; 0 Y b &gt; 0 Entonces …', mono=True, size=8)],
        [_cell('Asignación'),   _cell('&lt;-', mono=True),                       _cell('x &lt;- 5 + 3', mono=True, size=8)],
    ]
    story.append(color_table(ops, [3*cm, 5*cm, 8.5*cm]))
    story.append(P(
        'Precedencia (de mayor a menor): unario " − " · ^ · *, /, MOD · +, − · relacionales · NO · Y · O. '
        'Los paréntesis se evalúan primero — úsalos si dudas.',
        NOTE
    ))

    # 2.5 Estructuras de control
    story.append(H('2.5  Estructuras de control', 2))
    story.append(H('Si / SiNo / FinSi', 3))
    story.append(_code_block(
        'Si edad >= 18 Entonces\n'
        '    Escribir "Mayor de edad"\n'
        'SiNo\n'
        '    Escribir "Menor de edad"\n'
        'FinSi'
    ))
    story.append(H('Segun / FinSegun  —  selector múltiple', 3))
    story.append(_code_block(
        'Segun opcion Hacer\n'
        '    1: Escribir "Uno"\n'
        '    2, 3: Escribir "Dos o tres"\n'
        '    De Otro Modo: Escribir "Cualquier otro"\n'
        'FinSegun'
    ))
    story.append(H('Mientras / FinMientras  —  comprueba al principio', 3))
    story.append(_code_block(
        'i <- 1\n'
        'Mientras i <= 10 Hacer\n'
        '    Escribir i\n'
        '    i <- i + 1\n'
        'FinMientras'
    ))
    story.append(H('Repetir / Hasta Que  —  comprueba al final (se ejecuta ≥ 1 vez)', 3))
    story.append(_code_block(
        'Repetir\n'
        '    Escribir "Introduce 0 para salir:"\n'
        '    Leer n\n'
        'Hasta Que n = 0'
    ))
    story.append(H('Para  —  iteración con contador', 3))
    story.append(_code_block(
        'Para i <- 1 Hasta 10 Hacer\n'
        '    Escribir i\n'
        'FinPara\n\n'
        '// con paso negativo:\n'
        'Para i <- 10 Hasta 1 Con Paso -1 Hacer\n'
        '    Escribir i\n'
        'FinPara'
    ))

    # 2.6 Arreglos
    story.append(H('2.6  Arreglos (Dimension)', 2))
    story.append(P(
        '<font face="Courier">Dimension v[N]</font> reserva memoria para un vector de N elementos. '
        'Los índices van de 1 a N (no de 0 como en muchos lenguajes).'
    ))
    story.append(_code_block(
        'Dimension v[10]\n'
        'Para i <- 1 Hasta 10 Hacer\n'
        '    Leer v[i]\n'
        'FinPara\n'
        '// luego usas v[1], v[2], ..., v[10]'
    ))

    # 2.7 Built-ins
    story.append(H('2.7  Funciones built-in', 2))
    builtins = [
        [_cell('Categoría', C_ACCENT, bold=True), _cell('Funciones', C_ACCENT, bold=True), _cell('Notas', C_ACCENT, bold=True)],
        [_cell('Matemáticas'),
         _cell('RC, Trunc, Redon, Abs, Ln, Exp, Sen, Cos, Tan', mono=True, size=8),
         _cell('Ángulos en radianes')],
        [_cell('Aleatorias'),
         _cell('Azar(N) → 0..N-1<br/>Aleatorio(a, b) → a..b inclusive', mono=True, size=8),
         _cell('Sin semilla controlable')],
        [_cell('Cadenas'),
         _cell('Longitud, Mayusculas, Minusculas, Subcadena(s, i, j), Concatenar, ConvertirANumero, ConvertirATexto', mono=True, size=7.5),
         _cell('Subcadena es 1-indexada e inclusiva')],
        [_cell('Constante'),
         _cell('PI', mono=True),
         _cell('Se usa sin paréntesis')],
    ]
    story.append(color_table(builtins, [2.5*cm, 8*cm, 6*cm]))
    story.append(PageBreak())


def _code_block(code):
    """Bloque de código con fondo y borde."""
    txt = code.replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>')
    para = Paragraph(
        '<font face="Courier" size="8" color="#fbbf24">' + txt + '</font>',
        ParagraphStyle('code_p', leading=11)
    )
    t = Table([[para]], colWidths=[16.5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_SURFACE),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBEFORE', (0, 0), (-1, -1), 2, C_ACCENT),
    ]))
    return KeepTogether([t, SP(6)])


def parte_3(story, exercises):
    story.append(H('PARTE III — Catálogo de 36 ejercicios'))
    story.append(HR())

    # 3.1 Sistema de evaluación
    story.append(H('3.1  Cómo se evalúa cada ejercicio', 2))
    story.append(P(
        'Cada ejercicio tiene 10 casos de prueba (combinaciones de entradas con su salida esperada). '
        'El grader ejecuta tu programa una vez por cada caso, alimentándole las entradas, y compara '
        'la última línea (o las últimas N líneas) de salida con la esperada.'
    ))
    eval_table = [
        [_cell('Aciertos', C_ACCENT, bold=True), _cell('Nota', C_ACCENT, bold=True), _cell('Indicador', C_ACCENT, bold=True)],
        [_cell('10 de 10'), _cell('10 / 10 — perfecto', bold=True), _cell('🟢')],
        [_cell('5 a 9'),    _cell('5..9 / 10 — casi'),   _cell('🟡')],
        [_cell('1 a 4'),    _cell('1..4 / 10 — lejos'),  _cell('🔴')],
        [_cell('Sin intentar'), _cell('— / 10'),         _cell('⚪')],
    ]
    story.append(color_table(eval_table, [4*cm, 7*cm, 5.5*cm]))
    story.append(P(
        'La comparación es estricta: "Suma: 10" no coincide con "suma: 10" (mayúscula) ni con "Suma:10" '
        '(sin espacio). Lee con cuidado el enunciado y respeta los espacios y mayúsculas exactos. '
        'Tu programa SÍ puede imprimir prompts antes (p. ej. "Introduce N:") — solo se evalúa la última línea.',
        NOTE
    ))
    story.append(P(
        'Los ejercicios del grupo ⑩ (Aleatorios) NO comprueban un valor exacto (sería imposible). '
        'Verifican el formato de la salida y que el resultado esté en el rango matemáticamente válido.',
        NOTE
    ))

    # 3.2 a 3.13: los 12 grupos
    grupos = {}
    for ex in exercises:
        grupos.setdefault(ex['grupo'], []).append(ex)

    descripciones_grupo = {
        '① Básico': 'Programas con entrada/salida y una operación aritmética. Ideal para familiarizarse con Definir, Leer y Escribir.',
        '② Condicional simple': 'Un único Si/SiNo. Aprende a leer una condición y decidir entre dos caminos.',
        '③ Condicional múltiple': 'Si encadenados o anidados. Cuando hay más de dos caminos posibles.',
        '④ Bucle Para': 'Iteración cuando sabes de antemano cuántas veces vas a repetir. Ideal para sumas, tablas, factorial.',
        '⑤ Bucle Mientras': 'Iteración cuando NO sabes cuántas veces, sino que dependes de una condición. Patrón centinela.',
        '⑥ Algoritmos clásicos': 'Combinación de bucles y condicionales que resuelven problemas con identidad propia.',
        '⑦ Listas (Dimension)': 'Trabajar con varios valores en un solo vector. Recorrer, buscar, contar.',
        '⑧ Menús con Segun': 'La estructura Segun como selector múltiple, ideal para menús con varias opciones.',
        '⑨ Repetir / Hasta Que': 'Bucle do-while: se ejecuta al menos una vez y comprueba la condición al final. Ideal para validar entradas.',
        '⑩ Números aleatorios': 'Uso de Aleatorio() para simulaciones (dados, monedas, juegos).',
        '⑪ Cadenas de texto': 'Manipulación de texto carácter a carácter con Subcadena, Longitud, Mayusculas, Minusculas.',
        '⑫ Funciones matemáticas': 'Uso de la constante PI y de funciones RC, Redon, Trunc para fórmulas geométricas.',
    }

    grupos_ordenados = sorted(grupos.keys())
    for idx, grupo in enumerate(grupos_ordenados):
        section_num = f'3.{idx + 2}'
        story.append(H(f'{section_num}  {grupo}', 2))
        if grupo in descripciones_grupo:
            story.append(P(descripciones_grupo[grupo]))
        story.append(SP(4))
        for ex in grupos[grupo]:
            _render_ejercicio(story, ex)
            story.append(SP(8))
        story.append(SP(6))


def _render_ejercicio(story, ex):
    """Renderiza un ejercicio: título + enunciado + pistas + (nota si aplica)."""
    bloque = []
    bloque.append(P(f'<b>{ex["titulo"]}</b>  <font color="#94a3b8" size="8">(id: {ex["id"]} · 10 casos)</font>',
                    ParagraphStyle('exh', fontSize=11, textColor=C_ACCENT2, leading=14, spaceAfter=4)))
    enunciado_html = ex['enunciado'].replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>')
    bloque.append(Paragraph(
        f'<font face="Helvetica" size="9" color="#e2e8f0">{enunciado_html}</font>',
        ParagraphStyle('ex_enun', leading=12, spaceAfter=4, leftIndent=8)
    ))
    if ex.get('pistas'):
        pistas_html = '<br/>'.join(f'• {p}' for p in ex['pistas'])
        bloque.append(Paragraph(
            f'<font face="Helvetica" size="8" color="#86efac"><b>Pistas:</b><br/>{pistas_html}</font>',
            ParagraphStyle('ex_pis', leading=11, leftIndent=16, spaceAfter=4)
        ))
    if ex.get('nota'):
        bloque.append(Paragraph(
            f'<font face="Helvetica-Oblique" size="8" color="#60a5fa">ℹ {ex["nota"]}</font>',
            ParagraphStyle('ex_nota', leading=11, leftIndent=8, spaceAfter=2)
        ))
    # Marco
    contenido = Table([[bloque]], colWidths=[16.5*cm])
    contenido.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBEFORE', (0, 0), (-1, -1), 3, C_ACCENT),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, C_BORDER),
    ]))
    story.append(KeepTogether(contenido))


def parte_4(story):
    story.append(PageBreak())
    story.append(H('PARTE IV — Apéndices'))
    story.append(HR())

    story.append(H('4.1  Errores comunes y cómo solucionarlos', 2))
    errores = [
        [_cell('Mensaje del intérprete', C_ACCENT, bold=True),
         _cell('Qué significa', C_ACCENT, bold=True),
         _cell('Solución típica', C_ACCENT, bold=True)],
        [_cell("Variable 'x' usada sin definir", mono=True, size=7.5),
         _cell('Usaste x antes de declararla con Definir, o escribiste mal el nombre'),
         _cell('Añade Definir x Como … al principio del Proceso, o revisa la ortografía')],
        [_cell("Se esperaba ASIGN pero se encontró …", mono=True, size=7.5),
         _cell('Pusiste = en una asignación en lugar de <-'),
         _cell('Cambia x = 5 por x <- 5')],
        [_cell("Se esperaba FINSI pero se encontró EOF", mono=True, size=7.5),
         _cell('Te olvidaste de cerrar un Si con FinSi'),
         _cell('Cuenta los Si/Mientras/Para abiertos y asegúrate de que cada uno tiene su FinSi/FinMientras/FinPara')],
        [_cell("Índice X fuera de rango", mono=True, size=7.5),
         _cell('Accediste a v[i] con i fuera de 1..N donde N es el tamaño del Dimension'),
         _cell('Revisa los límites de tus bucles (Para i <- 1 Hasta N, no Hasta N+1)')],
        [_cell("La condición del Si debe ser lógica", mono=True, size=7.5),
         _cell('En el Si pusiste un número o cadena en lugar de una comparación'),
         _cell('Asegúrate de usar operadores relacionales: Si x &gt; 0 Entonces (no Si x Entonces)')],
        [_cell("Bucle … detenido por seguridad tras 1 000 000 iteraciones", mono=True, size=7.5),
         _cell('Tu Mientras o Repetir nunca termina (la condición no cambia)'),
         _cell('Comprueba que actualizas la variable de control dentro del bucle')],
        [_cell("División por cero", mono=True, size=7.5),
         _cell('Algún cálculo divide entre 0'),
         _cell('Antes de dividir, comprueba con Si que el divisor no es 0')],
        [_cell("Valor no numérico para 'x': \"...\"", mono=True, size=7.5),
         _cell('Declaraste x Como Entero/Real pero el usuario tecleó letras'),
         _cell('Asume que el usuario teclea números válidos, o cambia el tipo a Cadena')],
    ]
    story.append(color_table(errores, [5*cm, 5.5*cm, 6*cm]))

    story.append(H('4.2  Tabla resumen de constructos', 2))
    resumen = [
        [_cell('Constructo', C_ACCENT, bold=True), _cell('Sintaxis', C_ACCENT, bold=True)],
        [_cell('Programa'),       _cell('Proceso Nombre … FinProceso', mono=True, size=8)],
        [_cell('Definir'),        _cell('Definir x, y Como Entero', mono=True, size=8)],
        [_cell('Asignar'),        _cell('x <- expresión', mono=True, size=8)],
        [_cell('Imprimir'),       _cell('Escribir a, b, c', mono=True, size=8)],
        [_cell('Leer'),           _cell('Leer x   |   Leer v[i]', mono=True, size=8)],
        [_cell('Si'),             _cell('Si cond Entonces … SiNo … FinSi', mono=True, size=8)],
        [_cell('Segun'),          _cell('Segun expr Hacer  N: …  De Otro Modo: …  FinSegun', mono=True, size=8)],
        [_cell('Mientras'),       _cell('Mientras cond Hacer … FinMientras', mono=True, size=8)],
        [_cell('Repetir'),        _cell('Repetir … Hasta Que cond', mono=True, size=8)],
        [_cell('Para'),           _cell('Para i <- a Hasta b [Con Paso s] Hacer … FinPara', mono=True, size=8)],
        [_cell('Dimension'),      _cell('Dimension v[N]   //  índices 1..N', mono=True, size=8)],
        [_cell('Comentario'),     _cell('// el resto de la línea es comentario', mono=True, size=8)],
        [_cell('Operadores'),     _cell('+ - * / ^ MOD  =  <>  <  >  <=  >=  Y  O  NO', mono=True, size=8)],
        [_cell('Booleanos'),      _cell('Verdadero   Falso', mono=True, size=8)],
        [_cell('Built-in math'),  _cell('RC  Trunc  Redon  Abs  Ln  Exp  Sen  Cos  Tan  PI', mono=True, size=8)],
        [_cell('Built-in azar'),  _cell('Azar(N)   Aleatorio(a, b)', mono=True, size=8)],
        [_cell('Built-in texto'), _cell('Longitud  Mayusculas  Minusculas  Subcadena  Concatenar', mono=True, size=8)],
    ]
    story.append(color_table(resumen, [3.5*cm, 13*cm]))

    story.append(SP(30))
    story.append(HRFlowable(width='80%', thickness=1, color=C_MUTED, hAlign='CENTER', spaceAfter=10))
    story.append(P(
        f'PseudoWeb · Manual del alumno · v0.6 · {datetime.date.today().strftime("%d/%m/%Y")}',
        ParagraphStyle('foot', fontSize=8, textColor=C_MUTED, alignment=TA_CENTER)
    ))


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    here = Path(__file__).resolve().parent
    exercises_path = here / 'exercises.js'
    if not exercises_path.exists():
        print(f"No encuentro {exercises_path}")
        return 1

    print(f"Leyendo {exercises_path}...")
    text = exercises_path.read_text(encoding='utf-8')
    exercises = parse_exercises(text)
    print(f"Ejercicios encontrados: {len(exercises)}")
    if len(exercises) != 36:
        print(f"⚠  esperaba 36, obtuve {len(exercises)} — revisa el parser")

    out = here / 'pseudoweb_manual.pdf'
    doc = SimpleDocTemplate(
        str(out), pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm,  bottomMargin=2*cm,
        title='PseudoWeb — Manual del alumno',
        author='PseudoWeb',
        subject='Manual de pseudocódigo y catálogo de 36 ejercicios',
    )

    story = []
    cover_page(story)
    toc_page(story)
    parte_1(story)
    parte_2(story)
    parte_3(story, exercises)
    parte_4(story)

    # Fondo oscuro: pintamos un rectángulo de fondo en cada página
    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(C_BG)
        canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        # Pie de página: número de página
        canvas.setFillColor(C_MUTED)
        canvas.setFont('Helvetica', 7)
        canvas.drawCentredString(PAGE_W / 2, 1*cm, f'pág. {doc.page}')
        canvas.restoreState()

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)

    size_kb = out.stat().st_size / 1024
    print(f"\n✓ PDF generado: {out}")
    print(f"  Tamaño: {size_kb:.0f} KB")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
