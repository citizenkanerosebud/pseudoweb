// ─────────────────────────────────────────────────────────────────────────────
// PseudoWeb — Soluciones de referencia de los 36 ejercicios.
// Cada solución es código pseudocódigo válido que pasa el grader 10/10.
// Se utilizan:
//   1) en test.html para verificar que todas siguen siendo correctas
//   2) en generate_manual.py para imprimirlas en la Parte V del PDF
// ─────────────────────────────────────────────────────────────────────────────

const SOLUTIONS = [
    // ── ① Básico ─────────────────────────────────────────────────────────────
    {
        id: 'perimetro_cuadrado',
        codigo: `Proceso Perimetro
    Definir lado, p Como Real
    Escribir "Lado:"
    Leer lado
    p <- 4 * lado
    Escribir "Perímetro: ", p
FinProceso`,
        idea: 'El perímetro de un cuadrado es 4 × lado. Una sola operación aritmética entre Leer y Escribir.',
        truco: null,
    },
    {
        id: 'doble_triple',
        codigo: `Proceso DobleTriple
    Definir n Como Real
    Leer n
    Escribir "Doble: ", 2 * n, ", Triple: ", 3 * n
FinProceso`,
        idea: 'No hace falta variables intermedias: Escribir admite expresiones directamente.',
        truco: 'Imprimir varios valores con comas los concatena en la misma línea.',
    },
    {
        id: 'min_a_seg',
        codigo: `Proceso MinASeg
    Definir min, seg Como Real
    Leer min
    seg <- min * 60
    Escribir "Segundos: ", seg
FinProceso`,
        idea: 'Un minuto son 60 segundos. Multiplica.',
        truco: null,
    },

    // ── ② Condicional simple ─────────────────────────────────────────────────
    {
        id: 'multiplo_3',
        codigo: `Proceso Multiplo3
    Definir n Como Entero
    Leer n
    Si n MOD 3 = 0 Entonces
        Escribir "SI"
    SiNo
        Escribir "NO"
    FinSi
FinProceso`,
        idea: 'El operador MOD da el resto de la división. Si el resto entre 3 es 0, n es múltiplo de 3.',
        truco: 'Recuerda: 0 MOD 3 = 0, así que el 0 sí es múltiplo de 3.',
    },
    {
        id: 'aprobado',
        codigo: `Proceso Aprobado
    Definir nota Como Real
    Leer nota
    Si nota >= 5 Entonces
        Escribir "APROBADO"
    SiNo
        Escribir "SUSPENSO"
    FinSi
FinProceso`,
        idea: 'Una sola comparación >= 5. El Si/SiNo elige el mensaje.',
        truco: null,
    },
    {
        id: 'mayor_dos',
        codigo: `Proceso MayorDos
    Definir a, b Como Real
    Leer a
    Leer b
    Si a > b Entonces
        Escribir "Mayor: ", a
    SiNo
        Si b > a Entonces
            Escribir "Mayor: ", b
        SiNo
            Escribir "Son iguales"
        FinSi
    FinSi
FinProceso`,
        idea: 'Tres casos exclusivos: a>b, b>a, o iguales. Anida un Si dentro del SiNo del primero.',
        truco: 'El caso de empate hay que tratarlo aparte — no basta con "si no es mayor, es menor".',
    },

    // ── ③ Condicional múltiple ───────────────────────────────────────────────
    {
        id: 'clasificar_edad',
        codigo: `Proceso ClasificarEdad
    Definir edad Como Entero
    Leer edad
    Si edad <= 12 Entonces
        Escribir "NIÑO"
    SiNo
        Si edad <= 17 Entonces
            Escribir "ADOLESCENTE"
        SiNo
            Si edad <= 64 Entonces
                Escribir "ADULTO"
            SiNo
                Escribir "MAYOR"
            FinSi
        FinSi
    FinSi
FinProceso`,
        idea: 'Cascada de Si encadenados en orden ascendente. Cada SiNo cubre los casos restantes.',
        truco: 'Si compruebas edad <= 12 primero, no necesitas decir "edad >= 0" en los siguientes — ya lo sabes.',
    },
    {
        id: 'calificacion',
        codigo: `Proceso Calificacion
    Definir nota Como Real
    Leer nota
    Si nota < 0 O nota > 10 Entonces
        Escribir "FUERA DE RANGO"
    SiNo
        Si nota < 5 Entonces
            Escribir "INSUFICIENTE"
        SiNo
            Si nota < 6 Entonces
                Escribir "SUFICIENTE"
            SiNo
                Si nota < 7 Entonces
                    Escribir "BIEN"
                SiNo
                    Si nota < 9 Entonces
                        Escribir "NOTABLE"
                    SiNo
                        Escribir "SOBRESALIENTE"
                    FinSi
                FinSi
            FinSi
        FinSi
    FinSi
FinProceso`,
        idea: 'Comprueba primero el caso fuera de rango (con O lógico). Luego cascada de rangos de menor a mayor.',
        truco: 'Cada Si comprueba sólo el límite superior — el inferior ya lo garantiza el SiNo del anterior.',
    },
    {
        id: 'mayor_tres',
        codigo: `Proceso MayorTres
    Definir a, b, c, mayor Como Real
    Leer a
    Leer b
    Leer c
    mayor <- a
    Si b > mayor Entonces
        mayor <- b
    FinSi
    Si c > mayor Entonces
        mayor <- c
    FinSi
    Escribir "Mayor: ", mayor
FinProceso`,
        idea: 'Patrón clásico: asume que el primero es el mayor; compara con los siguientes y actualiza si encuentra uno más grande.',
        truco: null,
    },

    // ── ④ Bucle Para ─────────────────────────────────────────────────────────
    {
        id: 'suma_n_pares',
        codigo: `Proceso SumaPares
    Definir n, i, suma Como Entero
    Leer n
    suma <- 0
    Para i <- 1 Hasta n Hacer
        suma <- suma + 2 * i
    FinPara
    Escribir "Suma: ", suma
FinProceso`,
        idea: 'El i-ésimo par positivo es 2*i (el 1º es 2, el 2º es 4, …). Bucle Para acumula.',
        truco: 'Inicializa el acumulador a 0 ANTES del Para, no dentro.',
    },
    {
        id: 'tabla_n',
        codigo: `Proceso TablaN
    Definir n, i Como Entero
    Leer n
    Para i <- 1 Hasta 10 Hacer
        Escribir n, " x ", i, " = ", n * i
    FinPara
FinProceso`,
        idea: 'Para i de 1 a 10. Imprime n por i. Sin acumulador.',
        truco: null,
    },
    {
        id: 'factorial',
        codigo: `Proceso Factorial
    Definir n, i, f Como Entero
    Leer n
    f <- 1
    Para i <- 1 Hasta n Hacer
        f <- f * i
    FinPara
    Escribir n, "! = ", f
FinProceso`,
        idea: 'f comienza en 1. Multiplica por 1, 2, …, n. Si n=0, el Para no se ejecuta y f queda en 1 (que es 0! por convenio).',
        truco: 'Inicializar el acumulador a 1 (neutro de la multiplicación), NO a 0.',
    },

    // ── ⑤ Bucle Mientras ─────────────────────────────────────────────────────
    {
        id: 'sumar_hasta_cero',
        codigo: `Proceso SumarHasta0
    Definir n, suma Como Real
    suma <- 0
    Leer n
    Mientras n <> 0 Hacer
        suma <- suma + n
        Leer n
    FinMientras
    Escribir "Suma: ", suma
FinProceso`,
        idea: 'Patrón centinela: lee un número ANTES del Mientras, luego lee el siguiente DENTRO del bucle.',
        truco: 'Si pusieras Leer DESPUÉS de la suma, sumarías el 0 final.',
    },
    {
        id: 'cifras_numero',
        codigo: `Proceso Cifras
    Definir n, cifras Como Entero
    Leer n
    cifras <- 0
    Mientras n > 0 Hacer
        cifras <- cifras + 1
        n <- n / 10
    FinMientras
    Escribir "Cifras: ", cifras
FinProceso`,
        idea: 'Cada división entre 10 quita una cifra (truncando, gracias al tipo Entero). Cuenta cuántas veces puedes dividir.',
        truco: 'En PseudoWeb, cuando n es Entero, "n <- n / 10" trunca automáticamente.',
    },
    {
        id: 'promedio_centinela',
        codigo: `Proceso Promedio
    Definir n, suma, prom Como Real
    Definir cont Como Entero
    suma <- 0
    cont <- 0
    Leer n
    Mientras n <> -1 Hacer
        suma <- suma + n
        cont <- cont + 1
        Leer n
    FinMientras
    Si cont > 0 Entonces
        prom <- suma / cont
        Escribir "Promedio: ", prom
    SiNo
        Escribir "Sin datos"
    FinSi
FinProceso`,
        idea: 'Mismo patrón centinela que el anterior pero con dos acumuladores: suma y contador. División sólo si contador > 0.',
        truco: 'NUNCA dividas entre el contador sin comprobar que es > 0: la división por cero es un error.',
    },

    // ── ⑥ Algoritmos clásicos ────────────────────────────────────────────────
    {
        id: 'suma_digitos',
        codigo: `Proceso SumaDigitos
    Definir n, suma, digito Como Entero
    Leer n
    suma <- 0
    Mientras n > 0 Hacer
        digito <- n MOD 10
        suma <- suma + digito
        n <- n / 10
    FinMientras
    Escribir "Suma digitos: ", suma
FinProceso`,
        idea: 'n MOD 10 da el último dígito. n / 10 (truncado) quita el último dígito. Repite hasta que n llegue a 0.',
        truco: 'Si n vale 0, el Mientras no se ejecuta y suma queda en 0 — justo lo que queremos.',
    },
    {
        id: 'es_primo',
        codigo: `Proceso EsPrimo
    Definir n, i Como Entero
    Definir esp Como Logico
    Leer n
    esp <- Verdadero
    Para i <- 2 Hasta n - 1 Hacer
        Si n MOD i = 0 Entonces
            esp <- Falso
        FinSi
    FinPara
    Si esp Entonces
        Escribir "PRIMO"
    SiNo
        Escribir "NO PRIMO"
    FinSi
FinProceso`,
        idea: 'Variable bandera (esp). Prueba todos los divisores del 2 al n-1. Si alguno cabe exacto, no es primo.',
        truco: 'Una optimización (no necesaria aquí): basta probar hasta √n. Pero con n pequeños no importa.',
    },
    {
        id: 'invertir_numero',
        codigo: `Proceso InvertirNum
    Definir n, inv, digito Como Entero
    Leer n
    inv <- 0
    Mientras n > 0 Hacer
        digito <- n MOD 10
        inv <- inv * 10 + digito
        n <- n / 10
    FinMientras
    Escribir "Invertido: ", inv
FinProceso`,
        idea: 'Saca el último dígito y "empújalo" a la izquierda del invertido (multiplica por 10).',
        truco: 'Los ceros a la izquierda del invertido desaparecen solos porque inv es Entero (10 → 1, no "01").',
    },

    // ── ⑦ Listas (Dimension) ─────────────────────────────────────────────────
    {
        id: 'pares_impares',
        codigo: `Proceso ParesImpares
    Definir n, i, pares, impares Como Entero
    Dimension v[100]
    Leer n
    Para i <- 1 Hasta n Hacer
        Leer v[i]
    FinPara
    pares <- 0
    impares <- 0
    Para i <- 1 Hasta n Hacer
        Si v[i] MOD 2 = 0 Entonces
            pares <- pares + 1
        SiNo
            impares <- impares + 1
        FinSi
    FinPara
    Escribir "Pares: ", pares, ", Impares: ", impares
FinProceso`,
        idea: 'Dos pasadas con Para: una para leer, otra para contar. v[i] MOD 2 distingue par/impar.',
        truco: 'En PseudoWeb, el MOD funciona también con negativos: -2 MOD 2 = 0 (par), -1 MOD 2 = 1 (impar).',
    },
    {
        id: 'max_vector',
        codigo: `Proceso MaxVector
    Definir n, i, max Como Entero
    Dimension v[100]
    Leer n
    Para i <- 1 Hasta n Hacer
        Leer v[i]
    FinPara
    max <- v[1]
    Para i <- 2 Hasta n Hacer
        Si v[i] > max Entonces
            max <- v[i]
        FinSi
    FinPara
    Escribir "Maximo: ", max
FinProceso`,
        idea: 'Inicializa max con el primer elemento. Compara con los demás (de 2 a n) y actualiza si encuentras uno mayor.',
        truco: 'NO inicialices max a 0: si todos los valores son negativos, fallaría.',
    },
    {
        id: 'buscar_valor',
        codigo: `Proceso Buscar
    Definir n, i, buscar, pos Como Entero
    Dimension v[100]
    Leer n
    Para i <- 1 Hasta n Hacer
        Leer v[i]
    FinPara
    Leer buscar
    pos <- -1
    i <- 1
    Mientras i <= n Y pos = -1 Hacer
        Si v[i] = buscar Entonces
            pos <- i
        FinSi
        i <- i + 1
    FinMientras
    Escribir "Posicion: ", pos
FinProceso`,
        idea: 'pos comienza en -1 (no encontrado). Mientras quedan elementos Y aún no se encontró, busca. Al encontrarlo guarda i en pos y la condición pos=-1 deja de cumplirse.',
        truco: 'Usar Mientras (no Para) para poder cortar el bucle cuando se encuentra la primera ocurrencia.',
    },

    // ── ⑧ Menús con Segun ────────────────────────────────────────────────────
    {
        id: 'dia_semana',
        codigo: `Proceso DiaSemana
    Definir n Como Entero
    Leer n
    Segun n Hacer
        1: Escribir "Lunes"
        2: Escribir "Martes"
        3: Escribir "Miércoles"
        4: Escribir "Jueves"
        5: Escribir "Viernes"
        6: Escribir "Sábado"
        7: Escribir "Domingo"
        De Otro Modo: Escribir "Día no válido"
    FinSegun
FinProceso`,
        idea: 'Un caso del Segun por cada día. "De Otro Modo" captura cualquier número fuera de 1..7.',
        truco: 'Atento a las tildes: Miércoles, Sábado, "Día no válido" — la corrección es estricta.',
    },
    {
        id: 'dias_mes',
        codigo: `Proceso DiasMes
    Definir mes Como Entero
    Leer mes
    Segun mes Hacer
        1, 3, 5, 7, 8, 10, 12: Escribir "Dias: 31"
        4, 6, 9, 11: Escribir "Dias: 30"
        2: Escribir "Dias: 28"
        De Otro Modo: Escribir "Mes no válido"
    FinSegun
FinProceso`,
        idea: 'Agrupa varios valores en un mismo caso separándolos por coma — más limpio que repetir Escribir.',
        truco: 'Los meses de 31 días: enero, marzo, mayo, julio, agosto, octubre, diciembre.',
    },
    {
        id: 'nombre_mes',
        codigo: `Proceso NombreMes
    Definir mes Como Entero
    Leer mes
    Segun mes Hacer
        1:  Escribir "Enero"
        2:  Escribir "Febrero"
        3:  Escribir "Marzo"
        4:  Escribir "Abril"
        5:  Escribir "Mayo"
        6:  Escribir "Junio"
        7:  Escribir "Julio"
        8:  Escribir "Agosto"
        9:  Escribir "Septiembre"
        10: Escribir "Octubre"
        11: Escribir "Noviembre"
        12: Escribir "Diciembre"
        De Otro Modo: Escribir "Mes no válido"
    FinSegun
FinProceso`,
        idea: 'Un caso por mes. Estilo "tabla de búsqueda" donde el Segun hace de diccionario.',
        truco: 'Septiembre (no "Setiembre"). El grader es estricto con la ortografía.',
    },

    // ── ⑨ Repetir / Hasta Que ────────────────────────────────────────────────
    {
        id: 'adivinar_7',
        codigo: `Proceso Adivinar7
    Definir intento, intentos Como Entero
    intentos <- 0
    Repetir
        Leer intento
        intentos <- intentos + 1
    Hasta Que intento = 7
    Escribir "Intentos: ", intentos
FinProceso`,
        idea: 'Repetir/Hasta Que ejecuta al menos una vez. Cuenta cada lectura. Sale cuando intento=7.',
        truco: 'Si pones contadores ANTES de Leer, contarías mal. Aquí: primero leer, luego contar — y el contador incluye el acierto final.',
    },
    {
        id: 'validar_nota_repetir',
        codigo: `Proceso ValidarNota
    Definir nota Como Real
    Repetir
        Leer nota
    Hasta Que nota >= 0 Y nota <= 10
    Escribir "Nota válida: ", nota
FinProceso`,
        idea: 'Repetir asegura que se pide al menos una vez. La condición de salida usa Y para que la nota esté en el rango [0, 10].',
        truco: 'Más limpio que Mientras: no necesitas inicializar nota con un valor "imposible".',
    },
    {
        id: 'contar_hasta_mult7',
        codigo: `Proceso ContarHasta7
    Definir n, contados Como Entero
    contados <- 0
    Repetir
        Leer n
        contados <- contados + 1
    Hasta Que n MOD 7 = 0
    Escribir "Contados: ", contados
FinProceso`,
        idea: 'Cuenta cada número leído, incluido el múltiplo de 7 final. La condición de salida es n MOD 7 = 0.',
        truco: 'Cuidado: 0 es múltiplo de 7 (0 = 7·0). Si el usuario introduce 0 a la primera, el bucle termina con contados = 1.',
    },

    // ── ⑩ Números aleatorios ─────────────────────────────────────────────────
    {
        id: 'tirar_dados',
        codigo: `Proceso TirarDados
    Definir n, i, suma Como Entero
    Leer n
    suma <- 0
    Para i <- 1 Hasta n Hacer
        suma <- suma + Aleatorio(1, 6)
    FinPara
    Escribir "Suma: ", suma
FinProceso`,
        idea: 'Aleatorio(1, 6) simula un dado. Para acumula N tiradas.',
        truco: 'La suma siempre estará entre N (todo 1s) y 6N (todo 6s) — el grader chequea ese rango.',
    },
    {
        id: 'lanzar_monedas',
        codigo: `Proceso Monedas
    Definir n, i, r, caras, cruces Como Entero
    Leer n
    caras <- 0
    cruces <- 0
    Para i <- 1 Hasta n Hacer
        r <- Aleatorio(0, 1)
        Si r = 0 Entonces
            caras <- caras + 1
        SiNo
            cruces <- cruces + 1
        FinSi
    FinPara
    Escribir "Caras: ", caras, ", Cruces: ", cruces
FinProceso`,
        idea: 'Aleatorio(0, 1) da 0 (cara) o 1 (cruz). Dos contadores. La suma caras+cruces siempre es N.',
        truco: null,
    },
    {
        id: 'mayores_50',
        codigo: `Proceso Mayores50
    Definir n, i, r, mayores Como Entero
    Leer n
    mayores <- 0
    Para i <- 1 Hasta n Hacer
        r <- Aleatorio(1, 100)
        Si r > 50 Entonces
            mayores <- mayores + 1
        FinSi
    FinPara
    Escribir "Mayores: ", mayores
FinProceso`,
        idea: 'Genera N aleatorios entre 1 y 100. Cuenta solo los que pasan de 50.',
        truco: 'Estadísticamente, mayores ≈ N/2, pero el grader sólo comprueba que esté en [0, N].',
    },

    // ── ⑪ Cadenas de texto ───────────────────────────────────────────────────
    {
        id: 'contar_consonantes',
        codigo: `Proceso Consonantes
    Definir palabra, c Como Cadena
    Definir i, n, cont Como Entero
    Leer palabra
    n <- Longitud(palabra)
    cont <- 0
    Para i <- 1 Hasta n Hacer
        c <- Subcadena(palabra, i, i)
        Si c <> "a" Y c <> "e" Y c <> "i" Y c <> "o" Y c <> "u" Entonces
            cont <- cont + 1
        FinSi
    FinPara
    Escribir "Consonantes: ", cont
FinProceso`,
        idea: 'Recorre cada letra con Subcadena. Si no es ninguna vocal, suma una consonante.',
        truco: 'Usa Y entre cinco comparaciones <>: la condición sólo es cierta si la letra es distinta de TODAS las vocales.',
    },
    {
        id: 'invertir_cadena',
        codigo: `Proceso InvertirPalabra
    Definir palabra, inv Como Cadena
    Definir i, n Como Entero
    Leer palabra
    n <- Longitud(palabra)
    inv <- ""
    Para i <- n Hasta 1 Con Paso -1 Hacer
        inv <- Concatenar(inv, Subcadena(palabra, i, i))
    FinPara
    Escribir "Invertida: ", inv
FinProceso`,
        idea: 'Para con paso -1 desde el final hasta el principio. En cada vuelta concatena una letra.',
        truco: 'Inicializa la cadena de resultado a "" (vacío), no a nada.',
    },
    {
        id: 'empieza_vocal',
        codigo: `Proceso EmpiezaVocal
    Definir palabra, c Como Cadena
    Leer palabra
    c <- Subcadena(palabra, 1, 1)
    Si c = "a" O c = "e" O c = "i" O c = "o" O c = "u" Entonces
        Escribir "SI"
    SiNo
        Escribir "NO"
    FinSi
FinProceso`,
        idea: 'Coge la primera letra con Subcadena(palabra, 1, 1). Cinco comparaciones con O.',
        truco: 'Subcadena en PseInt es 1-indexada e inclusiva — (s, 1, 1) devuelve el primer carácter.',
    },

    // ── ⑫ Funciones matemáticas ──────────────────────────────────────────────
    {
        id: 'area_circulo',
        codigo: `Proceso AreaCirculo
    Definir r Como Real
    Definir a Como Entero
    Leer r
    a <- Redon(PI * r ^ 2)
    Escribir "Area: ", a
FinProceso`,
        idea: 'Fórmula clásica π·r². PI es una constante built-in. Redon redondea al entero más cercano.',
        truco: 'Declarar a como Entero hace que se redondee al asignar — pero usamos Redon explícitamente para que se entienda mejor.',
    },
    {
        id: 'hipotenusa',
        codigo: `Proceso Hipotenusa
    Definir a, b Como Real
    Definir h Como Entero
    Leer a
    Leer b
    h <- Redon(RC(a ^ 2 + b ^ 2))
    Escribir "Hipotenusa: ", h
FinProceso`,
        idea: 'Teorema de Pitágoras: h = √(a² + b²). RC es la raíz cuadrada.',
        truco: 'Los test cases usan ternas pitagóricas perfectas (3-4-5, 5-12-13, …) — para esos la raíz da entero exacto.',
    },
    {
        id: 'distancia_puntos',
        codigo: `Proceso Distancia
    Definir x1, y1, x2, y2 Como Real
    Definir d Como Entero
    Leer x1
    Leer y1
    Leer x2
    Leer y2
    d <- Redon(RC((x2 - x1) ^ 2 + (y2 - y1) ^ 2))
    Escribir "Distancia: ", d
FinProceso`,
        idea: 'Distancia euclidiana = √(Δx² + Δy²). Es una hipotenusa donde los catetos son las diferencias en X e Y.',
        truco: null,
    },
];

window.PseudoSolutions = SOLUTIONS;
