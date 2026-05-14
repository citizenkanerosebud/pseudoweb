// ─────────────────────────────────────────────────────────────────────────────
// PseudoWeb — Wrapper de CodeMirror 6 con la API mínima que necesita app.js.
//
// Estrategia:
//   1. Conserva el <textarea id="editor"> en el DOM (lo oculta).
//   2. Crea un EditorView de CodeMirror en su sitio.
//   3. Expone un objeto-proxy con .value, .focus(), .setSelectionRange(),
//      .scrollTop, .selectionStart/End, .onChange(fn) y .addKeymap([...]).
//
// Si la importación dinámica de CodeMirror falla (sin red, CDN caído, etc.)
// hace un fallback a textarea plano para no romper la app.
//
// API pública:  await window.setupEditor(textareaEl) → EditorWrapper
// ─────────────────────────────────────────────────────────────────────────────

(function () {

    // ── Listas de palabras propias de PSeInt ─────────────────────────────────
    const KEYWORDS = new Set([
        'proceso', 'finproceso', 'algoritmo', 'finalgoritmo',
        'definir', 'como',
        'dimension', 'dimensión',
        'escribir', 'imprimir', 'mostrar',
        'leer',
        'si', 'entonces', 'sino', 'finsi',
        'segun', 'según', 'finsegun', 'finsegún', 'de', 'otro', 'modo',
        'mientras', 'hacer', 'finmientras',
        'repetir', 'que',
        'para', 'hasta', 'con', 'paso', 'finpara',
    ]);
    const TYPES = new Set([
        'numero', 'numérico', 'entero', 'real',
        'caracter', 'cadena', 'texto',
        'logico', 'lógico',
    ]);
    const BUILTINS = new Set([
        'rc', 'raizcuadrada', 'trunc', 'redon', 'redondear', 'abs',
        'ln', 'exp', 'sen', 'cos', 'tan',
        'azar', 'aleatorio',
        'longitud', 'mayusculas', 'minusculas', 'subcadena', 'concatenar',
        'convertiranumero', 'convertiratexto',
    ]);
    const BOOLEANS = new Set(['verdadero', 'falso']);
    const LOGIC_KEYWORDS = new Set(['y', 'o', 'no', 'mod']);
    const CONSTANTS = new Set(['pi']);

    // ── Fallback a textarea (sin CodeMirror) ─────────────────────────────────
    function makeTextareaWrapper(el) {
        // Reactivamos el textarea si estaba oculto
        el.style.display = '';
        const inputCbs = [];
        let userBindings = [];

        el.addEventListener('input', () => inputCbs.forEach(fn => fn()));
        el.addEventListener('keydown', (ev) => {
            // Tab → 4 espacios
            if (ev.key === 'Tab' && !ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
                ev.preventDefault();
                const s = el.selectionStart, e = el.selectionEnd;
                el.value = el.value.substring(0, s) + '    ' + el.value.substring(e);
                el.selectionStart = el.selectionEnd = s + 4;
                el.dispatchEvent(new Event('input'));
                return;
            }
            // Atajos de usuario (Ctrl-Enter, F5...)
            for (const b of userBindings) {
                if (matchKeySpec(b.key, ev)) {
                    ev.preventDefault();
                    if (b.run) b.run();
                    return;
                }
            }
        });

        return {
            _kind: 'textarea',
            get value() { return el.value; },
            set value(v) { el.value = v; el.dispatchEvent(new Event('input')); },
            focus() { el.focus(); },
            setSelectionRange(s, e) { el.setSelectionRange(s, e); },
            get scrollTop() { return el.scrollTop; },
            set scrollTop(v) { el.scrollTop = v; },
            get selectionStart() { return el.selectionStart; },
            get selectionEnd() { return el.selectionEnd; },
            onChange(fn) { inputCbs.push(fn); },
            addKeymap(bindings) { userBindings = userBindings.concat(bindings); },
        };
    }

    function matchKeySpec(spec, ev) {
        const parts = String(spec).split('-');
        const key = parts.pop();
        const ctrl  = parts.includes('Ctrl');
        const shift = parts.includes('Shift');
        const alt   = parts.includes('Alt');
        if (ctrl !== ev.ctrlKey) return false;
        if (shift !== ev.shiftKey) return false;
        if (alt !== ev.altKey) return false;
        return ev.key === key || ev.code === key;
    }

    // ── Setup principal ──────────────────────────────────────────────────────
    window.setupEditor = async function (textareaEl) {
        let cm;
        try {
            // Carga paralela de los módulos de CodeMirror desde esm.sh.
            // Timeout de 6 s para que la app no quede colgada si la red falla.
            const withTimeout = (p, ms) => Promise.race([
                p,
                new Promise((_, rej) => setTimeout(() => rej(new Error('timeout cargando CodeMirror')), ms)),
            ]);
            cm = await Promise.all([
                withTimeout(import('https://esm.sh/codemirror@6'),            6000),
                withTimeout(import('https://esm.sh/@codemirror/view@6'),      6000),
                withTimeout(import('https://esm.sh/@codemirror/state@6'),     6000),
                withTimeout(import('https://esm.sh/@codemirror/commands@6'),  6000),
                withTimeout(import('https://esm.sh/@codemirror/language@6'),  6000),
                withTimeout(import('https://esm.sh/@lezer/highlight@1'),      6000),
            ]);
        } catch (e) {
            console.warn('CodeMirror no se pudo cargar — uso el textarea simple:', e);
            return makeTextareaWrapper(textareaEl);
        }

        const [mainMod, viewMod, stateMod, cmdMod, langMod, hlMod] = cm;
        const { basicSetup, EditorView } = mainMod;
        const { keymap } = viewMod;
        const { EditorState, Compartment } = stateMod;
        const { indentWithTab } = cmdMod;
        const { StreamLanguage, syntaxHighlighting, HighlightStyle, indentUnit } = langMod;
        const { tags: t } = hlMod;

        // ── Lenguaje PSeInt vía StreamLanguage ────────────────────────────────
        const ID_START = /[a-zA-ZáéíóúñÁÉÍÓÚÑ_]/;
        const ID_CONT  = /[a-zA-ZáéíóúñÁÉÍÓÚÑ_0-9]/;

        const pseudoStream = StreamLanguage.define({
            name: 'pseudoweb',
            startState() { return {}; },
            token(stream) {
                if (stream.eatSpace()) return null;
                // Comentarios //...
                if (stream.match(/\/\/.*/)) return 'lineComment';
                // Cadenas "..." o '...'
                if (stream.match(/"(?:[^"\\]|\\.)*"/)) return 'string';
                if (stream.match(/'(?:[^'\\]|\\.)*'/)) return 'string';
                // Números
                if (stream.match(/\d+(?:\.\d+)?/)) return 'number';
                // <- asignación
                if (stream.match('<-'))               return 'definitionOperator';
                if (stream.match(/<=|>=|<>/))         return 'compareOperator';
                if (stream.match(/[+\-*/^=<>()[\],:]/)) return 'operator';
                // Identificador o palabra clave
                if (ID_START.test(stream.peek())) {
                    stream.eatWhile(ID_CONT);
                    const w = stream.current().toLowerCase();
                    if (KEYWORDS.has(w))       return 'controlKeyword';
                    if (TYPES.has(w))          return 'typeName';
                    if (BUILTINS.has(w))       return 'function';
                    if (BOOLEANS.has(w))       return 'atom';
                    if (LOGIC_KEYWORDS.has(w)) return 'logicOperator';
                    if (CONSTANTS.has(w))      return 'constant';
                    return 'variableName';
                }
                stream.next();
                return null;
            },
            tokenTable: {
                controlKeyword:     t.controlKeyword,
                typeName:           t.typeName,
                function:           t.function(t.variableName),
                logicOperator:      t.logicOperator,
                definitionOperator: t.definitionOperator,
                compareOperator:    t.compareOperator,
                constant:           t.standard(t.variableName),
                atom:               t.bool,
            },
            languageData: {
                commentTokens: { line: '//' },
            },
        });

        // ── Tema de color (a juego con la app, indigo + ámbar) ────────────────
        const highlightStyle = HighlightStyle.define([
            { tag: t.controlKeyword,     color: '#818cf8', fontWeight: 'bold' },     // Proceso, Si, Mientras...
            { tag: t.typeName,           color: '#86efac' },                          // Entero, Real, Cadena...
            { tag: t.function(t.variableName), color: '#fbbf24', fontStyle: 'italic' }, // RC, Aleatorio, Longitud
            { tag: t.standard(t.variableName), color: '#60a5fa', fontWeight: 'bold' }, // PI
            { tag: t.bool,               color: '#818cf8', fontWeight: 'bold' },     // Verdadero, Falso
            { tag: t.string,             color: '#fbbf24' },
            { tag: t.number,             color: '#60a5fa' },
            { tag: t.lineComment,        color: '#94a3b8', fontStyle: 'italic' },
            { tag: t.operator,           color: '#e2e8f0' },
            { tag: t.definitionOperator, color: '#fbbf24', fontWeight: 'bold' },     // <-
            { tag: t.compareOperator,    color: '#e2e8f0' },                          // <= >= <>
            { tag: t.logicOperator,      color: '#818cf8', fontWeight: 'bold' },     // Y, O, NO, MOD
            { tag: t.variableName,       color: '#e2e8f0' },
        ]);

        const theme = EditorView.theme({
            '&': {
                height: '100%',
                fontSize: '14px',
                fontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, monospace',
                backgroundColor: '#0d0f1a',
                color: '#e2e8f0',
            },
            '.cm-scroller': {
                overflow: 'auto',
                fontFamily: 'inherit',
            },
            '.cm-content': {
                padding: '14px 6px 14px 6px',
                caretColor: '#fbbf24',
            },
            '.cm-gutters': {
                backgroundColor: '#11131f',
                color: '#475569',
                border: 'none',
                borderRight: '1px solid #303353',
            },
            '.cm-activeLineGutter': {
                backgroundColor: '#1a1d2e',
                color: '#94a3b8',
            },
            '.cm-activeLine': {
                backgroundColor: 'rgba(129, 140, 248, 0.06)',
            },
            '.cm-cursor, .cm-dropCursor': {
                borderLeftColor: '#fbbf24',
                borderLeftWidth: '2px',
            },
            '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
                backgroundColor: '#303353',
            },
            '.cm-matchingBracket, .cm-nonmatchingBracket': {
                outline: '1px solid #fbbf24',
                backgroundColor: 'transparent',
            },
            '.cm-tooltip': {
                backgroundColor: '#1a1d2e',
                border: '1px solid #303353',
                color: '#e2e8f0',
            },
        }, { dark: true });

        // ── Listeners del usuario ─────────────────────────────────────────────
        const changeCbs = [];
        const userKeymapCompartment = new Compartment();
        let userBindings = [];

        const updateListener = EditorView.updateListener.of((upd) => {
            if (upd.docChanged) changeCbs.forEach(fn => fn());
        });

        // ── Crea el view, lo inserta antes del textarea y oculta el textarea ──
        const view = new EditorView({
            state: EditorState.create({
                doc: textareaEl.value || '',
                extensions: [
                    basicSetup,
                    keymap.of([indentWithTab]),
                    indentUnit.of('    '),
                    pseudoStream,
                    syntaxHighlighting(highlightStyle),
                    theme,
                    updateListener,
                    userKeymapCompartment.of(keymap.of([])),
                ],
            }),
        });

        textareaEl.parentNode.insertBefore(view.dom, textareaEl);
        textareaEl.style.display = 'none';

        return {
            _kind: 'codemirror',
            view,
            get value() { return view.state.doc.toString(); },
            set value(v) {
                view.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: String(v ?? '') },
                });
            },
            focus() { view.focus(); },
            setSelectionRange(start, end) {
                const max = view.state.doc.length;
                const a = Math.max(0, Math.min(max, start));
                const b = Math.max(0, Math.min(max, end));
                view.dispatch({ selection: { anchor: a, head: b } });
                view.focus();
            },
            get scrollTop()  { return view.scrollDOM.scrollTop; },
            set scrollTop(v) { view.scrollDOM.scrollTop = v; },
            get selectionStart() { return view.state.selection.main.from; },
            get selectionEnd()   { return view.state.selection.main.to; },
            onChange(fn) { changeCbs.push(fn); },
            addKeymap(bindings) {
                userBindings = userBindings.concat(bindings);
                view.dispatch({
                    effects: userKeymapCompartment.reconfigure(keymap.of(userBindings)),
                });
            },
        };
    };

})();
