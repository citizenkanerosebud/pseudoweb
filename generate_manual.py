#!/usr/bin/env python3
"""
generate_manual.py — Genera pseudoweb_manual.pdf
Manual de PSeInt + PseudoWeb centrado en los 36 ejercicios.
Lee los enunciados directamente de exercises.js (sin duplicar datos).
"""

import math
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
from reportlab.graphics.shapes import Drawing, Rect, Polygon, String, Line, Circle


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
H4   = S('H4',   fontSize=10, textColor=C_INFO,    fontName='Helvetica-Bold', spaceAfter=3,  spaceBefore=8,  leading=14)
BODY = S('BODY', fontSize=9.5, textColor=C_TEXT, leading=14, alignment=TA_JUSTIFY, spaceAfter=6)
MONO = S('MONO', fontSize=8.5, textColor=C_ACCENT2, fontName='Courier', leading=11, spaceAfter=4)
NOTE = S('NOTE', fontSize=8.5, textColor=C_INFO,  leading=12, leftIndent=10, spaceAfter=4, fontName='Helvetica-Oblique')
WARN = S('WARN', fontSize=8.5, textColor=C_ERR,   leading=12, leftIndent=10, spaceAfter=4, fontName='Helvetica-Oblique')

def P(t, st=BODY): return Paragraph(t, st)
def H(t, lv=1):    return Paragraph(t, [H1, H2, H3, H4][lv - 1])
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


# ── Parser de solutions.js ───────────────────────────────────────────────────
def parse_solutions(text):
    """Extrae las soluciones de solutions.js leyendo el JS como texto.
    Misma estrategia que parse_exercises."""
    id_re = re.compile(r"^\s{4}\{\s*\n\s+id:\s*'([^']+)'", re.MULTILINE)
    starts = [(m.start(), m.group(1)) for m in id_re.finditer(text)]
    out = []
    for i, (pos, sid) in enumerate(starts):
        end = starts[i + 1][0] if i + 1 < len(starts) else len(text)
        chunk = text[pos:end]
        sol = {'id': sid}
        m = re.search(r"codigo:\s*`([^`]+)`", chunk)
        sol['codigo'] = m.group(1).strip() if m else ''
        m = re.search(r"idea:\s*'((?:[^'\\]|\\.)*)'", chunk)
        sol['idea'] = m.group(1) if m else ''
        # truco puede ser null o un string
        m = re.search(r"truco:\s*'((?:[^'\\]|\\.)*)'", chunk)
        sol['truco'] = m.group(1) if m else None
        out.append(sol)
    return out


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
        [_cell('Versión', C_ACCENT, bold=True),  _cell('PseudoWeb v0.8 (sintaxis resaltada con CodeMirror)')],
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
        ('EMPEZAR DESDE CERO', 'Aprende a programar (para iniciarse)'),
        ('  Capítulo 1', '¿Qué es programar? Algoritmo, pseudocódigo y diagrama de flujo'),
        ('  Capítulo 2', 'Las cinco formas del diagrama de flujo'),
        ('  Capítulo 3', 'Las once instrucciones, una a una (con ejemplos y diagramas)'),
        ('  Capítulo 4', 'Tu primer programa completo: ¿Es par o impar?'),
        ('', ''),
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
        ('', ''),
        ('PARTE V', 'Soluciones paso a paso de los 36 ejercicios'),
        ('  ', '36 soluciones de referencia organizadas por los 12 grupos'),
        ('  ', 'Cada solución incluye código pseudocódigo, "Idea" y, si aplica, "Truco"'),
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


# ── Helpers de dibujo de diagramas de flujo ──────────────────────────────────
def make_drawing(w, h):
    """Drawing con fondo oscuro a juego con el tema."""
    d = Drawing(w, h)
    d.add(Rect(0, 0, w, h, fillColor=C_BG, strokeColor=None))
    return d


def _label_in(d, cx, cy, text, color=None, size=8.5, bold=False):
    font = 'Helvetica-Bold' if bold else 'Helvetica'
    d.add(String(cx, cy - size / 3, text,
                 fontName=font, fontSize=size,
                 fillColor=color or C_TEXT, textAnchor='middle'))


def _label_side(d, x, y, text, color=None, size=8, bold=True, anchor='start'):
    font = 'Helvetica-Bold' if bold else 'Helvetica'
    d.add(String(x, y, text,
                 fontName=font, fontSize=size,
                 fillColor=color or C_ACCENT2, textAnchor=anchor))


def oval_shape(d, cx, cy, w, h, text, fill=None, txt_color=None):
    """Óvalo (rectángulo redondeado) para Inicio / Fin."""
    fill = fill if fill is not None else C_ACCENT
    txt_color = txt_color if txt_color is not None else C_BG
    d.add(Rect(cx - w / 2, cy - h / 2, w, h, rx=h / 2, ry=h / 2,
               fillColor=fill, strokeColor=fill))
    _label_in(d, cx, cy, text, color=txt_color, size=9, bold=True)


def rect_shape(d, cx, cy, w, h, text, fill=None, border=None, txt_color=None):
    """Rectángulo para asignaciones, Definir, Dimension..."""
    fill = fill if fill is not None else C_SURFACE2
    border = border if border is not None else C_MUTED
    txt_color = txt_color if txt_color is not None else C_TEXT
    d.add(Rect(cx - w / 2, cy - h / 2, w, h,
               fillColor=fill, strokeColor=border, strokeWidth=1))
    _label_in(d, cx, cy, text, color=txt_color, size=8.5)


def io_shape(d, cx, cy, w, h, text, fill=None, txt_color=None):
    """Paralelogramo para Escribir / Leer (entrada/salida)."""
    fill = fill if fill is not None else C_ACCENT2
    txt_color = txt_color if txt_color is not None else C_BG
    skew = h * 0.4
    pts = [
        cx - w / 2 + skew, cy - h / 2,
        cx + w / 2,        cy - h / 2,
        cx + w / 2 - skew, cy + h / 2,
        cx - w / 2,        cy + h / 2,
    ]
    d.add(Polygon(points=pts, fillColor=fill, strokeColor=fill))
    _label_in(d, cx, cy, text, color=txt_color, size=8.5, bold=True)


def diamond_shape(d, cx, cy, w, h, text, fill=None, border=None, txt_color=None):
    """Rombo para condiciones (Si, Mientras, ...)."""
    fill = fill if fill is not None else C_BG
    border = border if border is not None else C_ACCENT2
    txt_color = txt_color if txt_color is not None else C_ACCENT2
    pts = [cx, cy + h / 2, cx + w / 2, cy, cx, cy - h / 2, cx - w / 2, cy]
    d.add(Polygon(points=pts, fillColor=fill, strokeColor=border, strokeWidth=1.5))
    _label_in(d, cx, cy, text, color=txt_color, size=8.5, bold=True)


def junction(d, cx, cy, r=4):
    """Punto de unión pequeño."""
    d.add(Circle(cx, cy, r, fillColor=C_MUTED, strokeColor=C_MUTED))


def arrow_line(d, x1, y1, x2, y2, label=None, label_offset=(8, 4), color=None):
    """Línea con flecha al final, con etiqueta opcional."""
    color = color if color is not None else C_MUTED
    d.add(Line(x1, y1, x2, y2, strokeColor=color, strokeWidth=1.3))
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return
    ang = math.atan2(dy, dx)
    L = 8
    hx1 = x2 - L * math.cos(ang - 0.4)
    hy1 = y2 - L * math.sin(ang - 0.4)
    hx2 = x2 - L * math.cos(ang + 0.4)
    hy2 = y2 - L * math.sin(ang + 0.4)
    d.add(Polygon(points=[x2, y2, hx1, hy1, hx2, hy2],
                  fillColor=color, strokeColor=color))
    if label:
        ox, oy = label_offset
        d.add(String((x1 + x2) / 2 + ox, (y1 + y2) / 2 + oy, label,
                     fontName='Helvetica-Bold', fontSize=8,
                     fillColor=C_ACCENT2, textAnchor='start'))


def arrow_corner(d, x1, y1, x2, y2, label=None, label_offset=(6, 4), color=None):
    """Flecha en forma de L (sale en horizontal y baja en vertical, o viceversa)."""
    color = color if color is not None else C_MUTED
    # Esquina: primero horizontal, luego vertical
    d.add(Line(x1, y1, x2, y1, strokeColor=color, strokeWidth=1.3))
    d.add(Line(x2, y1, x2, y2, strokeColor=color, strokeWidth=1.3))
    # Flecha al final apuntando hacia abajo (o arriba si y2>y1)
    going_down = y2 < y1
    L = 7
    if going_down:
        d.add(Polygon(points=[x2, y2, x2 - 3, y2 + L, x2 + 3, y2 + L],
                      fillColor=color, strokeColor=color))
    else:
        d.add(Polygon(points=[x2, y2, x2 - 3, y2 - L, x2 + 3, y2 - L],
                      fillColor=color, strokeColor=color))
    if label:
        ox, oy = label_offset
        d.add(String(x1 + (x2 - x1) / 2 + ox, y1 + oy, label,
                     fontName='Helvetica-Bold', fontSize=8,
                     fillColor=C_ACCENT2, textAnchor='start'))


# ── Sección didáctica (EMPEZAR DESDE CERO) ───────────────────────────────────
def parte_didactica(story):
    story.append(H('EMPEZAR DESDE CERO — Aprende a programar'))
    story.append(HR())
    cap_introduccion(story)
    cap_formas_basicas(story)
    cap_instrucciones(story)
    cap_programa_completo(story)


# ── Capítulo 1 ───────────────────────────────────────────────────────────────
def cap_introduccion(story):
    story.append(H('Capítulo 1 — ¿Qué es programar?', 2))
    story.append(P(
        'Un <b>programa</b> es una lista de pasos que el ordenador sigue, uno detrás de otro, '
        'sin equivocarse y a toda velocidad. Tú lo escribes con palabras (en este caso, en español) '
        'y el ordenador lo obedece al pie de la letra.'
    ))
    story.append(P(
        'Imagínate una receta de cocina: "1) coge los huevos, 2) cáscalos en un cuenco, 3) bátelos…". '
        'Un programa es eso, pero en lugar de manejar huevos, maneja <i>datos</i> (números, palabras, '
        'sí o no…).'
    ))
    story.append(H('¿Qué es un algoritmo?', 3))
    story.append(P(
        'Antes de escribir el programa, los programadores piensan el <b>algoritmo</b>: la idea general, '
        'el plan. El algoritmo no depende de ningún ordenador concreto — es la receta. El programa es '
        'esa receta escrita en un idioma que el ordenador entiende.'
    ))
    story.append(H('¿Y el pseudocódigo?', 3))
    story.append(P(
        'El <b>pseudocódigo</b> es un idioma a medio camino: usa palabras en español, pero con reglas '
        'fijas para que sea claro. Es perfecto para aprender, porque te concentras en el <i>pensamiento</i> '
        'sin pelearte con la sintaxis difícil de un lenguaje "de verdad" (como Python, Java o C).'
    ))
    story.append(H('¿Y el diagrama de flujo?', 3))
    story.append(P(
        'El <b>diagrama de flujo</b> es el mismo programa pero dibujado. En vez de leer líneas de texto, '
        'sigues flechas que conectan formas: óvalos, rectángulos, paralelogramos y rombos. Cada forma '
        'representa una cosa distinta. En el siguiente capítulo verás las cinco formas que se usan.'
    ))
    story.append(P(
        'En PseudoWeb puedes escribir tu pseudocódigo y pulsar <b>📊 Diagrama</b> para ver el diagrama '
        'de flujo correspondiente. Y al revés: si entiendes el diagrama, ya casi tienes el programa.',
        NOTE
    ))
    story.append(PageBreak())


# ── Capítulo 2 ───────────────────────────────────────────────────────────────
def cap_formas_basicas(story):
    story.append(H('Capítulo 2 — Las cinco formas del diagrama de flujo', 2))
    story.append(P(
        'Casi cualquier programa se dibuja combinando estas cinco formas. Apréndete su significado y '
        'serás capaz de "leer" cualquier diagrama, por complicado que parezca.'
    ))
    story.append(SP(8))

    # Tabla con las 5 formas (forma a la izquierda, descripción a la derecha)
    def shape_cell(kind):
        d = make_drawing(95, 50)   # encaja en la columna de 3.6 cm (~102 pt)
        if kind == 'oval':
            oval_shape(d, 47, 25, 80, 22, 'Inicio')
        elif kind == 'rect':
            rect_shape(d, 47, 25, 80, 22, 'x ← 5')
        elif kind == 'io':
            io_shape(d, 47, 25, 80, 22, 'Leer x')
        elif kind == 'diamond':
            diamond_shape(d, 47, 25, 80, 30, '¿x > 5?')
        elif kind == 'arrow':
            arrow_line(d, 10, 25, 85, 25)
        return d

    rows = [
        [shape_cell('oval'),    P('<b>Óvalo</b> — Marca el <b>INICIO</b> y el <b>FIN</b> del programa. '
                                  'Cada diagrama empieza con un óvalo "Inicio" y termina con otro "Fin".', BODY)],
        [shape_cell('rect'),    P('<b>Rectángulo</b> — Una <b>operación</b>: una asignación, un cálculo, '
                                  'declarar variables, reservar un array con <font face="Courier">Dimension</font>...', BODY)],
        [shape_cell('io'),      P('<b>Paralelogramo</b> — <b>Entrada o salida</b> de datos. Lo usas para '
                                  '<font face="Courier">Escribir</font> (mostrar algo) o '
                                  '<font face="Courier">Leer</font> (pedir un dato al usuario).', BODY)],
        [shape_cell('diamond'), P('<b>Rombo</b> — Una <b>decisión</b>. Se evalúa una pregunta de sí/no '
                                  '(o de varios valores en el caso de <font face="Courier">Segun</font>) y se '
                                  'sale por la flecha que corresponda.', BODY)],
        [shape_cell('arrow'),   P('<b>Flecha</b> — Indica <b>hacia dónde va</b> la ejecución. El programa '
                                  'siempre sigue las flechas. A veces llevan etiqueta ("Sí", "No", un valor...) '
                                  'para indicar bajo qué condición se toma ese camino.', BODY)],
    ]
    t = Table(rows, colWidths=[3.6 * cm, 13 * cm])
    t.setStyle(TableStyle([
        ('VALIGN',         (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING',    (0, 0), (-1, -1), 0),
        ('RIGHTPADDING',   (0, 0), (-1, -1), 6),
        ('TOPPADDING',     (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING',  (0, 0), (-1, -1), 8),
        ('LINEBELOW',      (0, 0), (-1, -2), 0.3, C_BORDER),
    ]))
    story.append(t)
    story.append(SP(10))
    story.append(P(
        'Además, los diagramas suelen llevar pequeños <b>puntos de unión</b> (círculos rellenos) donde '
        'dos o más flechas se vuelven a juntar tras una decisión. No representan ninguna instrucción, '
        'sólo marcan que la ejecución se "reunifica".',
        NOTE
    ))
    story.append(PageBreak())


# ── Capítulo 3 — Las once instrucciones, una a una ───────────────────────────
def cap_instrucciones(story):
    story.append(H('Capítulo 3 — Las once instrucciones, una a una', 2))
    story.append(P(
        'A continuación tienes cada instrucción explicada con un ejemplo y, cuando aporta, su trozo de '
        'diagrama de flujo. Léelas en orden la primera vez; después puedes consultarlas sueltas.'
    ))
    story.append(SP(6))
    instr_proceso(story)
    instr_definir(story)
    instr_asignar(story)
    instr_escribir(story)
    instr_leer(story)
    instr_si(story)
    instr_segun(story)
    instr_mientras(story)
    instr_repetir(story)
    instr_para(story)
    instr_dimension(story)


def _instr_shape(kind, text, w=160, h=44):
    d = make_drawing(w + 20, h + 16)
    cx, cy = (w + 20) / 2, (h + 16) / 2
    if kind == 'oval':
        oval_shape(d, cx, cy, w, h, text)
    elif kind == 'rect':
        rect_shape(d, cx, cy, w, h, text)
    elif kind == 'io':
        io_shape(d, cx, cy, w, h, text)
    return d


def instr_proceso(story):
    story.append(H('3.1   Proceso / FinProceso', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Es la "envoltura" de tu programa. Como cuando empiezas un cuento con '
        '"Érase una vez…" y lo cierras con "…fin", todo programa empieza con <font face="Courier">'
        'Proceso</font> y acaba con <font face="Courier">FinProceso</font>. El nombre que pones al '
        'lado de <font face="Courier">Proceso</font> no afecta — sirve para que tú sepas de qué va el programa.'
    ))
    story.append(_code_block('Proceso Saludo\n    Escribir "Hola, mundo"\nFinProceso'))
    story.append(P('En el diagrama, esto se dibuja con dos óvalos:'))
    d = make_drawing(420, 120)
    oval_shape(d, 100, 90, 130, 26, 'Inicio Saludo')
    io_shape(d, 250, 90, 130, 26, 'Escribir "Hola, mundo"')
    oval_shape(d, 380, 90, 60, 26, 'Fin')
    arrow_line(d, 165, 90, 185, 90)
    arrow_line(d, 315, 90, 350, 90)
    story.append(d)
    story.append(P('El programa entra por el óvalo izquierdo, ejecuta lo que hay en medio y sale por el de la derecha.', NOTE))
    story.append(SP(6))


def instr_definir(story):
    story.append(H('3.2   Definir … Como tipo', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Le dice al ordenador que vas a usar una <b>variable</b> '
        '(una "caja" con un nombre donde guardar un valor) y de qué <b>tipo</b> es la caja. '
        'Imagínate cada variable como una etiqueta con un nombre pegada a una caja.'
    ))
    tipos_tbl = [
        [_cell('Tipo', C_ACCENT, bold=True), _cell('Qué admite', C_ACCENT, bold=True), _cell('Ejemplos', C_ACCENT, bold=True)],
        [_cell('Entero',  bold=True), _cell('Números sin decimales (positivos o negativos, también 0)'), _cell('5, -3, 100, 0', mono=True)],
        [_cell('Real',    bold=True), _cell('Números con decimales'), _cell('3.14, 2.5, -0.7', mono=True)],
        [_cell('Cadena',  bold=True), _cell('Texto (entre comillas dobles)'), _cell('"Ana", "Hola!"', mono=True)],
        [_cell('Logico',  bold=True), _cell('Sólo dos valores'),                _cell('Verdadero, Falso', mono=True)],
    ]
    story.append(color_table(tipos_tbl, [2.6 * cm, 8.5 * cm, 5.4 * cm]))
    story.append(_code_block(
        'Definir edad Como Entero\n'
        'Definir nombre Como Cadena\n'
        'Definir altura Como Real\n'
        'Definir mayor_de_edad Como Logico\n'
        '\n'
        '// Varias del mismo tipo a la vez:\n'
        'Definir a, b, c Como Entero'
    ))
    story.append(P(
        'En el diagrama, <font face="Courier">Definir</font> es un rectángulo (es una operación):'
    ))
    story.append(_instr_shape('rect', 'Definir edad Como Entero', w=200))
    story.append(SP(6))


def instr_asignar(story):
    story.append(H('3.3   Asignación con  <font face="Courier">&lt;-</font>', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Guardar un valor dentro de una variable. La flecha '
        '<font face="Courier">&lt;-</font> "apunta hacia donde se guarda": '
        '<font face="Courier">x &lt;- 5</font> significa "mete 5 dentro de x".'
    ))
    story.append(P(
        '⚠ <b>No confundas</b> <font face="Courier">&lt;-</font> (asignar) con <font face="Courier">=</font> '
        '(comparar). <font face="Courier">x = 5</font> pregunta "¿x vale 5?"; '
        '<font face="Courier">x &lt;- 5</font> ordena "guarda 5 en x".',
        WARN
    ))
    story.append(_code_block(
        'edad <- 16\n'
        'nombre <- "Ana"\n'
        'suma <- 3 + 4         // suma vale 7\n'
        'doble <- edad * 2     // doble vale 32 (si edad era 16)'
    ))
    story.append(P('En el diagrama: rectángulo con la asignación dentro.'))
    story.append(_instr_shape('rect', 'doble ← edad * 2', w=170))
    story.append(SP(6))


def instr_escribir(story):
    story.append(H('3.4   Escribir', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Muestra algo en la pantalla. Puedes mezclar texto entre comillas y '
        'nombres de variables, separados por comas.'
    ))
    story.append(_code_block(
        'Escribir "Hola"\n'
        'Escribir "Tu edad es: ", edad\n'
        'Escribir nombre, " tiene ", edad, " años"'
    ))
    story.append(P('En el diagrama: paralelogramo (forma inclinada) con lo que se va a mostrar.'))
    story.append(_instr_shape('io', 'Escribir nombre, edad', w=180))
    story.append(SP(6))


def instr_leer(story):
    story.append(H('3.5   Leer', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Pide al usuario que escriba un valor por el teclado, y lo guarda en '
        'una variable. Cuando el programa llega a un <font face="Courier">Leer</font>, '
        '<b>se queda esperando</b> hasta que el usuario teclea algo y pulsa Enter.'
    ))
    story.append(_code_block(
        'Definir edad Como Entero\n'
        'Escribir "¿Cuántos años tienes?"\n'
        'Leer edad\n'
        'Escribir "Tienes ", edad, " años"'
    ))
    story.append(P('Misma forma que <font face="Courier">Escribir</font> (paralelogramo), pero con "Leer":'))
    story.append(_instr_shape('io', 'Leer edad', w=120))
    story.append(SP(6))


def instr_si(story):
    story.append(H('3.6   Si / SiNo / FinSi   —  decisión simple', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Permite que el programa <b>tome decisiones</b>: si una condición '
        'se cumple hace una cosa; si no, hace otra. La parte <font face="Courier">SiNo</font> es opcional.'
    ))
    story.append(_code_block(
        'Definir edad Como Entero\n'
        'Leer edad\n'
        'Si edad >= 18 Entonces\n'
        '    Escribir "Mayor de edad"\n'
        'SiNo\n'
        '    Escribir "Menor de edad"\n'
        'FinSi'
    ))

    story.append(H('Operadores que puedes usar en la condición', 4))
    ops_tbl = [
        [_cell('Operadores de comparación', C_ACCENT, bold=True), _cell('Operadores lógicos', C_ACCENT, bold=True)],
        [_cell('= igual a            <> distinto de\n< menor que          > mayor que\n<= menor o igual     >= mayor o igual', mono=True, size=8),
         _cell('Y    cond1 Y cond2   (ambas)\nO    cond1 O cond2   (al menos una)\nNO   NO cond         (lo contrario)', mono=True, size=8)],
    ]
    story.append(color_table(ops_tbl, [8 * cm, 8.5 * cm]))

    story.append(H('Diagrama paso a paso', 4))
    d = make_drawing(440, 220)
    diamond_shape(d, 220, 180, 130, 50, 'edad ≥ 18')
    io_shape(d, 100, 95, 140, 28, 'Escribir "Mayor"')
    io_shape(d, 340, 95, 140, 28, 'Escribir "Menor"')
    junction(d, 220, 30)
    # Flechas
    arrow_line(d, 175, 162, 110, 112, label='Sí', label_offset=(-22, 8))
    arrow_line(d, 265, 162, 330, 112, label='No', label_offset=(8, 8))
    arrow_line(d, 100, 81, 215, 35)
    arrow_line(d, 340, 81, 225, 35)
    story.append(d)
    story.append(P(
        '<b>Cómo se lee:</b>'
    ))
    pasos_si = [
        '1) El programa llega al <b>rombo</b> y evalúa la condición <font face="Courier">edad ≥ 18</font>.',
        '2) Si es CIERTA, sigue la flecha "<b>Sí</b>" hacia la izquierda y ejecuta <font face="Courier">Escribir "Mayor"</font>.',
        '3) Si es FALSA, sigue la flecha "<b>No</b>" hacia la derecha y ejecuta <font face="Courier">Escribir "Menor"</font>.',
        '4) Las dos ramas se vuelven a juntar en el <b>punto de unión</b> de abajo y el programa continúa con lo que haya después del <font face="Courier">FinSi</font>.',
    ]
    for ps in pasos_si:
        story.append(P('  ' + ps))
    story.append(SP(6))


def instr_segun(story):
    story.append(H('3.7   Segun … Hacer / FinSegun  —  decisión múltiple', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Cuando una variable puede tener varios valores y queremos hacer algo '
        'distinto para cada uno. Es un <font face="Courier">Si</font> con muchas ramas. Más limpio que '
        'encadenar varios <font face="Courier">Si…SiNo Si…SiNo</font>.'
    ))
    story.append(_code_block(
        'Definir dia Como Entero\n'
        'Leer dia\n'
        'Segun dia Hacer\n'
        '    1: Escribir "Lunes"\n'
        '    2: Escribir "Martes"\n'
        '    3: Escribir "Miércoles"\n'
        '    6, 7: Escribir "Fin de semana"\n'
        '    De Otro Modo: Escribir "Día no válido"\n'
        'FinSegun'
    ))
    story.append(P(
        'Cada caso lleva el valor o valores (separados por coma), dos puntos y la instrucción. '
        '<font face="Courier">De Otro Modo</font> es opcional y se ejecuta cuando no coincide ningún caso.'
    ))
    story.append(H('Diagrama', 4))
    d = make_drawing(460, 200)
    diamond_shape(d, 80, 160, 110, 50, 'Segun dia')
    # Salidas a las 5 ramas
    io_shape(d, 250, 175, 120, 24, 'Escribir "Lunes"')
    io_shape(d, 250, 145, 120, 24, 'Escribir "Martes"')
    io_shape(d, 250, 115, 130, 24, 'Escribir "Miércoles"')
    io_shape(d, 250, 85,  150, 24, 'Escribir "Fin de semana"')
    io_shape(d, 250, 55,  150, 24, 'Escribir "Día no válido"')
    junction(d, 440, 115)
    # Flechas
    arrow_line(d, 135, 175, 190, 175, label='1', label_offset=(-22, 5))
    arrow_line(d, 135, 160, 190, 145, label='2', label_offset=(-22, 5))
    arrow_line(d, 135, 145, 185, 115, label='3', label_offset=(-22, 0))
    arrow_line(d, 135, 130, 175, 85, label='6,7', label_offset=(-26, -3))
    arrow_line(d, 80, 135, 175, 55, label='otro', label_offset=(-22, -8))
    arrow_line(d, 310, 175, 430, 122)
    arrow_line(d, 310, 145, 432, 118)
    arrow_line(d, 320, 115, 432, 115)
    arrow_line(d, 325, 85,  432, 110)
    arrow_line(d, 325, 55,  432, 108)
    story.append(d)
    story.append(P(
        '<b>Cómo se lee:</b> el rombo evalúa <font face="Courier">dia</font>. '
        'Según su valor sale por una flecha (1, 2, 3, 6/7…) o por "otro" si no coincide. '
        'Todas las ramas se reúnen al final y el programa continúa.',
        NOTE
    ))
    story.append(SP(6))


def instr_mientras(story):
    story.append(H('3.8   Mientras … Hacer / FinMientras  —  bucle con condición al inicio', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Repite un bloque <b>mientras</b> se cumpla una condición. '
        'Comprueba la condición <i>antes</i> de cada repetición. Si la condición ya es falsa la primera '
        'vez, el cuerpo del bucle <b>no se ejecuta ni una vez</b>.'
    ))
    story.append(_code_block(
        'Definir i Como Entero\n'
        'i <- 1\n'
        'Mientras i <= 10 Hacer\n'
        '    Escribir i\n'
        '    i <- i + 1\n'
        'FinMientras'
    ))
    story.append(P(
        '⚠ Asegúrate de que algo cambia dentro del bucle para que la condición acabe siendo falsa. '
        'Si no, tu programa se queda repitiendo para siempre (bucle infinito).',
        WARN
    ))
    story.append(H('Diagrama paso a paso', 4))
    d = make_drawing(440, 240)
    rect_shape(d, 220, 215, 90, 26, 'i ← 1')
    diamond_shape(d, 220, 160, 130, 50, 'i ≤ 10')
    io_shape(d, 220, 100, 140, 26, 'Escribir i')
    rect_shape(d, 220, 60,  130, 26, 'i ← i + 1')
    junction(d, 380, 160)
    # Flechas principales (verticales)
    arrow_line(d, 220, 202, 220, 185)
    arrow_line(d, 220, 135, 220, 113, label='Sí', label_offset=(8, -8))
    arrow_line(d, 220, 87,  220, 73)
    # Salida derecha (No)
    arrow_line(d, 285, 160, 365, 160, label='No', label_offset=(0, 6))
    arrow_line(d, 380, 160, 380, 30)
    arrow_line(d, 380, 30, 240, 30)   # placeholder; flecha hacia el siguiente bloque
    # Bucle de retorno (flecha de regreso al rombo)
    d.add(Line(220, 60 - 13, 130, 60 - 13, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Line(130, 60 - 13, 130, 160, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Line(130, 160, 155, 160, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Polygon(points=[155, 160, 148, 157, 148, 163], fillColor=C_ACCENT2, strokeColor=C_ACCENT2))
    d.add(String(110, 100, 'vuelve', fontSize=7, fillColor=C_ACCENT2, fontName='Helvetica-Oblique', textAnchor='middle'))
    story.append(d)
    pasos_m = [
        '1) Se inicializa la variable de control: <font face="Courier">i ← 1</font>.',
        '2) Se llega al <b>rombo</b> y se comprueba la condición <font face="Courier">i ≤ 10</font>.',
        '3) Si es CIERTA (Sí): se ejecuta el cuerpo del bucle (Escribir i; i ← i+1).',
        '4) <b>Al terminar el cuerpo, la flecha amarilla VUELVE al rombo</b> (no continúa hacia abajo). Se vuelve a comprobar.',
        '5) Cuando la condición pasa a ser FALSA (No), el bucle termina y el programa sigue por la salida derecha.',
    ]
    for ps in pasos_m:
        story.append(P('  ' + ps))
    story.append(SP(6))


def instr_repetir(story):
    story.append(H('3.9   Repetir … Hasta Que  —  bucle con condición al final', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Como <font face="Courier">Mientras</font>, pero comprueba la '
        'condición <b>al final</b>. Eso significa que el cuerpo <b>siempre se ejecuta al menos una vez</b>.'
    ))
    story.append(P(
        '⚠ Atención: la condición de <font face="Courier">Repetir</font> es de <b>SALIDA</b>. '
        'Cuando se cumple, el bucle <b>TERMINA</b> (al revés que en Mientras).',
        WARN
    ))
    story.append(_code_block(
        'Definir pwd Como Cadena\n'
        'Repetir\n'
        '    Escribir "Introduce la contraseña:"\n'
        '    Leer pwd\n'
        'Hasta Que pwd = "secreto"\n'
        'Escribir "Acceso permitido"'
    ))
    story.append(H('Diagrama paso a paso', 4))
    d = make_drawing(440, 220)
    junction(d, 220, 190)
    io_shape(d, 220, 150, 200, 26, 'Escribir "Introduce..."')
    io_shape(d, 220, 110, 130, 26, 'Leer pwd')
    diamond_shape(d, 220, 60, 140, 50, 'pwd = "secreto"')
    junction(d, 380, 60)
    # Flechas dentro
    arrow_line(d, 220, 180, 220, 163)
    arrow_line(d, 220, 137, 220, 123)
    arrow_line(d, 220, 97,  220, 85)
    # Salida "Sí" hacia la derecha
    arrow_line(d, 290, 60, 365, 60, label='Sí', label_offset=(0, 6))
    # Bucle "No" (vuelve al inicio)
    d.add(Line(150, 60, 80, 60, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Line(80, 60, 80, 190, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Line(80, 190, 205, 190, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Polygon(points=[205, 190, 197, 187, 197, 193], fillColor=C_ACCENT2, strokeColor=C_ACCENT2))
    d.add(String(100, 130, 'No (vuelve)', fontSize=7, fillColor=C_ACCENT2, fontName='Helvetica-Oblique', textAnchor='middle'))
    story.append(d)
    pasos_r = [
        '1) Se entra directamente al cuerpo (no hay condición previa).',
        '2) Se ejecutan las instrucciones del cuerpo: Escribir, Leer…',
        '3) Se llega al <b>rombo</b> de abajo y se comprueba <font face="Courier">pwd = "secreto"</font>.',
        '4) Si CIERTA (Sí): se sale del bucle.',
        '5) Si FALSA (No): la flecha amarilla vuelve al INICIO del cuerpo y se repite.',
    ]
    for ps in pasos_r:
        story.append(P('  ' + ps))
    story.append(SP(6))


def instr_para(story):
    story.append(H('3.10  Para … Hasta … Hacer / FinPara  —  bucle por contador', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Repite un bloque un número <b>fijo</b> de veces, usando una variable '
        'contador. Es el bucle más típico cuando sabes exactamente cuántas iteraciones quieres.'
    ))
    story.append(_code_block(
        'Definir i Como Entero\n'
        'Para i <- 1 Hasta 10 Hacer\n'
        '    Escribir i\n'
        'FinPara\n'
        '\n'
        '// Con paso negativo (cuenta atrás del 5 al 1):\n'
        'Para i <- 5 Hasta 1 Con Paso -1 Hacer\n'
        '    Escribir i\n'
        'FinPara'
    ))
    story.append(P(
        'Por defecto el paso es <font face="Courier">+1</font>. Con <font face="Courier">Con Paso n</font> '
        'puedes contar de 2 en 2, de 10 en 10, o hacia atrás con un paso negativo.'
    ))
    story.append(H('Diagrama paso a paso', 4))
    d = make_drawing(440, 260)
    rect_shape(d, 220, 230, 110, 26, 'i ← 1')
    diamond_shape(d, 220, 175, 130, 50, 'i ≤ 10')
    io_shape(d, 220, 115, 130, 26, 'Escribir i')
    rect_shape(d, 220, 75,  130, 26, 'i ← i + 1')
    junction(d, 380, 175)
    # Flechas
    arrow_line(d, 220, 217, 220, 200)
    arrow_line(d, 220, 150, 220, 128, label='Sí', label_offset=(8, -8))
    arrow_line(d, 220, 102, 220, 88)
    arrow_line(d, 285, 175, 365, 175, label='No', label_offset=(0, 6))
    # Retorno del incremento al rombo
    d.add(Line(220, 75 - 13, 130, 75 - 13, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Line(130, 75 - 13, 130, 175, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Line(130, 175, 155, 175, strokeColor=C_ACCENT2, strokeWidth=1.3))
    d.add(Polygon(points=[155, 175, 148, 172, 148, 178], fillColor=C_ACCENT2, strokeColor=C_ACCENT2))
    story.append(d)
    pasos_para = [
        '1) <b>Inicialización</b>: la variable contador toma su valor inicial (en el ejemplo, i ← 1).',
        '2) Se llega al rombo y se comprueba si i ≤ valor_final. Si NO, sale por la derecha y termina.',
        '3) Si SÍ: se ejecuta el cuerpo (Escribir i).',
        '4) Al terminar el cuerpo, <b>se incrementa el contador</b> (i ← i + paso).',
        '5) Vuelve al rombo y se repite.',
    ]
    for ps in pasos_para:
        story.append(P('  ' + ps))
    story.append(SP(6))


def instr_dimension(story):
    story.append(H('3.11  Dimension v[N]  —  arreglos / vectores', 3))
    story.append(P(
        '<b>¿Para qué sirve?</b> Crea una "caja con muchos compartimentos" — un <b>vector</b> '
        '(o arreglo). En lugar de tener variables sueltas para cada valor, las agrupas todas bajo '
        'un solo nombre y las accedes por número (<b>índice</b>).'
    ))
    story.append(P(
        '⚠ En PSeInt, los índices van de <b>1 a N</b> (no de 0 como en otros lenguajes).',
        WARN
    ))
    story.append(_code_block(
        'Definir i Como Entero\n'
        'Dimension notas[5]\n'
        '\n'
        'Para i <- 1 Hasta 5 Hacer\n'
        '    Escribir "Nota del alumno ", i, ":"\n'
        '    Leer notas[i]\n'
        'FinPara'
    ))
    story.append(P('Ahora <font face="Courier">notas[1]</font>, <font face="Courier">notas[2]</font>, …, <font face="Courier">notas[5]</font> son cinco "cajas" independientes a las que puedes acceder por índice.'))
    story.append(P('En el diagrama, <font face="Courier">Dimension</font> es un rectángulo más:'))
    story.append(_instr_shape('rect', 'Dimension notas[5]', w=170))
    story.append(PageBreak())


# ── Capítulo 4 — Tu primer programa completo ─────────────────────────────────
def cap_programa_completo(story):
    story.append(H('Capítulo 4 — Tu primer programa completo', 2))
    story.append(P(
        'Vamos a juntar todo lo aprendido en un programa pequeño pero completo: '
        '<b>"¿Es par o impar?"</b>. El programa pide un número y dice si es par o impar.'
    ))
    story.append(H('Cómo se piensa el algoritmo', 3))
    pasos_algoritmo = [
        '1. Pedir al usuario un número entero.',
        '2. Calcular el resto al dividir entre 2 (el operador <font face="Courier">MOD</font>).',
        '3. Si el resto es 0 → es par. Si no → es impar.',
        '4. Mostrar el resultado.',
    ]
    for ps in pasos_algoritmo:
        story.append(P('  ' + ps))

    story.append(H('El pseudocódigo', 3))
    story.append(_code_block(
        'Proceso ParImpar\n'
        '    Definir n Como Entero\n'
        '    Escribir "Introduce un número entero:"\n'
        '    Leer n\n'
        '    Si n MOD 2 = 0 Entonces\n'
        '        Escribir n, " es PAR"\n'
        '    SiNo\n'
        '        Escribir n, " es IMPAR"\n'
        '    FinSi\n'
        'FinProceso'
    ))

    story.append(H('El diagrama de flujo', 3))
    d = make_drawing(460, 380)
    oval_shape(d, 230, 360, 130, 26, 'Inicio ParImpar')
    rect_shape(d, 230, 315, 150, 26, 'Definir n Como Entero')
    io_shape(d, 230, 270, 180, 26, 'Escribir "Introduce..."')
    io_shape(d, 230, 230, 130, 26, 'Leer n')
    diamond_shape(d, 230, 175, 150, 56, 'n MOD 2 = 0')
    io_shape(d, 100, 90, 130, 26, 'Escribir "PAR"')
    io_shape(d, 360, 90, 140, 26, 'Escribir "IMPAR"')
    junction(d, 230, 35)
    oval_shape(d, 230, 10, 60, 22, 'Fin')
    # Flechas
    arrow_line(d, 230, 347, 230, 328)
    arrow_line(d, 230, 302, 230, 283)
    arrow_line(d, 230, 257, 230, 243)
    arrow_line(d, 230, 217, 230, 203)
    arrow_line(d, 175, 153, 110, 105, label='Sí', label_offset=(-22, 8))
    arrow_line(d, 285, 153, 350, 105, label='No', label_offset=(8, 8))
    arrow_line(d, 100, 76, 220, 40)
    arrow_line(d, 360, 76, 240, 40)
    arrow_line(d, 230, 30, 230, 22)
    story.append(d)

    story.append(H('Recorrido del diagrama paso a paso', 3))
    pasos_completo = [
        '1) Entramos por el óvalo <b>Inicio ParImpar</b>.',
        '2) Reservamos la variable <font face="Courier">n</font> de tipo Entero.',
        '3) El paralelogramo <font face="Courier">Escribir "Introduce..."</font> muestra el mensaje.',
        '4) El paralelogramo <font face="Courier">Leer n</font> espera a que el usuario introduzca un número.',
        '5) El rombo evalúa <font face="Courier">n MOD 2 = 0</font>.',
        '6) Si la condición es CIERTA (rama "Sí"): muestra que es PAR.',
        '7) Si es FALSA (rama "No"): muestra que es IMPAR.',
        '8) Las dos ramas se reúnen en el punto de unión.',
        '9) Salimos por el óvalo <b>Fin</b>.',
    ]
    for ps in pasos_completo:
        story.append(P('  ' + ps))
    story.append(SP(8))
    story.append(P(
        'Ahora cárgalo en <b>PseudoWeb</b>: pulsa "+ Nuevo" y escríbelo, o pega esto en el editor. '
        'Pulsa <font face="Courier">▶ Ejecutar</font> y prueba con varios números. Después pulsa '
        '<font face="Courier">📊 Diagrama</font> y compara el diagrama que genera la app con el que '
        'acabas de ver aquí — verás que es el mismo.',
        NOTE
    ))
    story.append(PageBreak())


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
        f'PseudoWeb · Manual del alumno · v0.8 · {datetime.date.today().strftime("%d/%m/%Y")}',
        ParagraphStyle('foot', fontSize=8, textColor=C_MUTED, alignment=TA_CENTER)
    ))


# ── Parte V — Soluciones paso a paso ─────────────────────────────────────────
def parte_5_soluciones(story, solutions, exercises):
    """Imprime las 36 soluciones de referencia, una por ejercicio, agrupadas
    por el grupo del ejercicio."""
    story.append(H('PARTE V — Soluciones paso a paso de los 36 ejercicios'))
    story.append(HR())
    story.append(P(
        'Esta parte está pensada como <b>libro de respuestas</b>. Si te quedas atascado en un '
        'ejercicio, busca aquí su solución de referencia. Pero <b>úsala como último recurso</b>: '
        'el aprendizaje real ocurre cuando peleas con el problema y descubres tú la solución, '
        'no cuando la copias.'
    ))
    story.append(P(
        'Cada solución incluye: el código pseudocódigo completo (probado: pasa los 10 casos del '
        'grader), una <b>"Idea"</b> con el enfoque algorítmico en una o dos frases y, cuando aplica, '
        'un <b>"Truco"</b> con una observación útil que es fácil pasar por alto.',
        NOTE
    ))

    # Mapa id → ejercicio (para tener título y grupo)
    by_id = {ex['id']: ex for ex in exercises}

    # Agrupa por grupo
    grupos = {}
    for s in solutions:
        ex = by_id.get(s['id'])
        if not ex:
            continue
        grupos.setdefault(ex['grupo'], []).append((ex, s))

    for grupo in sorted(grupos.keys()):
        story.append(H(grupo, 2))
        for ex, s in grupos[grupo]:
            _render_solucion(story, ex, s)
        story.append(SP(6))


def _render_solucion(story, ex, sol):
    """Una solución: título + bloque de código + Idea + (Truco si aplica)."""
    bloque = []
    bloque.append(Paragraph(
        f'<b>{ex["titulo"]}</b>  <font color="#94a3b8" size="8">(id: {ex["id"]} · pasa 10/10 casos)</font>',
        ParagraphStyle('solh', fontSize=11, textColor=C_ACCENT2, leading=14, spaceAfter=4)
    ))
    code_html = sol['codigo'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>')
    bloque.append(Paragraph(
        f'<font face="Courier" size="8" color="#fbbf24">{code_html}</font>',
        ParagraphStyle('solc', leading=11, leftIndent=8,
                       backColor=C_SURFACE, borderPadding=6, spaceAfter=4)
    ))
    if sol.get('idea'):
        bloque.append(Paragraph(
            f'<font face="Helvetica" size="9" color="#86efac"><b>Idea:</b></font> '
            f'<font face="Helvetica" size="9" color="#e2e8f0">{_html_escape(sol["idea"])}</font>',
            ParagraphStyle('soli', leading=12, leftIndent=8, spaceAfter=2)
        ))
    if sol.get('truco'):
        bloque.append(Paragraph(
            f'<font face="Helvetica" size="9" color="#60a5fa"><b>Truco:</b></font> '
            f'<font face="Helvetica" size="9" color="#e2e8f0">{_html_escape(sol["truco"])}</font>',
            ParagraphStyle('solt', leading=12, leftIndent=8, spaceAfter=2)
        ))
    contenido = Table([[bloque]], colWidths=[16.5 * cm])
    contenido.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), C_BG),
        ('LEFTPADDING',   (0, 0), (-1, -1), 10),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 10),
        ('TOPPADDING',    (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBEFORE',    (0, 0), (-1, -1), 3, C_ACCENT2),
        ('LINEBELOW',     (0, 0), (-1, -1), 0.3, C_BORDER),
    ]))
    story.append(KeepTogether(contenido))
    story.append(SP(6))


def _html_escape(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


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

    solutions_path = here / 'solutions.js'
    solutions = []
    if solutions_path.exists():
        sol_text = solutions_path.read_text(encoding='utf-8')
        solutions = parse_solutions(sol_text)
        print(f"Soluciones encontradas: {len(solutions)}")

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
    parte_didactica(story)
    parte_1(story)
    parte_2(story)
    parte_3(story, exercises)
    parte_4(story)
    if solutions:
        parte_5_soluciones(story, solutions, exercises)

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
