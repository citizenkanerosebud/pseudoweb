// ─────────────────────────────────────────────────────────────────────────────
// PseudoWeb — Intérprete de pseudocódigo compatible con PSeInt (MVP v0.2)
// Lexer + Parser + Interpreter, vanilla JS, sin dependencias externas.
// API pública:  await runPseudo(sourceCode, { output, input })
//   output(text):     se llama por cada línea que se imprime con Escribir
//   input(label) → Promise<string>:  se llama por cada Leer
//
// Soporta:
//   - Proceso/FinProceso (alias Algoritmo/FinAlgoritmo)
//   - Definir ... Como Numero|Entero|Real|Caracter|Cadena|Texto|Logico
//   - Dimension v[N] (1D, 1-indexado)
//   - Asignación con <-, también v[i] <- expr
//   - Escribir (alias Imprimir, Mostrar), Leer (también Leer v[i])
//   - Si/Entonces/SiNo/FinSi
//   - Segun expr Hacer  N: ...  De Otro Modo: ...  FinSegun
//   - Mientras...Hacer...FinMientras
//   - Repetir ... Hasta Que cond  (do-while: la condición se comprueba al final)
//   - Para i <- a Hasta b [Con Paso s] Hacer...FinPara
//   - Operadores: + - * / ^ MOD = <> < > <= >= Y O NO
//   - Funciones built-in:
//       Matemáticas: RC, Trunc, Redon, Abs, Ln, Exp, Sen, Cos, Tan
//       Aleatorias:  Azar(N), Aleatorio(a, b)
//       Cadenas:     Longitud, Mayusculas, Minusculas, Subcadena(s,i,j),
//                    Concatenar(a,b), ConvertirANumero, ConvertirATexto
//       Constante:   PI (sin paréntesis)
//   - Comentarios // ...
// ─────────────────────────────────────────────────────────────────────────────

const KEYWORDS = {
    'proceso':      'PROCESO',
    'finproceso':   'FINPROCESO',
    'algoritmo':    'PROCESO',
    'finalgoritmo': 'FINPROCESO',
    'definir':      'DEFINIR',
    'como':         'COMO',
    'numero':       'TIPO',
    'numérico':     'TIPO',
    'entero':       'TIPO',
    'real':         'TIPO',
    'caracter':     'TIPO',
    'cadena':       'TIPO',
    'texto':        'TIPO',
    'logico':       'TIPO',
    'lógico':       'TIPO',
    'dimension':    'DIMENSION',
    'dimensión':    'DIMENSION',
    'escribir':     'ESCRIBIR',
    'imprimir':     'ESCRIBIR',
    'mostrar':      'ESCRIBIR',
    'leer':         'LEER',
    'si':           'SI',
    'entonces':     'ENTONCES',
    'sino':         'SINO',
    'finsi':        'FINSI',
    'segun':        'SEGUN',
    'según':        'SEGUN',
    'finsegun':     'FINSEGUN',
    'finsegún':     'FINSEGUN',
    'de':           'DE',
    'otro':         'OTRO',
    'modo':         'MODO',
    'mientras':     'MIENTRAS',
    'hacer':        'HACER',
    'finmientras':  'FINMIENTRAS',
    'repetir':      'REPETIR',
    'que':          'QUE',
    'para':         'PARA',
    'hasta':        'HASTA',
    'con':          'CON',
    'paso':         'PASO',
    'finpara':      'FINPARA',
    'verdadero':    'BOOL',
    'falso':        'BOOL',
    'y':            'Y',
    'o':            'O',
    'no':           'NO',
    'mod':          'MOD',
};

// ── LEXER ────────────────────────────────────────────────────────────────────
function tokenize(src) {
    const tokens = [];
    let i = 0, line = 1, col = 1;
    const isLetter = c => /[a-zA-ZáéíóúñÁÉÍÓÚÑ_]/.test(c);
    const isAlnum  = c => /[a-zA-ZáéíóúñÁÉÍÓÚÑ_0-9]/.test(c);
    const isDigit  = c => /[0-9]/.test(c);

    while (i < src.length) {
        const c = src[i];

        if (c === ' ' || c === '\t' || c === '\r') { i++; col++; continue; }
        if (c === '\n') { i++; line++; col = 1; continue; }
        if (c === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') i++;
            continue;
        }
        if (c === '"' || c === "'") {
            const quote = c; const startLine = line, startCol = col;
            let s = ''; i++; col++;
            while (i < src.length && src[i] !== quote) {
                if (src[i] === '\n') { line++; col = 1; }
                s += src[i]; i++; col++;
            }
            if (i >= src.length) throw new PseudoError(`Cadena sin cerrar`, startLine);
            i++; col++;
            tokens.push({ type: 'STRING', value: s, line: startLine, col: startCol });
            continue;
        }
        if (isDigit(c)) {
            const startCol = col; let s = '';
            while (i < src.length && isDigit(src[i])) { s += src[i]; i++; col++; }
            if (src[i] === '.' && isDigit(src[i + 1])) {
                s += '.'; i++; col++;
                while (i < src.length && isDigit(src[i])) { s += src[i]; i++; col++; }
            }
            tokens.push({ type: 'NUMBER', value: parseFloat(s), line, col: startCol });
            continue;
        }
        if (isLetter(c)) {
            const startCol = col; let s = '';
            while (i < src.length && isAlnum(src[i])) { s += src[i]; i++; col++; }
            const lower = s.toLowerCase();
            if (KEYWORDS[lower]) {
                const type = KEYWORDS[lower];
                let value;
                if (type === 'TIPO')      value = lower;
                else if (type === 'BOOL') value = (lower === 'verdadero');
                else                       value = lower;
                tokens.push({ type, value, line, col: startCol });
            } else {
                tokens.push({ type: 'IDENT', value: s, line, col: startCol });
            }
            continue;
        }
        if (c === '<' && src[i + 1] === '-') { tokens.push({ type: 'ASIGN', line, col }); i += 2; col += 2; continue; }
        if (c === '<' && src[i + 1] === '=') { tokens.push({ type: 'OP', value: '<=', line, col }); i += 2; col += 2; continue; }
        if (c === '>' && src[i + 1] === '=') { tokens.push({ type: 'OP', value: '>=', line, col }); i += 2; col += 2; continue; }
        if (c === '<' && src[i + 1] === '>') { tokens.push({ type: 'OP', value: '<>', line, col }); i += 2; col += 2; continue; }
        if ('+-*/^=<>(),[]:'.includes(c)) {
            tokens.push({ type: 'OP', value: c, line, col }); i++; col++; continue;
        }
        throw new PseudoError(`Carácter inesperado '${c}'`, line);
    }

    tokens.push({ type: 'EOF', line, col });
    return tokens;
}

class PseudoError extends Error {
    constructor(msg, line) {
        super(line !== undefined ? `[Línea ${line}] ${msg}` : msg);
        this.line = line;
    }
}

// ── PARSER ───────────────────────────────────────────────────────────────────
class Parser {
    constructor(tokens) { this.tokens = tokens; this.pos = 0; }

    peek(o = 0)   { return this.tokens[this.pos + o]; }
    advance()     { return this.tokens[this.pos++]; }
    match(t, v)   {
        const tok = this.peek();
        if (tok.type !== t) return false;
        if (v !== undefined && tok.value !== v) return false;
        return true;
    }
    expect(t, v) {
        const tok = this.peek();
        if (!this.match(t, v)) {
            const got = `${tok.type}${tok.value !== undefined ? `(${tok.value})` : ''}`;
            const exp = `${t}${v !== undefined ? `(${v})` : ''}`;
            throw new PseudoError(`Se esperaba ${exp} pero se encontró ${got}`, tok.line);
        }
        return this.advance();
    }

    parse() {
        this.expect('PROCESO');
        const name = this.expect('IDENT').value;
        const body = this.parseStatements(['FINPROCESO']);
        this.expect('FINPROCESO');
        return { type: 'Program', name, body };
    }

    parseStatements(terminators) {
        const stmts = [];
        while (!terminators.includes(this.peek().type) && this.peek().type !== 'EOF') {
            stmts.push(this.parseStatement());
        }
        return stmts;
    }

    parseStatement() {
        const tok = this.peek();
        switch (tok.type) {
            case 'DEFINIR':   return this.parseDefinir();
            case 'DIMENSION': return this.parseDimension();
            case 'ESCRIBIR':  return this.parseEscribir();
            case 'LEER':      return this.parseLeer();
            case 'SI':        return this.parseSi();
            case 'SEGUN':     return this.parseSegun();
            case 'MIENTRAS':  return this.parseMientras();
            case 'REPETIR':   return this.parseRepetir();
            case 'PARA':      return this.parsePara();
            case 'IDENT':     return this.parseAsignacion();
            default:
                throw new PseudoError(
                    `Instrucción no reconocida (${tok.type} ${tok.value ?? ''})`, tok.line);
        }
    }

    parseDefinir() {
        this.expect('DEFINIR');
        const names = [this.expect('IDENT').value];
        while (this.match('OP', ',')) { this.advance(); names.push(this.expect('IDENT').value); }
        this.expect('COMO');
        const tipo = this.expect('TIPO').value;
        return { type: 'Definir', names, tipo };
    }

    parseDimension() {
        const tok = this.expect('DIMENSION');
        const decls = [this.parseDimDecl()];
        while (this.match('OP', ',')) { this.advance(); decls.push(this.parseDimDecl()); }
        return { type: 'Dimension', decls, line: tok.line };
    }
    parseDimDecl() {
        const name = this.expect('IDENT').value;
        this.expect('OP', '[');
        const size = this.parseExpr();
        this.expect('OP', ']');
        return { name, size };
    }

    parseEscribir() {
        const tok = this.expect('ESCRIBIR');
        const args = [this.parseExpr()];
        while (this.match('OP', ',')) { this.advance(); args.push(this.parseExpr()); }
        return { type: 'Escribir', args, line: tok.line };
    }

    parseLeer() {
        const tok = this.expect('LEER');
        const targets = [this.parseLValue()];
        while (this.match('OP', ',')) { this.advance(); targets.push(this.parseLValue()); }
        return { type: 'Leer', targets, line: tok.line };
    }

    parseLValue() {
        const tok = this.expect('IDENT');
        if (this.match('OP', '[')) {
            this.advance();
            const index = this.parseExpr();
            this.expect('OP', ']');
            return { type: 'ArrayLValue', name: tok.value, index, line: tok.line };
        }
        return { type: 'IdentLValue', name: tok.value, line: tok.line };
    }

    parseSi() {
        const tok = this.expect('SI');
        const cond = this.parseExpr();
        this.expect('ENTONCES');
        const thenBody = this.parseStatements(['SINO', 'FINSI']);
        let elseBody = [];
        if (this.match('SINO')) { this.advance(); elseBody = this.parseStatements(['FINSI']); }
        this.expect('FINSI');
        return { type: 'Si', cond, thenBody, elseBody, line: tok.line };
    }

    parseSegun() {
        const tok = this.expect('SEGUN');
        const expr = this.parseExpr();
        if (this.match('HACER')) this.advance();
        const cases = [];
        let defaultCase = null;
        while (!this.match('FINSEGUN')) {
            if (this.match('DE')) {
                this.advance();
                this.expect('OTRO');
                this.expect('MODO');
                this.expect('OP', ':');
                defaultCase = this.parseSegunCaseBody();
            } else {
                const values = [this.parseExpr()];
                while (this.match('OP', ',')) { this.advance(); values.push(this.parseExpr()); }
                this.expect('OP', ':');
                const body = this.parseSegunCaseBody();
                cases.push({ values, body });
            }
        }
        this.expect('FINSEGUN');
        return { type: 'Segun', expr, cases, defaultCase, line: tok.line };
    }
    parseSegunCaseBody() {
        // Un caso termina cuando empieza el siguiente, cuando aparece 'De Otro
        // Modo' o cuando llega 'FinSegun'. Un nuevo caso empieza con:
        //   (NUMBER|STRING) (',' (NUMBER|STRING))* ':'
        const stmts = [];
        while (true) {
            const t = this.peek();
            if (t.type === 'FINSEGUN' || t.type === 'DE' || t.type === 'EOF') break;
            if (this._looksLikeCaseStart()) break;
            stmts.push(this.parseStatement());
        }
        return stmts;
    }

    _looksLikeCaseStart() {
        let i = this.pos;
        const t0 = this.tokens[i];
        if (!t0 || (t0.type !== 'NUMBER' && t0.type !== 'STRING')) return false;
        i++;
        while (i < this.tokens.length) {
            const tk = this.tokens[i];
            if (tk.type === 'OP' && tk.value === ':') return true;
            if (tk.type === 'OP' && tk.value === ',') {
                const tn = this.tokens[i + 1];
                if (tn && (tn.type === 'NUMBER' || tn.type === 'STRING')) {
                    i += 2;
                    continue;
                }
                return false;
            }
            return false;
        }
        return false;
    }

    parseMientras() {
        const tok = this.expect('MIENTRAS');
        const cond = this.parseExpr();
        if (this.match('HACER')) this.advance();
        const body = this.parseStatements(['FINMIENTRAS']);
        this.expect('FINMIENTRAS');
        return { type: 'Mientras', cond, body, line: tok.line };
    }

    parseRepetir() {
        const tok = this.expect('REPETIR');
        const body = this.parseStatements(['HASTA']);
        this.expect('HASTA');
        if (this.match('QUE')) this.advance();   // 'Que' es opcional ("Hasta Que" o "Hasta")
        const cond = this.parseExpr();
        return { type: 'Repetir', body, cond, line: tok.line };
    }

    parsePara() {
        const tok = this.expect('PARA');
        const varname = this.expect('IDENT').value;
        this.expect('ASIGN');
        const from = this.parseExpr();
        this.expect('HASTA');
        const to = this.parseExpr();
        let step = { type: 'Number', value: 1 };
        if (this.match('CON')) { this.advance(); this.expect('PASO'); step = this.parseExpr(); }
        if (this.match('HACER')) this.advance();
        const body = this.parseStatements(['FINPARA']);
        this.expect('FINPARA');
        return { type: 'Para', varname, from, to, step, body, line: tok.line };
    }

    parseAsignacion() {
        const tok = this.peek();
        const target = this.parseLValue();
        this.expect('ASIGN');
        const expr = this.parseExpr();
        return { type: 'Asignacion', target, expr, line: tok.line };
    }

    // ── Expresiones ────────────────────────────────────────────────────────
    parseExpr() { return this.parseOr(); }

    parseOr() {
        let left = this.parseAnd();
        while (this.match('O')) { this.advance(); left = { type: 'BinOp', op: 'O', left, right: this.parseAnd() }; }
        return left;
    }
    parseAnd() {
        let left = this.parseNot();
        while (this.match('Y')) { this.advance(); left = { type: 'BinOp', op: 'Y', left, right: this.parseNot() }; }
        return left;
    }
    parseNot() {
        if (this.match('NO')) { this.advance(); return { type: 'UnaryOp', op: 'NO', expr: this.parseNot() }; }
        return this.parseComp();
    }
    parseComp() {
        let left = this.parseAdd();
        const tok = this.peek();
        if (tok.type === 'OP' && ['=', '<>', '<', '>', '<=', '>='].includes(tok.value)) {
            this.advance();
            return { type: 'BinOp', op: tok.value, left, right: this.parseAdd() };
        }
        return left;
    }
    parseAdd() {
        let left = this.parseMul();
        while (this.match('OP', '+') || this.match('OP', '-')) {
            const op = this.advance().value;
            left = { type: 'BinOp', op, left, right: this.parseMul() };
        }
        return left;
    }
    parseMul() {
        let left = this.parsePow();
        while (this.match('OP', '*') || this.match('OP', '/') || this.match('MOD')) {
            const op = this.peek().type === 'MOD' ? 'MOD' : this.peek().value;
            this.advance();
            left = { type: 'BinOp', op, left, right: this.parsePow() };
        }
        return left;
    }
    parsePow() {
        const left = this.parseUnary();
        if (this.match('OP', '^')) { this.advance(); return { type: 'BinOp', op: '^', left, right: this.parsePow() }; }
        return left;
    }
    parseUnary() {
        if (this.match('OP', '-')) { this.advance(); return { type: 'UnaryOp', op: '-', expr: this.parseUnary() }; }
        return this.parseAtom();
    }
    parseAtom() {
        const tok = this.peek();
        if (tok.type === 'NUMBER') { this.advance(); return { type: 'Number',  value: tok.value }; }
        if (tok.type === 'STRING') { this.advance(); return { type: 'String',  value: tok.value }; }
        if (tok.type === 'BOOL')   { this.advance(); return { type: 'Boolean', value: tok.value }; }
        if (tok.type === 'IDENT') {
            this.advance();
            if (this.match('OP', '[')) {
                this.advance();
                const index = this.parseExpr();
                this.expect('OP', ']');
                return { type: 'ArrayAccess', name: tok.value, index, line: tok.line };
            }
            if (this.match('OP', '(')) {
                this.advance();
                const args = [];
                if (!this.match('OP', ')')) {
                    args.push(this.parseExpr());
                    while (this.match('OP', ',')) { this.advance(); args.push(this.parseExpr()); }
                }
                this.expect('OP', ')');
                return { type: 'FunctionCall', name: tok.value, args, line: tok.line };
            }
            return { type: 'Ident', name: tok.value, line: tok.line };
        }
        if (this.match('OP', '(')) {
            this.advance();
            const e = this.parseExpr();
            this.expect('OP', ')');
            return e;
        }
        throw new PseudoError(`Expresión esperada (encontrado ${tok.type} ${tok.value ?? ''})`, tok.line);
    }
}

// ── FUNCIONES BUILT-IN ───────────────────────────────────────────────────────
//   Disponibles desde cualquier expresión: NombreFuncion(arg1, arg2, ...)
//   PSeInt es case-insensitive — las claves del mapa están en minúsculas.
const BUILTINS = {
    // ── Matemáticas ──────────────────────────────────────────────────────────
    'rc':           { arity: [1], fn: ([a]) => {
        if (typeof a !== 'number') throw new Error(`requiere un número`);
        if (a < 0) throw new Error(`raíz cuadrada de número negativo: ${a}`);
        return Math.sqrt(a);
    }},
    'raizcuadrada': { arity: [1], fn: ([a]) => {
        if (a < 0) throw new Error(`raíz cuadrada de número negativo: ${a}`);
        return Math.sqrt(a);
    }},
    'trunc':        { arity: [1], fn: ([a]) => Math.trunc(a) },
    'redon':        { arity: [1], fn: ([a]) => Math.round(a) },
    'redondear':    { arity: [1], fn: ([a]) => Math.round(a) },
    'abs':          { arity: [1], fn: ([a]) => Math.abs(a) },
    'ln':           { arity: [1], fn: ([a]) => Math.log(a) },
    'exp':          { arity: [1], fn: ([a]) => Math.exp(a) },
    'sen':          { arity: [1], fn: ([a]) => Math.sin(a) },
    'cos':          { arity: [1], fn: ([a]) => Math.cos(a) },
    'tan':          { arity: [1], fn: ([a]) => Math.tan(a) },

    // ── Aleatorio ────────────────────────────────────────────────────────────
    'azar':         { arity: [1], fn: ([n]) => Math.floor(Math.random() * Math.trunc(n)) },
    'aleatorio':    { arity: [1, 2], fn: (args) => {
        if (args.length === 1) return Math.floor(Math.random() * Math.trunc(args[0]));
        const a = Math.trunc(args[0]), b = Math.trunc(args[1]);
        if (a > b) throw new Error(`Aleatorio(${a}, ${b}): el primer argumento debe ser ≤ al segundo`);
        return Math.floor(Math.random() * (b - a + 1)) + a;
    }},

    // ── Cadenas ──────────────────────────────────────────────────────────────
    'longitud':     { arity: [1], fn: ([s]) => String(s).length },
    'mayusculas':   { arity: [1], fn: ([s]) => String(s).toUpperCase() },
    'minusculas':   { arity: [1], fn: ([s]) => String(s).toLowerCase() },
    'subcadena':    { arity: [3], fn: ([s, i, j]) => {
        const str = String(s);
        const ii = Math.trunc(i), jj = Math.trunc(j);
        if (ii > jj) return '';
        return str.substring(Math.max(0, ii - 1), Math.min(str.length, jj));
    }},
    'concatenar':   { arity: [2], fn: ([a, b]) => String(a) + String(b) },
    'convertiranumero': { arity: [1], fn: ([s]) => {
        const v = parseFloat(String(s).replace(',', '.'));
        if (isNaN(v)) throw new Error(`no se puede convertir "${s}" a número`);
        return v;
    }},
    'convertiratexto':  { arity: [1], fn: ([n]) => String(n) },
};

// ── INTERPRETER ──────────────────────────────────────────────────────────────
class Interpreter {
    constructor(io) {
        this.env   = new Map();
        this.types = new Map();
        this.io = io;
    }

    async run(ast) { await this.execBlock(ast.body); }
    async execBlock(stmts) { for (const s of stmts) await this.execStmt(s); }

    async execStmt(s) {
        switch (s.type) {
            case 'Definir': {
                for (const n of s.names) {
                    const k = n.toLowerCase();
                    this.types.set(k, s.tipo);
                    this.env.set(k, this.defaultFor(s.tipo));
                }
                return;
            }
            case 'Dimension': {
                for (const d of s.decls) {
                    const size = Math.trunc(this.evalExpr(d.size));
                    if (size <= 0)
                        throw new PseudoError(`Tamaño del array '${d.name}' debe ser positivo: ${size}`, s.line);
                    const k = d.name.toLowerCase();
                    this.env.set(k, { __array__: true, size, values: new Array(size + 1).fill(0) });
                    this.types.set(k, 'array');
                }
                return;
            }
            case 'Asignacion': {
                const v = this.evalExpr(s.expr);
                const t = s.target;
                if (t.type === 'IdentLValue') {
                    const k = t.name.toLowerCase();
                    const existing = this.env.get(k);
                    if (existing && existing.__array__)
                        throw new PseudoError(`'${t.name}' es un array. Usa '${t.name}[índice] <- valor' para asignar un elemento.`, s.line);
                    let coerced = v;
                    if (this.types.has(k) && this.types.get(k) !== 'array')
                        coerced = this.coerceForType(t.name, v, this.types.get(k), s.line);
                    this.env.set(k, coerced);
                } else {
                    const k = t.name.toLowerCase();
                    const arr = this.env.get(k);
                    if (!arr || arr.__array__ !== true)
                        throw new PseudoError(`'${t.name}' no es un array. Usa 'Dimension ${t.name}[N]' antes de asignar.`, s.line);
                    const i = Math.trunc(this.evalExpr(t.index));
                    if (i < 1 || i > arr.size)
                        throw new PseudoError(`Índice ${i} fuera de rango (válido: 1..${arr.size}) en array '${t.name}'`, s.line);
                    arr.values[i] = v;
                }
                return;
            }
            case 'Escribir': {
                const parts = s.args.map(a => this.formatValue(this.evalExpr(a)));
                this.io.output(parts.join(''));
                return;
            }
            case 'Leer': {
                for (const t of s.targets) {
                    let tipo;
                    let labelText;
                    if (t.type === 'IdentLValue') {
                        tipo = this.types.get(t.name.toLowerCase()) || 'cadena';
                        labelText = t.name;
                    } else {
                        tipo = 'real';
                        const idx = this.evalExpr(t.index);
                        labelText = `${t.name}[${idx}]`;
                    }
                    const raw = await this.io.input(labelText);
                    let v;
                    if (['numero', 'numérico', 'entero', 'real'].includes(tipo)) {
                        v = parseFloat(String(raw).replace(',', '.'));
                        if (isNaN(v)) throw new PseudoError(`Valor no numérico para '${labelText}': "${raw}"`, s.line);
                        if (tipo === 'entero') v = Math.trunc(v);
                    } else if (['logico', 'lógico'].includes(tipo)) {
                        v = ['verdadero', 'true', '1', 'sí', 'si', 'v'].includes(String(raw).toLowerCase());
                    } else {
                        v = String(raw);
                    }
                    if (t.type === 'IdentLValue') {
                        this.env.set(t.name.toLowerCase(), v);
                    } else {
                        const arr = this.env.get(t.name.toLowerCase());
                        if (!arr || arr.__array__ !== true)
                            throw new PseudoError(`'${t.name}' no es un array`, s.line);
                        const i = Math.trunc(this.evalExpr(t.index));
                        if (i < 1 || i > arr.size)
                            throw new PseudoError(`Índice ${i} fuera de rango (1..${arr.size}) en '${t.name}'`, s.line);
                        arr.values[i] = v;
                    }
                }
                return;
            }
            case 'Si': {
                const c = this.evalExpr(s.cond);
                if (typeof c !== 'boolean')
                    throw new PseudoError(`La condición del Si debe ser lógica (obtenido ${typeof c})`, s.line);
                await this.execBlock(c ? s.thenBody : s.elseBody);
                return;
            }
            case 'Segun': {
                const v = this.evalExpr(s.expr);
                for (const c of s.cases) {
                    for (const val of c.values) {
                        if (this.evalExpr(val) === v) {
                            await this.execBlock(c.body);
                            return;
                        }
                    }
                }
                if (s.defaultCase) await this.execBlock(s.defaultCase);
                return;
            }
            case 'Mientras': {
                let iter = 0;
                while (true) {
                    const c = this.evalExpr(s.cond);
                    if (typeof c !== 'boolean')
                        throw new PseudoError(`La condición del Mientras debe ser lógica`, s.line);
                    if (!c) break;
                    await this.execBlock(s.body);
                    if (++iter > 1_000_000)
                        throw new PseudoError(`Bucle Mientras detenido por seguridad tras 1.000.000 iteraciones`, s.line);
                }
                return;
            }
            case 'Repetir': {
                let iter = 0;
                while (true) {
                    await this.execBlock(s.body);
                    const c = this.evalExpr(s.cond);
                    if (typeof c !== 'boolean')
                        throw new PseudoError(`La condición del 'Hasta Que' debe ser lógica (obtenido ${typeof c})`, s.line);
                    if (c) break;
                    if (++iter > 1_000_000)
                        throw new PseudoError(`Bucle Repetir detenido por seguridad tras 1.000.000 iteraciones`, s.line);
                }
                return;
            }
            case 'Para': {
                const from = this.evalExpr(s.from);
                const to   = this.evalExpr(s.to);
                const step = this.evalExpr(s.step);
                if (typeof from !== 'number' || typeof to !== 'number' || typeof step !== 'number')
                    throw new PseudoError(`Los límites de Para deben ser numéricos`, s.line);
                if (step === 0) throw new PseudoError(`El paso del Para no puede ser 0`, s.line);
                const k = s.varname.toLowerCase();
                let v = from;
                let iter = 0;
                while ((step > 0 && v <= to) || (step < 0 && v >= to)) {
                    this.env.set(k, v);
                    await this.execBlock(s.body);
                    v += step;
                    if (++iter > 1_000_000)
                        throw new PseudoError(`Bucle Para detenido por seguridad tras 1.000.000 iteraciones`, s.line);
                }
                return;
            }
            default:
                throw new PseudoError(`Instrucción no implementada: ${s.type}`, s.line);
        }
    }

    evalExpr(e) {
        switch (e.type) {
            case 'Number':  return e.value;
            case 'String':  return e.value;
            case 'Boolean': return e.value;
            case 'Ident': {
                const k = e.name.toLowerCase();
                if (this.env.has(k)) {
                    const v = this.env.get(k);
                    if (v && v.__array__)
                        throw new PseudoError(`'${e.name}' es un array. Usa '${e.name}[índice]' para acceder a un elemento.`, e.line);
                    return v;
                }
                // Constantes built-in (sin paréntesis)
                if (k === 'pi') return Math.PI;
                throw new PseudoError(`Variable '${e.name}' usada sin definir`, e.line);
            }
            case 'FunctionCall': {
                const name = e.name.toLowerCase();
                const args = e.args.map(a => this.evalExpr(a));
                return this.callBuiltin(name, args, e.line);
            }
            case 'ArrayAccess': {
                const k = e.name.toLowerCase();
                const arr = this.env.get(k);
                if (!arr || arr.__array__ !== true)
                    throw new PseudoError(`'${e.name}' no es un array`, e.line);
                const i = Math.trunc(this.evalExpr(e.index));
                if (i < 1 || i > arr.size)
                    throw new PseudoError(`Índice ${i} fuera de rango (1..${arr.size}) en array '${e.name}'`, e.line);
                return arr.values[i];
            }
            case 'UnaryOp': {
                const v = this.evalExpr(e.expr);
                if (e.op === '-')  return -v;
                if (e.op === 'NO') return !v;
                throw new PseudoError(`Operador unario no soportado: ${e.op}`);
            }
            case 'BinOp': {
                const a = this.evalExpr(e.left);
                const b = this.evalExpr(e.right);
                switch (e.op) {
                    case '+':
                        if (typeof a === 'string' || typeof b === 'string')
                            return this.formatValue(a) + this.formatValue(b);
                        return a + b;
                    case '-': return a - b;
                    case '*': return a * b;
                    case '/':
                        if (b === 0) throw new PseudoError(`División por cero`);
                        return a / b;
                    case '^':   return Math.pow(a, b);
                    case 'MOD':
                        if (b === 0) throw new PseudoError(`MOD por cero`);
                        return a - Math.floor(a / b) * b;
                    case '=':   return a === b;
                    case '<>':  return a !== b;
                    case '<':   return a <  b;
                    case '>':   return a >  b;
                    case '<=':  return a <= b;
                    case '>=':  return a >= b;
                    case 'Y':   return Boolean(a) && Boolean(b);
                    case 'O':   return Boolean(a) || Boolean(b);
                }
            }
        }
    }

    callBuiltin(name, args, line) {
        const spec = BUILTINS[name];
        if (!spec)
            throw new PseudoError(`Función '${name}' no definida. Built-ins disponibles: ${Object.keys(BUILTINS).join(', ')}`, line);
        if (!spec.arity.includes(args.length)) {
            const argTxt = spec.arity.join(' o ');
            const plural = (spec.arity.length === 1 && spec.arity[0] === 1) ? 'argumento' : 'argumentos';
            throw new PseudoError(`Función '${name}' espera ${argTxt} ${plural}, recibió ${args.length}`, line);
        }
        try {
            return spec.fn(args);
        } catch (e) {
            if (e instanceof PseudoError) throw e;
            throw new PseudoError(`Error en función '${name}': ${e.message}`, line);
        }
    }

    defaultFor(tipo) {
        if (['numero', 'numérico', 'entero', 'real'].includes(tipo)) return 0;
        if (['logico', 'lógico'].includes(tipo)) return false;
        return '';
    }

    coerceForType(name, v, tipo, line) {
        const numTypes  = ['numero', 'numérico', 'entero', 'real'];
        const strTypes  = ['caracter', 'cadena', 'texto'];
        const boolTypes = ['logico', 'lógico'];
        if (numTypes.includes(tipo)) {
            if (typeof v !== 'number')
                throw new PseudoError(`'${name}' está declarada como ${tipo} pero recibe ${typeof v}`, line);
            return tipo === 'entero' ? Math.trunc(v) : v;
        }
        if (strTypes.includes(tipo)) {
            if (typeof v !== 'string')
                throw new PseudoError(`'${name}' está declarada como ${tipo} pero recibe ${typeof v}`, line);
            return v;
        }
        if (boolTypes.includes(tipo)) {
            if (typeof v !== 'boolean')
                throw new PseudoError(`'${name}' está declarada como ${tipo} pero recibe ${typeof v}`, line);
            return v;
        }
        return v;
    }

    formatValue(v) {
        if (typeof v === 'boolean') return v ? 'VERDADERO' : 'FALSO';
        if (typeof v === 'number') return v.toString();
        return String(v);
    }
}

// ── API pública ──────────────────────────────────────────────────────────────
async function runPseudo(source, io) {
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interp = new Interpreter(io);
    await interp.run(ast);
}

window.runPseudo = runPseudo;
window.PseudoError = PseudoError;
