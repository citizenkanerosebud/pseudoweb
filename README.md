# PseudoWeb

IDE de pseudocódigo en navegador, **compatible con la sintaxis de PSeInt**, con catálogo de **36 ejercicios corregidos automáticamente**. Sin instalación, sin backend, sin dependencias externas — abre `index.html` con doble clic y listo.

## Para empezar

- **En línea**: visita `https://<usuario>.github.io/pseudoweb/`
- **En local**: clona o descarga el repo y abre `index.html` en cualquier navegador moderno (Firefox, Chrome, Edge, Safari)

## Qué incluye

- **Intérprete completo** de pseudocódigo en español (~720 líneas de JS vanilla)
  - `Proceso/FinProceso`, `Definir`, asignación `<-`, `Escribir`, `Leer`
  - `Si / SiNo / FinSi`, `Segun / FinSegun`, `Mientras`, `Repetir / Hasta Que`, `Para`
  - Arreglos con `Dimension v[N]` (1-indexados)
  - 19 funciones built-in (matemáticas, aleatorias, cadenas) + constante `PI`
  - Errores en español con número de línea
- **38 ejemplos** organizados en 12 grupos didácticos progresivos
- **36 ejercicios** con corrección automática (10 casos por ejercicio → nota sobre 10), persistencia en `localStorage`
- **Manual del alumno** en PDF (20 páginas), generado desde [`generate_manual.py`](generate_manual.py)
- **Suite de 69 tests** automatizados (abre `test.html` en el navegador para verlos)

## Compatibilidad con PSeInt

PseudoWeb implementa un subconjunto razonable de PSeInt:

| Soportado                           | No soportado (por ahora)            |
|---------------------------------   |--------------------------------------|
| Proceso, Definir, Dimension        | Funciones definidas por el usuario   |
| Si, Segun, Mientras, Repetir, Para | Matrices 2D                          |
| 19 funciones built-in              | Depurador paso a paso                |
| Diagrama de flujo automático       | Exportar a C++ y otros lenguajes     |
| Operadores aritméticos + lógicos   |                                      |
| Comentarios `//`                   |                                      |

Si necesitas las funcionalidades del lado derecho, descarga el **PSeInt original** en:
https://pseint.sourceforge.io/

## Estructura del proyecto

```
pseudoweb/
├── index.html              # IDE principal
├── pseint.js               # Lexer + Parser + Interpreter
├── exercises.js            # 36 ejercicios + grader
├── app.js                  # Wiring de la UI + 38 ejemplos
├── style.css               # Tema dark indigo/ámbar
├── test.html               # Suite de 69 tests
├── generate_manual.py      # Generador del PDF (ReportLab)
└── pseudoweb_manual.pdf    # Manual del alumno (20 págs)
```

## Desarrollo

No hay paso de build. Edita los ficheros y recarga el navegador.

Para regenerar el manual PDF:

```bash
python3 generate_manual.py
```

(Requiere ReportLab: `pip install reportlab`.)

Para correr los tests del intérprete y del grader, abre `test.html` en el navegador.

## Licencia

GPL-3.0 — ver [`LICENSE`](LICENSE).

## Créditos

- Inspirado en **PSeInt** de Pablo Novara (https://pseint.sourceforge.io/), software libre desde 2003.
- Tema dark indigo (#818cf8) / ámbar (#fbbf24) para diferenciar del original.
