// ─────────────────────────────────────────────────────────────────────────────
// PseudoWeb — Generador de diagramas de flujo (AST → Mermaid)
// Recorre el AST que produce el parser de pseint.js y emite código Mermaid
// flowchart TD. La librería Mermaid renderiza el SVG resultante.
//
// Convenciones visuales (formas de Mermaid):
//   stadium ([...])     → Inicio / Fin
//   rectángulo [...]    → Asignación, Definir, Dimension
//   paralelogramo [/.../] → Leer / Escribir (entrada/salida)
//   rombo {...}         → Condición (Si, Mientras, Para, Segun, Repetir)
//   círculo pequeño     → Punto de unión (no se etiqueta)
//
// API pública:  generateFlowchart(sourceCode) → string Mermaid
// ─────────────────────────────────────────────────────────────────────────────

class FlowchartGenerator {
    constructor() {
        this.nodes = [];        // {id, shape, label}
        this.edges = [];        // {from, to, label?}
        this._counter = 0;
    }

    _id(prefix) { this._counter++; return `${prefix}${this._counter}`; }

    // ── Visita una lista de instrucciones secuenciales ───────────────────────
    _visitBlock(stmts) {
        if (!stmts || stmts.length === 0) return { entry: null, exit: null };
        let firstEntry = null, prevExit = null;
        for (const s of stmts) {
            const r = this._visitStmt(s);
            if (!r.entry) continue;
            if (firstEntry === null) firstEntry = r.entry;
            if (prevExit !== null) this.edges.push({ from: prevExit, to: r.entry });
            prevExit = r.exit;
        }
        return { entry: firstEntry, exit: prevExit };
    }

    // ── Visita una instrucción y devuelve {entry, exit} ──────────────────────
    _visitStmt(s) {
        switch (s.type) {
            case 'Definir': {
                const id = this._id('def');
                this.nodes.push({
                    id, shape: 'rect',
                    label: `Definir ${s.names.join(', ')} Como ${s.tipo}`
                });
                return { entry: id, exit: id };
            }
            case 'Dimension': {
                const id = this._id('dim');
                const txt = s.decls.map(d => `${d.name}[${this._expr(d.size)}]`).join(', ');
                this.nodes.push({ id, shape: 'rect', label: `Dimension ${txt}` });
                return { entry: id, exit: id };
            }
            case 'Asignacion': {
                const id = this._id('asg');
                const target = s.target.type === 'IdentLValue'
                    ? s.target.name
                    : `${s.target.name}[${this._expr(s.target.index)}]`;
                this.nodes.push({
                    id, shape: 'rect',
                    label: `${target} ← ${this._expr(s.expr)}`
                });
                return { entry: id, exit: id };
            }
            case 'Escribir': {
                const id = this._id('out');
                const args = s.args.map(a => this._expr(a)).join(', ');
                this.nodes.push({ id, shape: 'io', label: `Escribir ${args}` });
                return { entry: id, exit: id };
            }
            case 'Leer': {
                const id = this._id('in');
                const targets = s.targets.map(t =>
                    t.type === 'IdentLValue' ? t.name : `${t.name}[${this._expr(t.index)}]`
                ).join(', ');
                this.nodes.push({ id, shape: 'io', label: `Leer ${targets}` });
                return { entry: id, exit: id };
            }
            case 'Si': {
                const dec  = this._id('si');
                const join = this._id('joinSi');
                this.nodes.push({ id: dec,  shape: 'diamond', label: this._expr(s.cond) });
                this.nodes.push({ id: join, shape: 'point' });

                const thenR = this._visitBlock(s.thenBody);
                if (thenR.entry) {
                    this.edges.push({ from: dec, to: thenR.entry, label: 'Sí' });
                    this.edges.push({ from: thenR.exit, to: join });
                } else {
                    this.edges.push({ from: dec, to: join, label: 'Sí' });
                }
                const elseR = this._visitBlock(s.elseBody || []);
                if (elseR.entry) {
                    this.edges.push({ from: dec, to: elseR.entry, label: 'No' });
                    this.edges.push({ from: elseR.exit, to: join });
                } else {
                    this.edges.push({ from: dec, to: join, label: 'No' });
                }
                return { entry: dec, exit: join };
            }
            case 'Mientras': {
                const dec  = this._id('while');
                const exit = this._id('wexit');
                this.nodes.push({ id: dec, shape: 'diamond', label: this._expr(s.cond) });
                this.nodes.push({ id: exit, shape: 'point' });

                const bodyR = this._visitBlock(s.body);
                if (bodyR.entry) {
                    this.edges.push({ from: dec, to: bodyR.entry, label: 'Sí' });
                    this.edges.push({ from: bodyR.exit, to: dec });   // bucle
                }
                this.edges.push({ from: dec, to: exit, label: 'No' });
                return { entry: dec, exit };
            }
            case 'Repetir': {
                const begin = this._id('repBeg');
                const dec   = this._id('repCond');
                const exit  = this._id('rexit');
                this.nodes.push({ id: begin, shape: 'point' });
                this.nodes.push({ id: dec,   shape: 'diamond', label: this._expr(s.cond) });
                this.nodes.push({ id: exit,  shape: 'point' });

                const bodyR = this._visitBlock(s.body);
                if (bodyR.entry) {
                    this.edges.push({ from: begin, to: bodyR.entry });
                    this.edges.push({ from: bodyR.exit, to: dec });
                } else {
                    this.edges.push({ from: begin, to: dec });
                }
                this.edges.push({ from: dec, to: exit,  label: 'Sí' });
                this.edges.push({ from: dec, to: begin, label: 'No' });   // bucle
                return { entry: begin, exit };
            }
            case 'Para': {
                const init = this._id('forInit');
                const dec  = this._id('forCond');
                const inc  = this._id('forInc');
                const exit = this._id('fexit');
                const stepStr = this._expr(s.step);
                this.nodes.push({ id: init, shape: 'rect',    label: `${s.varname} ← ${this._expr(s.from)}` });
                this.nodes.push({ id: dec,  shape: 'diamond', label: `${s.varname} ≤ ${this._expr(s.to)}` });
                this.nodes.push({ id: inc,  shape: 'rect',    label: `${s.varname} ← ${s.varname} + ${stepStr}` });
                this.nodes.push({ id: exit, shape: 'point' });

                this.edges.push({ from: init, to: dec });
                const bodyR = this._visitBlock(s.body);
                if (bodyR.entry) {
                    this.edges.push({ from: dec, to: bodyR.entry, label: 'Sí' });
                    this.edges.push({ from: bodyR.exit, to: inc });
                    this.edges.push({ from: inc, to: dec });
                }
                this.edges.push({ from: dec, to: exit, label: 'No' });
                return { entry: init, exit };
            }
            case 'Segun': {
                const dec  = this._id('seg');
                const exit = this._id('segexit');
                this.nodes.push({ id: dec, shape: 'diamond', label: `Segun ${this._expr(s.expr)}` });
                this.nodes.push({ id: exit, shape: 'point' });

                for (const c of s.cases) {
                    const lab = c.values.map(v => this._expr(v)).join(', ');
                    const r = this._visitBlock(c.body);
                    if (r.entry) {
                        this.edges.push({ from: dec, to: r.entry, label: lab });
                        this.edges.push({ from: r.exit, to: exit });
                    } else {
                        this.edges.push({ from: dec, to: exit, label: lab });
                    }
                }
                if (s.defaultCase) {
                    const r = this._visitBlock(s.defaultCase);
                    if (r.entry) {
                        this.edges.push({ from: dec, to: r.entry, label: 'otro' });
                        this.edges.push({ from: r.exit, to: exit });
                    } else {
                        this.edges.push({ from: dec, to: exit, label: 'otro' });
                    }
                } else {
                    this.edges.push({ from: dec, to: exit, label: 'otro' });
                }
                return { entry: dec, exit };
            }
            default: {
                const id = this._id('unk');
                this.nodes.push({ id, shape: 'rect', label: `(${s.type})` });
                return { entry: id, exit: id };
            }
        }
    }

    // ── Convierte una expresión del AST a texto pseudocódigo ─────────────────
    _expr(e) {
        if (e === undefined || e === null) return '';
        switch (e.type) {
            case 'Number':  return String(e.value);
            case 'String':  return `"${String(e.value).replace(/"/g, '\\"')}"`;
            case 'Boolean': return e.value ? 'Verdadero' : 'Falso';
            case 'Ident':   return e.name;
            case 'ArrayAccess': return `${e.name}[${this._expr(e.index)}]`;
            case 'FunctionCall':
                return `${e.name}(${e.args.map(a => this._expr(a)).join(', ')})`;
            case 'UnaryOp':
                if (e.op === 'NO') return `NO ${this._expr(e.expr)}`;
                return `-${this._expr(e.expr)}`;
            case 'BinOp': {
                const op = {
                    '<>': '≠', '<=': '≤', '>=': '≥', '=': '=', '<': '<', '>': '>',
                    '+': '+', '-': '−', '*': '×', '/': '/', '^': '^',
                    'MOD': 'MOD', 'Y': 'Y', 'O': 'O',
                }[e.op] || e.op;
                return `${this._expr(e.left)} ${op} ${this._expr(e.right)}`;
            }
            default: return '?';
        }
    }

    // ── Construye el Mermaid ─────────────────────────────────────────────────
    build(program) {
        const start = this._id('start');
        const end   = this._id('end');
        this.nodes.push({ id: start, shape: 'oval', label: `Inicio: ${program.name}` });

        const r = this._visitBlock(program.body);
        if (r.entry) {
            this.edges.push({ from: start, to: r.entry });
            this.nodes.push({ id: end, shape: 'oval', label: 'Fin' });
            this.edges.push({ from: r.exit, to: end });
        } else {
            this.nodes.push({ id: end, shape: 'oval', label: 'Fin' });
            this.edges.push({ from: start, to: end });
        }

        let out = 'flowchart TD\n';
        for (const n of this.nodes) {
            const text = this._mermaidLabel(n.label);
            switch (n.shape) {
                case 'oval':    out += `    ${n.id}([${text}])\n`; break;
                case 'rect':    out += `    ${n.id}[${text}]\n`; break;
                case 'io':      out += `    ${n.id}[/${text}/]\n`; break;
                case 'diamond': out += `    ${n.id}{${text}}\n`; break;
                case 'point':   out += `    ${n.id}(( ))\n`; break;
                default:        out += `    ${n.id}[${text}]\n`;
            }
        }
        for (const e of this.edges) {
            const arrow = e.label ? `-->|${this._mermaidLabel(e.label)}|` : '-->';
            out += `    ${e.from} ${arrow} ${e.to}\n`;
        }

        // Clases CSS para colorear según tipo de nodo
        out += '\n';
        const byShape = { oval: [], rect: [], io: [], diamond: [] };
        for (const n of this.nodes) {
            if (n.shape in byShape) byShape[n.shape].push(n.id);
        }
        if (byShape.oval.length)    out += `    class ${byShape.oval.join(',')} clsStart\n`;
        if (byShape.rect.length)    out += `    class ${byShape.rect.join(',')} clsProc\n`;
        if (byShape.io.length)      out += `    class ${byShape.io.join(',')} clsIO\n`;
        if (byShape.diamond.length) out += `    class ${byShape.diamond.join(',')} clsCond\n`;
        out += '    classDef clsStart fill:#818cf8,stroke:#818cf8,color:#0d0f1a,font-weight:bold\n';
        out += '    classDef clsProc  fill:#252840,stroke:#94a3b8,color:#e2e8f0\n';
        out += '    classDef clsIO    fill:#fbbf24,stroke:#fbbf24,color:#0d0f1a\n';
        out += '    classDef clsCond  fill:#1a1d2e,stroke:#fbbf24,color:#fbbf24\n';
        return out;
    }

    _mermaidLabel(text) {
        // Mermaid usa varios caracteres como sintaxis. La forma más segura
        // es envolver en comillas dobles y escapar las internas.
        const safe = String(text).replace(/"/g, '#quot;');
        return `"${safe}"`;
    }
}

// ── API pública ──────────────────────────────────────────────────────────────
function generateFlowchart(source) {
    // Re-aprovecha el lexer/parser del intérprete principal
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const gen = new FlowchartGenerator();
    return gen.build(ast);
}

window.generateFlowchart = generateFlowchart;
window.FlowchartGenerator = FlowchartGenerator;
