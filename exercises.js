// ─────────────────────────────────────────────────────────────────────────────
// PseudoWeb — Sistema de ejercicios (Fase 1)
// 12 ejercicios, uno por grupo. Cada ejercicio tiene 10 casos de prueba.
// Nota = casos_acertados (sobre 10). Cada caso fallido resta 1 punto.
// ─────────────────────────────────────────────────────────────────────────────

const EXERCISES = [
    // ── ① Básico ─────────────────────────────────────────────────────────────
    {
        id: 'perimetro_cuadrado',
        grupo: '① Básico',
        titulo: 'Perímetro del cuadrado',
        enunciado:
`Pide al usuario la longitud del lado de un cuadrado y calcula su perímetro (4 × lado).

Como ÚLTIMA línea debes imprimir exactamente:
    Perímetro: X

donde X es el valor calculado. Puedes (y debes) imprimir prompts antes — solo se evalúa la última línea.`,
        pistas: [
            'El perímetro de un cuadrado es 4 × lado',
            'Usa Definir lado, p Como Real',
            'Imprime así: Escribir "Perímetro: ", p',
        ],
        plantilla:
`// Ejercicio: Perímetro del cuadrado
Proceso Perimetro
    Definir lado, p Como Real
    Escribir "Introduce el lado del cuadrado:"
    Leer lado

    // Calcula el perímetro y muéstralo

FinProceso`,
        casos: [
            { inputs: ['5'],    esperado: ['Perímetro: 20'] },
            { inputs: ['1'],    esperado: ['Perímetro: 4'] },
            { inputs: ['10'],   esperado: ['Perímetro: 40'] },
            { inputs: ['100'],  esperado: ['Perímetro: 400'] },
            { inputs: ['0'],    esperado: ['Perímetro: 0'] },
            { inputs: ['7'],    esperado: ['Perímetro: 28'] },
            { inputs: ['12'],   esperado: ['Perímetro: 48'] },
            { inputs: ['25'],   esperado: ['Perímetro: 100'] },
            { inputs: ['2.5'],  esperado: ['Perímetro: 10'] },
            { inputs: ['0.5'],  esperado: ['Perímetro: 2'] },
        ],
    },

    // ── ② Condicional simple ─────────────────────────────────────────────────
    {
        id: 'multiplo_3',
        grupo: '② Condicional simple',
        titulo: '¿Es múltiplo de 3?',
        enunciado:
`Pide un número entero y muestra como ÚLTIMA línea:
    SI    — si es múltiplo de 3
    NO    — si no lo es

(Recuerda: 0 sí es múltiplo de 3 porque 0 = 3 × 0.)`,
        pistas: [
            'Usa el operador MOD: n MOD 3 = 0 indica múltiplo de 3',
            'Solo necesitas un Si/SiNo',
            'Imprime "SI" o "NO" (mayúsculas, sin nada más)',
        ],
        plantilla:
`// Ejercicio: ¿Es múltiplo de 3?
Proceso Multiplo3
    Definir n Como Entero
    Escribir "Introduce un número entero:"
    Leer n

    // Determina si es múltiplo de 3 e imprime "SI" o "NO"

FinProceso`,
        casos: [
            { inputs: ['3'],     esperado: ['SI'] },
            { inputs: ['6'],     esperado: ['SI'] },
            { inputs: ['9'],     esperado: ['SI'] },
            { inputs: ['100'],   esperado: ['NO'] },
            { inputs: ['99'],    esperado: ['SI'] },
            { inputs: ['1'],     esperado: ['NO'] },
            { inputs: ['0'],     esperado: ['SI'] },
            { inputs: ['7'],     esperado: ['NO'] },
            { inputs: ['30'],    esperado: ['SI'] },
            { inputs: ['1000'],  esperado: ['NO'] },
        ],
    },

    // ── ③ Condicional múltiple ───────────────────────────────────────────────
    {
        id: 'clasificar_edad',
        grupo: '③ Condicional múltiple',
        titulo: 'Clasificar edad',
        enunciado:
`Pide la edad de una persona y clasifícala. Como ÚLTIMA línea imprime exactamente UNA de estas palabras:
    NIÑO          — si edad <= 12
    ADOLESCENTE   — si 13 <= edad <= 17
    ADULTO        — si 18 <= edad <= 64
    MAYOR         — si edad >= 65

Asume edad >= 0.`,
        pistas: [
            'Encadena varios Si...SiNo o usa Si anidados',
            'Cuidado con los límites: 12 es NIÑO, 13 es ADOLESCENTE',
            'Las cuatro palabras van en mayúsculas, sin nada más',
        ],
        plantilla:
`// Ejercicio: Clasificar edad
Proceso ClasificarEdad
    Definir edad Como Entero
    Escribir "¿Qué edad tienes?"
    Leer edad

    // Imprime NIÑO, ADOLESCENTE, ADULTO o MAYOR

FinProceso`,
        casos: [
            { inputs: ['5'],   esperado: ['NIÑO'] },
            { inputs: ['12'],  esperado: ['NIÑO'] },
            { inputs: ['13'],  esperado: ['ADOLESCENTE'] },
            { inputs: ['17'],  esperado: ['ADOLESCENTE'] },
            { inputs: ['18'],  esperado: ['ADULTO'] },
            { inputs: ['64'],  esperado: ['ADULTO'] },
            { inputs: ['65'],  esperado: ['MAYOR'] },
            { inputs: ['80'],  esperado: ['MAYOR'] },
            { inputs: ['0'],   esperado: ['NIÑO'] },
            { inputs: ['30'],  esperado: ['ADULTO'] },
        ],
    },

    // ── ④ Bucle Para ─────────────────────────────────────────────────────────
    {
        id: 'suma_n_pares',
        grupo: '④ Bucle Para',
        titulo: 'Suma de los N primeros pares',
        enunciado:
`Pide un número N y calcula la suma de los N primeros números pares positivos:
    2 + 4 + 6 + ... + (2·N)

Como ÚLTIMA línea imprime exactamente:
    Suma: X`,
        pistas: [
            'El i-ésimo número par positivo es 2*i',
            'Usa Para i <- 1 Hasta N',
            'Acumula en una variable suma <- suma + 2*i',
        ],
        plantilla:
`// Ejercicio: Suma de los N primeros pares
Proceso SumaPares
    Definir n, i, suma Como Entero
    Escribir "¿Cuántos pares quieres sumar?"
    Leer n
    suma <- 0

    // Bucle Para que acumula los N primeros pares

FinProceso`,
        casos: [
            { inputs: ['1'],   esperado: ['Suma: 2'] },
            { inputs: ['2'],   esperado: ['Suma: 6'] },
            { inputs: ['3'],   esperado: ['Suma: 12'] },
            { inputs: ['4'],   esperado: ['Suma: 20'] },
            { inputs: ['5'],   esperado: ['Suma: 30'] },
            { inputs: ['6'],   esperado: ['Suma: 42'] },
            { inputs: ['7'],   esperado: ['Suma: 56'] },
            { inputs: ['10'],  esperado: ['Suma: 110'] },
            { inputs: ['15'],  esperado: ['Suma: 240'] },
            { inputs: ['20'],  esperado: ['Suma: 420'] },
        ],
    },

    // ── ⑤ Bucle Mientras ─────────────────────────────────────────────────────
    {
        id: 'sumar_hasta_cero',
        grupo: '⑤ Bucle Mientras',
        titulo: 'Sumar hasta introducir 0',
        enunciado:
`Pide números al usuario, uno a uno. Cuando introduzca 0, deja de pedir más y muestra la suma de todos los anteriores (el 0 final NO se suma — es el centinela).

Como ÚLTIMA línea imprime exactamente:
    Suma: X

Si el primer número es 0, la suma vale 0.`,
        pistas: [
            'Inicializa suma <- 0 y lee el primer número',
            'Mientras n <> 0 Hacer: suma <- suma + n, leer el siguiente',
            'Recuerda imprimir "Suma: " antes del total',
        ],
        plantilla:
`// Ejercicio: Sumar hasta el centinela 0
Proceso SumarHasta0
    Definir n, suma Como Real
    suma <- 0
    Escribir "Introduce números (0 para terminar):"
    Leer n

    // Bucle Mientras que acumula hasta n=0

FinProceso`,
        casos: [
            { inputs: ['0'],                                  esperado: ['Suma: 0'] },
            { inputs: ['5', '0'],                             esperado: ['Suma: 5'] },
            { inputs: ['1', '2', '3', '0'],                   esperado: ['Suma: 6'] },
            { inputs: ['10', '20', '0'],                      esperado: ['Suma: 30'] },
            { inputs: ['100', '200', '300', '0'],             esperado: ['Suma: 600'] },
            { inputs: ['-5', '5', '0'],                       esperado: ['Suma: 0'] },
            { inputs: ['7', '14', '21', '28', '0'],           esperado: ['Suma: 70'] },
            { inputs: ['-1', '-2', '-3', '0'],                esperado: ['Suma: -6'] },
            { inputs: ['1', '1', '1', '1', '1', '0'],         esperado: ['Suma: 5'] },
            { inputs: ['50', '-25', '25', '0'],               esperado: ['Suma: 50'] },
        ],
    },

    // ── ⑥ Algoritmos clásicos ────────────────────────────────────────────────
    {
        id: 'suma_digitos',
        grupo: '⑥ Algoritmos clásicos',
        titulo: 'Suma de dígitos',
        enunciado:
`Pide un número entero positivo y calcula la suma de todos sus dígitos.

Por ejemplo:
    123 → 1+2+3 = 6
    1000 → 1+0+0+0 = 1
    999  → 9+9+9 = 27

Como ÚLTIMA línea imprime exactamente:
    Suma digitos: X`,
        pistas: [
            'Extrae el último dígito con: digito <- n MOD 10',
            'Acumula en suma <- suma + digito',
            'Reduce n con: n <- n / 10  (si n es Entero, se trunca automáticamente)',
            'Repite mientras n > 0',
        ],
        plantilla:
`// Ejercicio: Suma de dígitos
Proceso SumaDigitos
    Definir n, suma, digito Como Entero
    Escribir "Introduce un número entero positivo:"
    Leer n
    suma <- 0

    // Bucle que va sacando el último dígito y sumándolo

FinProceso`,
        casos: [
            { inputs: ['0'],        esperado: ['Suma digitos: 0'] },
            { inputs: ['1'],        esperado: ['Suma digitos: 1'] },
            { inputs: ['9'],        esperado: ['Suma digitos: 9'] },
            { inputs: ['10'],       esperado: ['Suma digitos: 1'] },
            { inputs: ['100'],      esperado: ['Suma digitos: 1'] },
            { inputs: ['123'],      esperado: ['Suma digitos: 6'] },
            { inputs: ['999'],      esperado: ['Suma digitos: 27'] },
            { inputs: ['12345'],    esperado: ['Suma digitos: 15'] },
            { inputs: ['7777'],     esperado: ['Suma digitos: 28'] },
            { inputs: ['1000000'],  esperado: ['Suma digitos: 1'] },
        ],
    },

    // ── ⑦ Listas (Dimension) ─────────────────────────────────────────────────
    {
        id: 'pares_impares',
        grupo: '⑦ Listas (Dimension)',
        titulo: 'Contar pares e impares',
        enunciado:
`Pide N. A continuación pide N números enteros y guárdalos en un array. Cuenta cuántos son pares y cuántos impares.

Recuerda: 0 es par. Los negativos también pueden ser pares o impares (−2 es par, −1 es impar).

Como ÚLTIMA línea imprime exactamente:
    Pares: X, Impares: Y`,
        pistas: [
            'Declara: Definir n, i, pares, impares Como Entero; Dimension v[100]',
            'Lee con Para i <- 1 Hasta n Hacer: Leer v[i]',
            'Otro bucle Para que comprueba v[i] MOD 2',
            'Cuidado: -3 MOD 2 = 1, -2 MOD 2 = 0 — el MOD funciona bien con negativos',
        ],
        plantilla:
`// Ejercicio: Contar pares e impares
Proceso ParesImpares
    Definir n, i, pares, impares Como Entero
    Dimension v[100]
    Escribir "¿Cuántos números?"
    Leer n
    Para i <- 1 Hasta n Hacer
        Escribir "Elemento ", i, ":"
        Leer v[i]
    FinPara
    pares <- 0
    impares <- 0

    // Recorre el array y cuenta

FinProceso`,
        casos: [
            { inputs: ['1', '0'],                              esperado: ['Pares: 1, Impares: 0'] },
            { inputs: ['1', '1'],                              esperado: ['Pares: 0, Impares: 1'] },
            { inputs: ['2', '2', '4'],                         esperado: ['Pares: 2, Impares: 0'] },
            { inputs: ['3', '1', '3', '5'],                    esperado: ['Pares: 0, Impares: 3'] },
            { inputs: ['5', '1', '2', '3', '4', '5'],          esperado: ['Pares: 2, Impares: 3'] },
            { inputs: ['1', '-2'],                             esperado: ['Pares: 1, Impares: 0'] },
            { inputs: ['2', '-1', '0'],                        esperado: ['Pares: 1, Impares: 1'] },
            { inputs: ['6', '1', '2', '3', '4', '5', '6'],     esperado: ['Pares: 3, Impares: 3'] },
            { inputs: ['1', '99'],                             esperado: ['Pares: 0, Impares: 1'] },
            { inputs: ['10', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
              esperado: ['Pares: 5, Impares: 5'] },
        ],
    },

    // ── ⑧ Menús con Segun ────────────────────────────────────────────────────
    {
        id: 'dia_semana',
        grupo: '⑧ Menús con Segun',
        titulo: 'Día de la semana',
        enunciado:
`Pide un número del 1 al 7 e imprime el día correspondiente. Si está fuera de rango imprime "Día no válido".

    1 → Lunes      5 → Viernes
    2 → Martes     6 → Sábado
    3 → Miércoles  7 → Domingo
    4 → Jueves

Como ÚLTIMA línea imprime el nombre del día (con sus tildes correctas) o exactamente "Día no válido".

REQUISITO: usa la estructura Segun (no Si encadenados).`,
        pistas: [
            'Usa Segun n Hacer ... FinSegun',
            'Para el caso fuera de rango usa "De Otro Modo:"',
            'Cuidado con las tildes: Miércoles, Sábado, Día',
        ],
        plantilla:
`// Ejercicio: Día de la semana (usa Segun)
Proceso DiaSemana
    Definir n Como Entero
    Escribir "Introduce un número de 1 a 7:"
    Leer n

    // Estructura Segun con los 7 casos + De Otro Modo

FinProceso`,
        casos: [
            { inputs: ['1'],   esperado: ['Lunes'] },
            { inputs: ['2'],   esperado: ['Martes'] },
            { inputs: ['3'],   esperado: ['Miércoles'] },
            { inputs: ['4'],   esperado: ['Jueves'] },
            { inputs: ['5'],   esperado: ['Viernes'] },
            { inputs: ['6'],   esperado: ['Sábado'] },
            { inputs: ['7'],   esperado: ['Domingo'] },
            { inputs: ['0'],   esperado: ['Día no válido'] },
            { inputs: ['8'],   esperado: ['Día no válido'] },
            { inputs: ['-1'],  esperado: ['Día no válido'] },
        ],
    },

    // ── ⑨ Repetir / Hasta Que ────────────────────────────────────────────────
    {
        id: 'adivinar_7',
        grupo: '⑨ Repetir / Hasta Que',
        titulo: 'Adivinar el 7',
        enunciado:
`El número secreto es 7 (fijo, no aleatorio). Pide intentos al usuario hasta que adivine. Cuenta el número de intentos.

REQUISITO: usa Repetir / Hasta Que.

Como ÚLTIMA línea imprime exactamente:
    Intentos: X

donde X incluye el intento acertado (si acierta a la primera, X=1).`,
        pistas: [
            'Inicializa intentos <- 0 antes del bucle',
            'Dentro de Repetir: Leer intento, intentos <- intentos + 1',
            'La condición de salida es: Hasta Que intento = 7',
        ],
        plantilla:
`// Ejercicio: Adivinar el número 7 (Repetir/Hasta Que)
Proceso AdivinarEl7
    Definir intento, intentos Como Entero
    intentos <- 0
    Escribir "Adivina el número secreto:"

    // Bucle Repetir/Hasta Que

FinProceso`,
        casos: [
            { inputs: ['7'],                                       esperado: ['Intentos: 1'] },
            { inputs: ['5', '7'],                                  esperado: ['Intentos: 2'] },
            { inputs: ['8', '7'],                                  esperado: ['Intentos: 2'] },
            { inputs: ['1', '2', '3', '7'],                        esperado: ['Intentos: 4'] },
            { inputs: ['10', '5', '7'],                            esperado: ['Intentos: 3'] },
            { inputs: ['100', '50', '25', '10', '7'],              esperado: ['Intentos: 5'] },
            { inputs: ['0', '7'],                                  esperado: ['Intentos: 2'] },
            { inputs: ['9', '8', '7'],                             esperado: ['Intentos: 3'] },
            { inputs: ['6', '5', '4', '3', '2', '1', '7'],         esperado: ['Intentos: 7'] },
            { inputs: ['7', '5'],                                  esperado: ['Intentos: 1'] },
        ],
    },

    // ── ⑩ Números aleatorios ─────────────────────────────────────────────────
    // Este ejercicio usa Aleatorio, así que la salida no es predecible.
    // El grader verifica formato + rango (no valor exacto).
    {
        id: 'tirar_dados',
        grupo: '⑩ Números aleatorios',
        titulo: 'Tirar N dados y sumar',
        nota: 'Como usa Aleatorio, el grader comprueba que (1) el formato sea "Suma: X" y (2) que X esté en el rango [N, 6·N]. No se comprueba el valor exacto.',
        enunciado:
`Pide un número N y tira N dados (cada uno con Aleatorio(1, 6)). Suma todos los resultados.

Como ÚLTIMA línea imprime exactamente:
    Suma: X

Como X depende del azar, el grader sólo verifica que el formato es correcto y que la suma está en el rango válido (entre N y 6·N, ambos inclusive).`,
        pistas: [
            'Usa la función Aleatorio(1, 6) — devuelve un entero de 1 a 6',
            'Acumula en suma <- suma + Aleatorio(1, 6)',
            'No olvides inicializar suma <- 0',
        ],
        plantilla:
`// Ejercicio: Tirar N dados (usa Aleatorio)
Proceso TirarDados
    Definir n, i, suma Como Entero
    Escribir "¿Cuántos dados?"
    Leer n
    suma <- 0

    // Bucle Para que acumula N tiradas de Aleatorio(1, 6)

FinProceso`,
        casos: [1, 5, 10, 3, 20, 100, 2, 4, 6, 50].map(n => ({
            inputs: [String(n)],
            check: (outputs) => {
                const tail = outputs.map(s => s.trimEnd()).filter(s => s.length > 0).slice(-1)[0] || '';
                const m = tail.match(/^Suma:\s*(\d+)$/);
                if (!m) return false;
                const v = parseInt(m[1], 10);
                return v >= n && v <= 6 * n;
            },
        })),
    },

    // ── ⑪ Cadenas de texto ───────────────────────────────────────────────────
    {
        id: 'contar_consonantes',
        grupo: '⑪ Cadenas',
        titulo: 'Contar consonantes',
        enunciado:
`Pide una palabra escrita en minúsculas, sin acentos y sin espacios. Cuenta cuántas consonantes tiene.

Vocales = {a, e, i, o, u}. Cualquier otra letra cuenta como consonante.

Como ÚLTIMA línea imprime exactamente:
    Consonantes: X`,
        pistas: [
            'Usa n <- Longitud(palabra) para saber cuántos caracteres iterar',
            'Saca cada letra con: c <- Subcadena(palabra, i, i)',
            'Comprueba si NO es vocal: c <> "a" Y c <> "e" Y ...',
        ],
        plantilla:
`// Ejercicio: Contar consonantes
Proceso Consonantes
    Definir palabra, c Como Cadena
    Definir i, n, cont Como Entero
    Escribir "Introduce una palabra (minúsculas, sin acentos):"
    Leer palabra
    n <- Longitud(palabra)
    cont <- 0

    // Recorre cada carácter y cuenta consonantes

FinProceso`,
        casos: [
            { inputs: ['a'],             esperado: ['Consonantes: 0'] },
            { inputs: ['b'],             esperado: ['Consonantes: 1'] },
            { inputs: ['hola'],          esperado: ['Consonantes: 2'] },
            { inputs: ['casa'],          esperado: ['Consonantes: 2'] },
            { inputs: ['aeiou'],         esperado: ['Consonantes: 0'] },
            { inputs: ['xyz'],           esperado: ['Consonantes: 3'] },
            { inputs: ['ritmo'],         esperado: ['Consonantes: 3'] },
            { inputs: ['programa'],      esperado: ['Consonantes: 5'] },
            { inputs: ['murcielago'],    esperado: ['Consonantes: 5'] },
            { inputs: ['pseudocodigo'],  esperado: ['Consonantes: 6'] },
        ],
    },

    // ── ① Básico — extras ────────────────────────────────────────────────────
    {
        id: 'doble_triple',
        grupo: '① Básico',
        titulo: 'Doble y triple',
        enunciado:
`Pide un número y muestra su doble y su triple en una sola línea.

Como ÚLTIMA línea imprime exactamente:
    Doble: X, Triple: Y`,
        pistas: ['El doble es 2 * n', 'El triple es 3 * n', 'Imprime los dos valores en la misma Escribir, separados por coma'],
        plantilla:
`// Ejercicio: Doble y triple
Proceso DobleTriple
    Definir n, d, t Como Real
    Escribir "Introduce un número:"
    Leer n

    // Calcula doble y triple

FinProceso`,
        casos: [
            { inputs: ['5'],   esperado: ['Doble: 10, Triple: 15'] },
            { inputs: ['1'],   esperado: ['Doble: 2, Triple: 3'] },
            { inputs: ['10'],  esperado: ['Doble: 20, Triple: 30'] },
            { inputs: ['0'],   esperado: ['Doble: 0, Triple: 0'] },
            { inputs: ['7'],   esperado: ['Doble: 14, Triple: 21'] },
            { inputs: ['100'], esperado: ['Doble: 200, Triple: 300'] },
            { inputs: ['-3'],  esperado: ['Doble: -6, Triple: -9'] },
            { inputs: ['2.5'], esperado: ['Doble: 5, Triple: 7.5'] },
            { inputs: ['11'],  esperado: ['Doble: 22, Triple: 33'] },
            { inputs: ['50'],  esperado: ['Doble: 100, Triple: 150'] },
        ],
    },
    {
        id: 'min_a_seg',
        grupo: '① Básico',
        titulo: 'Minutos a segundos',
        enunciado:
`Pide un número de minutos y muestra cuántos segundos son (1 minuto = 60 segundos).

Como ÚLTIMA línea imprime exactamente:
    Segundos: X`,
        pistas: ['Multiplica por 60', 'No olvides el formato "Segundos: "'],
        plantilla:
`// Ejercicio: Minutos a segundos
Proceso MinASeg
    Definir min, seg Como Real
    Escribir "¿Cuántos minutos?"
    Leer min

    // Calcula y muestra

FinProceso`,
        casos: [
            { inputs: ['1'],    esperado: ['Segundos: 60'] },
            { inputs: ['2'],    esperado: ['Segundos: 120'] },
            { inputs: ['5'],    esperado: ['Segundos: 300'] },
            { inputs: ['10'],   esperado: ['Segundos: 600'] },
            { inputs: ['60'],   esperado: ['Segundos: 3600'] },
            { inputs: ['0'],    esperado: ['Segundos: 0'] },
            { inputs: ['100'],  esperado: ['Segundos: 6000'] },
            { inputs: ['1.5'],  esperado: ['Segundos: 90'] },
            { inputs: ['0.5'],  esperado: ['Segundos: 30'] },
            { inputs: ['25'],   esperado: ['Segundos: 1500'] },
        ],
    },

    // ── ② Condicional simple — extras ────────────────────────────────────────
    {
        id: 'aprobado',
        grupo: '② Condicional simple',
        titulo: '¿Aprobado?',
        enunciado:
`Pide una nota (0..10) y muestra "APROBADO" si la nota es >= 5, o "SUSPENSO" si es menor.

Como ÚLTIMA línea imprime exactamente:
    APROBADO   o   SUSPENSO`,
        pistas: ['Un Si simple con la condición nota >= 5', '"APROBADO" y "SUSPENSO" en mayúsculas, sin nada más'],
        plantilla:
`// Ejercicio: ¿Aprobado?
Proceso Aprobado
    Definir nota Como Real
    Escribir "Introduce la nota:"
    Leer nota

    // Imprime APROBADO o SUSPENSO

FinProceso`,
        casos: [
            { inputs: ['5'],    esperado: ['APROBADO'] },
            { inputs: ['4.9'],  esperado: ['SUSPENSO'] },
            { inputs: ['10'],   esperado: ['APROBADO'] },
            { inputs: ['0'],    esperado: ['SUSPENSO'] },
            { inputs: ['7'],    esperado: ['APROBADO'] },
            { inputs: ['4'],    esperado: ['SUSPENSO'] },
            { inputs: ['5.5'],  esperado: ['APROBADO'] },
            { inputs: ['9.9'],  esperado: ['APROBADO'] },
            { inputs: ['2'],    esperado: ['SUSPENSO'] },
            { inputs: ['8.5'],  esperado: ['APROBADO'] },
        ],
    },
    {
        id: 'mayor_dos',
        grupo: '② Condicional simple',
        titulo: 'Mayor de dos números',
        enunciado:
`Pide dos números. Muestra el mayor de ambos. Si son iguales, muestra "Son iguales".

Como ÚLTIMA línea imprime exactamente:
    Mayor: X     (si uno es mayor)
    Son iguales  (si a = b)`,
        pistas: ['Si a > b Entonces ... SiNo Si a < b ... SiNo Son iguales', 'Cuidado con el caso de empate'],
        plantilla:
`// Ejercicio: Mayor de dos
Proceso MayorDos
    Definir a, b Como Real
    Escribir "Primer número:"
    Leer a
    Escribir "Segundo número:"
    Leer b

    // Compara e imprime

FinProceso`,
        casos: [
            { inputs: ['3', '5'],     esperado: ['Mayor: 5'] },
            { inputs: ['5', '3'],     esperado: ['Mayor: 5'] },
            { inputs: ['7', '7'],     esperado: ['Son iguales'] },
            { inputs: ['100', '50'],  esperado: ['Mayor: 100'] },
            { inputs: ['-5', '-10'],  esperado: ['Mayor: -5'] },
            { inputs: ['0', '0'],     esperado: ['Son iguales'] },
            { inputs: ['1', '2'],     esperado: ['Mayor: 2'] },
            { inputs: ['10', '10'],   esperado: ['Son iguales'] },
            { inputs: ['-1', '1'],    esperado: ['Mayor: 1'] },
            { inputs: ['0', '1'],     esperado: ['Mayor: 1'] },
        ],
    },

    // ── ③ Condicional múltiple — extras ──────────────────────────────────────
    {
        id: 'calificacion',
        grupo: '③ Condicional múltiple',
        titulo: 'Calificación (nota → texto)',
        enunciado:
`Pide una nota (0..10) y muestra una categoría:
    nota < 5    → INSUFICIENTE
    nota < 6    → SUFICIENTE
    nota < 7    → BIEN
    nota < 9    → NOTABLE
    nota <= 10  → SOBRESALIENTE

Si la nota es < 0 o > 10, imprime "FUERA DE RANGO".

Como ÚLTIMA línea imprime exactamente una de esas palabras (en mayúsculas).`,
        pistas: ['Encadena Si/SiNo Si en cascada', 'Comprueba primero si está fuera de rango', 'Cuidado con los límites: 9 es SOBRESALIENTE, 8.99 es NOTABLE'],
        plantilla:
`// Ejercicio: Calificación textual
Proceso Calificacion
    Definir nota Como Real
    Escribir "Introduce la nota (0..10):"
    Leer nota

    // Encadena condicionales

FinProceso`,
        casos: [
            { inputs: ['0'],     esperado: ['INSUFICIENTE'] },
            { inputs: ['4.99'],  esperado: ['INSUFICIENTE'] },
            { inputs: ['5'],     esperado: ['SUFICIENTE'] },
            { inputs: ['6'],     esperado: ['BIEN'] },
            { inputs: ['7'],     esperado: ['NOTABLE'] },
            { inputs: ['8'],     esperado: ['NOTABLE'] },
            { inputs: ['9'],     esperado: ['SOBRESALIENTE'] },
            { inputs: ['10'],    esperado: ['SOBRESALIENTE'] },
            { inputs: ['-1'],    esperado: ['FUERA DE RANGO'] },
            { inputs: ['11'],    esperado: ['FUERA DE RANGO'] },
        ],
    },
    {
        id: 'mayor_tres',
        grupo: '③ Condicional múltiple',
        titulo: 'Mayor de tres números',
        enunciado:
`Pide tres números y muestra el mayor de los tres.

Como ÚLTIMA línea imprime exactamente:
    Mayor: X`,
        pistas: ['Inicializa una variable mayor con el primer valor', 'Compárala con el segundo, después con el tercero', 'Usa Si encadenados, no necesitas SiNo'],
        plantilla:
`// Ejercicio: Mayor de tres
Proceso MayorTres
    Definir a, b, c, mayor Como Real
    Escribir "Tres números:"
    Leer a
    Leer b
    Leer c

    // Encuentra el mayor

FinProceso`,
        casos: [
            { inputs: ['1', '2', '3'],       esperado: ['Mayor: 3'] },
            { inputs: ['3', '1', '2'],       esperado: ['Mayor: 3'] },
            { inputs: ['2', '3', '1'],       esperado: ['Mayor: 3'] },
            { inputs: ['10', '20', '15'],    esperado: ['Mayor: 20'] },
            { inputs: ['-5', '-10', '-2'],   esperado: ['Mayor: -2'] },
            { inputs: ['0', '0', '0'],       esperado: ['Mayor: 0'] },
            { inputs: ['100', '50', '75'],   esperado: ['Mayor: 100'] },
            { inputs: ['1', '1', '1'],       esperado: ['Mayor: 1'] },
            { inputs: ['5', '10', '5'],      esperado: ['Mayor: 10'] },
            { inputs: ['1', '2', '2'],       esperado: ['Mayor: 2'] },
        ],
    },

    // ── ④ Bucle Para — extras ────────────────────────────────────────────────
    {
        id: 'tabla_n',
        grupo: '④ Bucle Para',
        titulo: 'Tabla de multiplicar de N',
        enunciado:
`Pide un número N. Imprime su tabla de multiplicar del 1 al 10 con este formato (10 líneas, una por valor):
    N x 1 = X
    N x 2 = X
    ...
    N x 10 = X

No añadas nada después de la última línea.`,
        pistas: ['Bucle Para i <- 1 Hasta 10', 'Imprime: Escribir n, " x ", i, " = ", n * i', 'Sin línea final extra'],
        plantilla:
`// Ejercicio: Tabla de N
Proceso TablaN
    Definir n, i Como Entero
    Escribir "Tabla de:"
    Leer n

    // Bucle Para del 1 al 10

FinProceso`,
        casos: [1, 2, 3, 5, 7, 9, 10, 0, -2, 100].map(n => ({
            inputs: [String(n)],
            esperado: Array.from({ length: 10 }, (_, i) => `${n} x ${i + 1} = ${n * (i + 1)}`),
        })),
    },
    {
        id: 'factorial',
        grupo: '④ Bucle Para',
        titulo: 'Factorial',
        enunciado:
`Pide un entero N >= 0 y calcula N! = 1 · 2 · 3 · ... · N. Recuerda: 0! = 1 (por convenio).

Como ÚLTIMA línea imprime exactamente:
    N! = X

(El formato literal: dígito, signo de admiración, espacio, igual, espacio, valor.)`,
        pistas: ['Inicializa f <- 1', 'Bucle Para i <- 1 Hasta n: f <- f * i', 'Si N = 0, el bucle no se ejecuta y f queda en 1'],
        plantilla:
`// Ejercicio: Factorial
Proceso Factorial
    Definir n, i, f Como Entero
    Escribir "N:"
    Leer n
    f <- 1

    // Bucle que multiplica de 1 a n

FinProceso`,
        casos: [
            { inputs: ['0'],   esperado: ['0! = 1'] },
            { inputs: ['1'],   esperado: ['1! = 1'] },
            { inputs: ['2'],   esperado: ['2! = 2'] },
            { inputs: ['3'],   esperado: ['3! = 6'] },
            { inputs: ['4'],   esperado: ['4! = 24'] },
            { inputs: ['5'],   esperado: ['5! = 120'] },
            { inputs: ['6'],   esperado: ['6! = 720'] },
            { inputs: ['7'],   esperado: ['7! = 5040'] },
            { inputs: ['8'],   esperado: ['8! = 40320'] },
            { inputs: ['10'],  esperado: ['10! = 3628800'] },
        ],
    },

    // ── ⑤ Bucle Mientras — extras ────────────────────────────────────────────
    {
        id: 'cifras_numero',
        grupo: '⑤ Bucle Mientras',
        titulo: 'Cuenta las cifras de un número',
        enunciado:
`Pide un entero N > 0 y cuenta cuántas cifras tiene.

Como ÚLTIMA línea imprime exactamente:
    Cifras: X

Asume N > 0 (no se prueba con 0 ni con negativos).`,
        pistas: ['Inicia cifras <- 0', 'Mientras n > 0: cifras <- cifras + 1, n <- n / 10 (truncado por Entero)'],
        plantilla:
`// Ejercicio: Cuenta cifras
Proceso Cifras
    Definir n, cifras Como Entero
    Escribir "N > 0:"
    Leer n
    cifras <- 0

    // Mientras que reduce n a 0 contando

FinProceso`,
        casos: [
            { inputs: ['1'],          esperado: ['Cifras: 1'] },
            { inputs: ['9'],          esperado: ['Cifras: 1'] },
            { inputs: ['10'],         esperado: ['Cifras: 2'] },
            { inputs: ['99'],         esperado: ['Cifras: 2'] },
            { inputs: ['100'],        esperado: ['Cifras: 3'] },
            { inputs: ['1234'],       esperado: ['Cifras: 4'] },
            { inputs: ['9999'],       esperado: ['Cifras: 4'] },
            { inputs: ['10000'],      esperado: ['Cifras: 5'] },
            { inputs: ['999999'],     esperado: ['Cifras: 6'] },
            { inputs: ['100000000'],  esperado: ['Cifras: 9'] },
        ],
    },
    {
        id: 'promedio_centinela',
        grupo: '⑤ Bucle Mientras',
        titulo: 'Promedio con centinela -1',
        enunciado:
`Pide números hasta que el usuario introduzca -1 (centinela). Calcula el promedio de los anteriores (el -1 NO se cuenta).

Como ÚLTIMA línea imprime exactamente:
    Promedio: X    (si hubo al menos un dato)
    Sin datos      (si el primer número introducido fue -1)`,
        pistas: ['Cuenta cuántos datos lees', 'Acumula suma <- suma + n', 'Promedio = suma / contador', 'Antes de imprimir comprueba si contador > 0'],
        plantilla:
`// Ejercicio: Promedio con centinela
Proceso Promedio
    Definir n, suma, prom Como Real
    Definir cont Como Entero
    suma <- 0
    cont <- 0
    Escribir "Números (-1 para terminar):"
    Leer n

    // Mientras n <> -1

FinProceso`,
        casos: [
            { inputs: ['-1'],                              esperado: ['Sin datos'] },
            { inputs: ['10', '-1'],                        esperado: ['Promedio: 10'] },
            { inputs: ['10', '20', '-1'],                  esperado: ['Promedio: 15'] },
            { inputs: ['1', '2', '3', '4', '5', '-1'],     esperado: ['Promedio: 3'] },
            { inputs: ['100', '100', '100', '-1'],         esperado: ['Promedio: 100'] },
            { inputs: ['5', '10', '15', '20', '-1'],       esperado: ['Promedio: 12.5'] },
            { inputs: ['0', '-1'],                         esperado: ['Promedio: 0'] },
            { inputs: ['1', '3', '-1'],                    esperado: ['Promedio: 2'] },
            { inputs: ['2', '4', '6', '8', '-1'],          esperado: ['Promedio: 5'] },
            { inputs: ['-5', '-3', '-1'],                  esperado: ['Promedio: -4'] },
        ],
    },

    // ── ⑥ Algoritmos clásicos — extras ───────────────────────────────────────
    {
        id: 'es_primo',
        grupo: '⑥ Algoritmos clásicos',
        titulo: '¿Es primo?',
        enunciado:
`Pide un número entero N >= 2 y determina si es primo (solo divisible entre 1 y sí mismo).

Como ÚLTIMA línea imprime exactamente:
    PRIMO   o   NO PRIMO`,
        pistas: ['Bandera es_primo <- Verdadero', 'Recorre divisores con Para i <- 2 Hasta n-1 (o hasta RC(n))', 'Si encuentras un divisor: es_primo <- Falso', 'Imprime "PRIMO" o "NO PRIMO" según la bandera'],
        plantilla:
`// Ejercicio: ¿Es primo?
Proceso EsPrimo
    Definir n, i Como Entero
    Definir es_primo Como Logico
    Leer n
    es_primo <- Verdadero

    // Comprueba divisibilidad

FinProceso`,
        casos: [
            { inputs: ['2'],   esperado: ['PRIMO'] },
            { inputs: ['3'],   esperado: ['PRIMO'] },
            { inputs: ['4'],   esperado: ['NO PRIMO'] },
            { inputs: ['5'],   esperado: ['PRIMO'] },
            { inputs: ['9'],   esperado: ['NO PRIMO'] },
            { inputs: ['11'],  esperado: ['PRIMO'] },
            { inputs: ['15'],  esperado: ['NO PRIMO'] },
            { inputs: ['17'],  esperado: ['PRIMO'] },
            { inputs: ['100'], esperado: ['NO PRIMO'] },
            { inputs: ['97'],  esperado: ['PRIMO'] },
        ],
    },
    {
        id: 'invertir_numero',
        grupo: '⑥ Algoritmos clásicos',
        titulo: 'Invertir un número',
        enunciado:
`Pide un entero positivo y muestra el número con sus dígitos invertidos.

Ejemplo: 1234 → 4321. Los ceros a la izquierda del resultado se omiten (10 → 1, no "01").

Como ÚLTIMA línea imprime exactamente:
    Invertido: X`,
        pistas: ['inv <- 0', 'Mientras n > 0: d <- n MOD 10, inv <- inv * 10 + d, n <- n / 10', 'Como inv es Entero, los ceros iniciales desaparecen solos'],
        plantilla:
`// Ejercicio: Invertir un número
Proceso InvertirNum
    Definir n, inv, d Como Entero
    Leer n
    inv <- 0

    // Bucle que extrae dígitos y los empuja a la izquierda

FinProceso`,
        casos: [
            { inputs: ['1'],     esperado: ['Invertido: 1'] },
            { inputs: ['12'],    esperado: ['Invertido: 21'] },
            { inputs: ['123'],   esperado: ['Invertido: 321'] },
            { inputs: ['1234'],  esperado: ['Invertido: 4321'] },
            { inputs: ['10'],    esperado: ['Invertido: 1'] },
            { inputs: ['100'],   esperado: ['Invertido: 1'] },
            { inputs: ['1000'],  esperado: ['Invertido: 1'] },
            { inputs: ['9876'],  esperado: ['Invertido: 6789'] },
            { inputs: ['5'],     esperado: ['Invertido: 5'] },
            { inputs: ['12321'], esperado: ['Invertido: 12321'] },
        ],
    },

    // ── ⑦ Listas — extras ────────────────────────────────────────────────────
    {
        id: 'max_vector',
        grupo: '⑦ Listas (Dimension)',
        titulo: 'Máximo de un vector',
        enunciado:
`Pide N. Después pide N números y guárdalos en un array. Muestra el valor máximo.

Como ÚLTIMA línea imprime exactamente:
    Maximo: X   (sin tilde para que el grader sea estricto)`,
        pistas: ['Inicializa max <- v[1]', 'Recorre Para i <- 2 Hasta n: si v[i] > max entonces max <- v[i]', 'Cuidado con vectores de longitud 1'],
        plantilla:
`// Ejercicio: Máximo de un vector
Proceso MaxVector
    Definir n, i, max Como Entero
    Dimension v[100]
    Leer n
    Para i <- 1 Hasta n Hacer
        Leer v[i]
    FinPara

    // Encuentra el máximo

FinProceso`,
        casos: [
            { inputs: ['1', '5'],                                  esperado: ['Maximo: 5'] },
            { inputs: ['3', '1', '2', '3'],                        esperado: ['Maximo: 3'] },
            { inputs: ['5', '5', '4', '3', '2', '1'],              esperado: ['Maximo: 5'] },
            { inputs: ['5', '1', '2', '3', '4', '5'],              esperado: ['Maximo: 5'] },
            { inputs: ['3', '-5', '-3', '-1'],                     esperado: ['Maximo: -1'] },
            { inputs: ['1', '100'],                                esperado: ['Maximo: 100'] },
            { inputs: ['4', '7', '7', '7', '7'],                   esperado: ['Maximo: 7'] },
            { inputs: ['6', '10', '20', '30', '40', '50', '60'],   esperado: ['Maximo: 60'] },
            { inputs: ['3', '0', '0', '0'],                        esperado: ['Maximo: 0'] },
            { inputs: ['5', '-10', '5', '-20', '3', '-30'],        esperado: ['Maximo: 5'] },
        ],
    },
    {
        id: 'buscar_valor',
        grupo: '⑦ Listas (Dimension)',
        titulo: 'Buscar un valor en un vector',
        enunciado:
`Pide N. Después pide N números. Después pide un valor X a buscar. Devuelve la POSICIÓN (1-indexada) donde aparece la primera ocurrencia de X, o -1 si no aparece.

Como ÚLTIMA línea imprime exactamente:
    Posicion: X    (sin tilde)`,
        pistas: ['Usa una bandera o variable pos <- -1', 'Recorre con Mientras o Para; para Mientras puedes salir cuando lo encuentres', 'Asegúrate de no sobrescribir pos si ya lo encontraste'],
        plantilla:
`// Ejercicio: Buscar valor en vector
Proceso Buscar
    Definir n, i, buscar, pos Como Entero
    Dimension v[100]
    Leer n
    Para i <- 1 Hasta n Hacer
        Leer v[i]
    FinPara
    Leer buscar
    pos <- -1

    // Búsqueda secuencial

FinProceso`,
        casos: [
            { inputs: ['1', '5', '5'],                                  esperado: ['Posicion: 1'] },
            { inputs: ['3', '1', '2', '3', '2'],                        esperado: ['Posicion: 2'] },
            { inputs: ['3', '1', '2', '3', '4'],                        esperado: ['Posicion: -1'] },
            { inputs: ['5', '10', '20', '30', '40', '50', '30'],        esperado: ['Posicion: 3'] },
            { inputs: ['5', '10', '20', '30', '40', '50', '50'],        esperado: ['Posicion: 5'] },
            { inputs: ['1', '99', '99'],                                esperado: ['Posicion: 1'] },
            { inputs: ['4', '1', '2', '3', '4', '5'],                   esperado: ['Posicion: -1'] },
            { inputs: ['5', '1', '2', '3', '4', '5', '1'],              esperado: ['Posicion: 1'] },
            { inputs: ['6', '7', '7', '7', '7', '7', '7', '7'],         esperado: ['Posicion: 1'] },
            { inputs: ['3', '-1', '-2', '-3', '-2'],                    esperado: ['Posicion: 2'] },
        ],
    },

    // ── ⑧ Menús con Segun — extras ───────────────────────────────────────────
    {
        id: 'dias_mes',
        grupo: '⑧ Menús con Segun',
        titulo: 'Días del mes',
        enunciado:
`Pide el número del mes (1..12) y muestra cuántos días tiene. Asume año NO bisiesto (febrero = 28).

Como ÚLTIMA línea imprime exactamente:
    Dias: X         (sin tilde, si mes en rango)
    Mes no válido   (si fuera de rango)

REQUISITO: usa Segun.`,
        pistas: ['Meses con 31 días: 1, 3, 5, 7, 8, 10, 12', 'Meses con 30 días: 4, 6, 9, 11', 'Febrero (2) = 28', 'Agrupa con: 1, 3, 5, 7, 8, 10, 12: Escribir "Dias: 31"'],
        plantilla:
`// Ejercicio: Días del mes (Segun)
Proceso DiasMes
    Definir mes Como Entero
    Leer mes

    // Segun mes Hacer ... FinSegun

FinProceso`,
        casos: [
            { inputs: ['1'],   esperado: ['Dias: 31'] },
            { inputs: ['2'],   esperado: ['Dias: 28'] },
            { inputs: ['3'],   esperado: ['Dias: 31'] },
            { inputs: ['4'],   esperado: ['Dias: 30'] },
            { inputs: ['7'],   esperado: ['Dias: 31'] },
            { inputs: ['11'],  esperado: ['Dias: 30'] },
            { inputs: ['12'],  esperado: ['Dias: 31'] },
            { inputs: ['0'],   esperado: ['Mes no válido'] },
            { inputs: ['13'],  esperado: ['Mes no válido'] },
            { inputs: ['-1'],  esperado: ['Mes no válido'] },
        ],
    },
    {
        id: 'nombre_mes',
        grupo: '⑧ Menús con Segun',
        titulo: 'Nombre del mes',
        enunciado:
`Pide un número del 1 al 12 y muestra el nombre del mes en español.

Como ÚLTIMA línea imprime exactamente uno de:
    Enero, Febrero, Marzo, Abril, Mayo, Junio,
    Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre,
    Mes no válido

REQUISITO: usa Segun.`,
        pistas: ['Cada caso del Segun imprime un nombre', 'Cuidado con la ortografía: Septiembre (no Setiembre)'],
        plantilla:
`// Ejercicio: Nombre del mes (Segun)
Proceso NombreMes
    Definir mes Como Entero
    Leer mes

    // Segun mes Hacer ... FinSegun

FinProceso`,
        casos: [
            { inputs: ['1'],   esperado: ['Enero'] },
            { inputs: ['2'],   esperado: ['Febrero'] },
            { inputs: ['3'],   esperado: ['Marzo'] },
            { inputs: ['6'],   esperado: ['Junio'] },
            { inputs: ['7'],   esperado: ['Julio'] },
            { inputs: ['9'],   esperado: ['Septiembre'] },
            { inputs: ['10'],  esperado: ['Octubre'] },
            { inputs: ['12'],  esperado: ['Diciembre'] },
            { inputs: ['0'],   esperado: ['Mes no válido'] },
            { inputs: ['13'],  esperado: ['Mes no válido'] },
        ],
    },

    // ── ⑨ Repetir / Hasta Que — extras ───────────────────────────────────────
    {
        id: 'validar_nota_repetir',
        grupo: '⑨ Repetir / Hasta Que',
        titulo: 'Validar nota 0-10 con Repetir',
        enunciado:
`Pide una nota hasta que esté entre 0 y 10 (ambos inclusive). Cuando la nota sea válida, imprime como ÚLTIMA línea:
    Nota válida: X

REQUISITO: usa Repetir / Hasta Que (no Mientras).`,
        pistas: ['Repetir { Leer nota } Hasta Que nota >= 0 Y nota <= 10', 'Los valores incorrectos NO se imprimen, solo se descartan'],
        plantilla:
`// Ejercicio: Validar 0-10 con Repetir
Proceso ValidarNota
    Definir nota Como Real

    // Repetir hasta que la nota sea válida

FinProceso`,
        casos: [
            { inputs: ['5'],                       esperado: ['Nota válida: 5'] },
            { inputs: ['-1', '5'],                 esperado: ['Nota válida: 5'] },
            { inputs: ['11', '5'],                 esperado: ['Nota válida: 5'] },
            { inputs: ['-1', '11', '5'],           esperado: ['Nota válida: 5'] },
            { inputs: ['10'],                      esperado: ['Nota válida: 10'] },
            { inputs: ['0'],                       esperado: ['Nota válida: 0'] },
            { inputs: ['100', '50', '5'],          esperado: ['Nota válida: 5'] },
            { inputs: ['-10', '-5', '7'],          esperado: ['Nota válida: 7'] },
            { inputs: ['15', '20', '3'],           esperado: ['Nota válida: 3'] },
            { inputs: ['8.5'],                     esperado: ['Nota válida: 8.5'] },
        ],
    },
    {
        id: 'contar_hasta_mult7',
        grupo: '⑨ Repetir / Hasta Que',
        titulo: 'Contar hasta múltiplo de 7',
        enunciado:
`Pide números al usuario uno a uno usando Repetir/Hasta Que. Para cuando introduzca un múltiplo de 7 (incluido el 0, que es múltiplo de 7). Cuenta CUÁNTOS números introdujo en total (incluyendo el múltiplo de 7 final).

Como ÚLTIMA línea imprime exactamente:
    Contados: X`,
        pistas: ['contados <- 0', 'Dentro de Repetir: Leer n, contados <- contados + 1', 'Hasta Que n MOD 7 = 0'],
        plantilla:
`// Ejercicio: Contar hasta múltiplo de 7
Proceso ContarHasta7
    Definir n, contados Como Entero
    contados <- 0

    // Repetir Hasta Que n sea múltiplo de 7

FinProceso`,
        casos: [
            { inputs: ['7'],                                          esperado: ['Contados: 1'] },
            { inputs: ['14'],                                         esperado: ['Contados: 1'] },
            { inputs: ['1', '7'],                                     esperado: ['Contados: 2'] },
            { inputs: ['2', '3', '14'],                               esperado: ['Contados: 3'] },
            { inputs: ['10', '20', '21'],                             esperado: ['Contados: 3'] },
            { inputs: ['1', '2', '3', '4', '5', '6', '7'],            esperado: ['Contados: 7'] },
            { inputs: ['0'],                                          esperado: ['Contados: 1'] },
            { inputs: ['1', '2', '3', '4', '5', '6', '49'],           esperado: ['Contados: 7'] },
            { inputs: ['100', '7'],                                   esperado: ['Contados: 2'] },
            { inputs: ['8', '9', '14'],                               esperado: ['Contados: 3'] },
        ],
    },

    // ── ⑩ Números aleatorios — extras ────────────────────────────────────────
    {
        id: 'lanzar_monedas',
        grupo: '⑩ Números aleatorios',
        titulo: 'Lanzar N monedas',
        nota: 'Usa Aleatorio. El grader comprueba que el formato es "Caras: X, Cruces: Y" y que X + Y = N. No se comprueban los valores exactos.',
        enunciado:
`Pide un número N. Lanza N monedas con Aleatorio(0, 1): considera 0 = cara, 1 = cruz. Cuenta cuántas caras y cuántas cruces salen.

Como ÚLTIMA línea imprime exactamente:
    Caras: X, Cruces: Y`,
        pistas: ['Usa Aleatorio(0, 1) dentro de un bucle Para', 'Si el resultado es 0 sumas caras, si es 1 sumas cruces', 'Caras + Cruces siempre tiene que dar N'],
        plantilla:
`// Ejercicio: Lanzar N monedas
Proceso Monedas
    Definir n, i, caras, cruces, r Como Entero
    Leer n
    caras <- 0
    cruces <- 0

    // Bucle Para con Aleatorio(0, 1)

FinProceso`,
        casos: [1, 2, 5, 10, 20, 50, 100, 3, 7, 1000].map(n => ({
            inputs: [String(n)],
            check: (outputs) => {
                const tail = outputs.map(s => String(s).trimEnd()).filter(s => s.length > 0).slice(-1)[0] || '';
                const m = tail.match(/^Caras:\s*(\d+),\s*Cruces:\s*(\d+)$/);
                if (!m) return false;
                const c = parseInt(m[1], 10);
                const x = parseInt(m[2], 10);
                return c >= 0 && x >= 0 && c + x === n;
            },
        })),
    },
    {
        id: 'mayores_50',
        grupo: '⑩ Números aleatorios',
        titulo: 'Aleatorios > 50',
        nota: 'Usa Aleatorio. El grader comprueba el formato "Mayores: X" y que X está en el rango [0, N].',
        enunciado:
`Pide N. Genera N números aleatorios entre 1 y 100 con Aleatorio(1, 100). Cuenta cuántos son MAYORES que 50 (estrictamente).

Como ÚLTIMA línea imprime exactamente:
    Mayores: X`,
        pistas: ['Bucle Para i <- 1 Hasta n', 'Genera r <- Aleatorio(1, 100)', 'Si r > 50 entonces incrementa mayores'],
        plantilla:
`// Ejercicio: Aleatorios mayores que 50
Proceso Mayores50
    Definir n, i, r, mayores Como Entero
    Leer n
    mayores <- 0

    // Bucle Para que cuenta cuántos Aleatorio(1,100) son > 50

FinProceso`,
        casos: [1, 5, 10, 20, 50, 100, 3, 7, 200, 2].map(n => ({
            inputs: [String(n)],
            check: (outputs) => {
                const tail = outputs.map(s => String(s).trimEnd()).filter(s => s.length > 0).slice(-1)[0] || '';
                const m = tail.match(/^Mayores:\s*(\d+)$/);
                if (!m) return false;
                const v = parseInt(m[1], 10);
                return v >= 0 && v <= n;
            },
        })),
    },

    // ── ⑪ Cadenas — extras ───────────────────────────────────────────────────
    {
        id: 'invertir_cadena',
        grupo: '⑪ Cadenas',
        titulo: 'Invertir una palabra',
        enunciado:
`Pide una palabra y muéstrala con sus caracteres en orden inverso.

Como ÚLTIMA línea imprime exactamente:
    Invertida: X`,
        pistas: ['Inicializa una cadena vacía: inv <- ""', 'Recorre desde i = Longitud(palabra) hasta 1 con paso -1', 'En cada iteración: inv <- Concatenar(inv, Subcadena(palabra, i, i))'],
        plantilla:
`// Ejercicio: Invertir palabra
Proceso InvertirPalabra
    Definir palabra, inv Como Cadena
    Definir i, n Como Entero
    Leer palabra
    n <- Longitud(palabra)
    inv <- ""

    // Recorre desde el final hasta el principio

FinProceso`,
        casos: [
            { inputs: ['hola'],     esperado: ['Invertida: aloh'] },
            { inputs: ['casa'],     esperado: ['Invertida: asac'] },
            { inputs: ['a'],        esperado: ['Invertida: a'] },
            { inputs: ['ab'],       esperado: ['Invertida: ba'] },
            { inputs: ['oso'],      esperado: ['Invertida: oso'] },
            { inputs: ['programa'], esperado: ['Invertida: amargorp'] },
            { inputs: ['amor'],     esperado: ['Invertida: roma'] },
            { inputs: ['12345'],    esperado: ['Invertida: 54321'] },
            { inputs: ['xy'],       esperado: ['Invertida: yx'] },
            { inputs: ['neuquen'],  esperado: ['Invertida: neuquen'] },
        ],
    },
    {
        id: 'empieza_vocal',
        grupo: '⑪ Cadenas',
        titulo: '¿Empieza por vocal?',
        enunciado:
`Pide una palabra (escrita en minúsculas, sin acentos). Determina si su primera letra es una vocal (a, e, i, o, u).

Como ÚLTIMA línea imprime exactamente:
    SI   o   NO`,
        pistas: ['Obtén la primera letra: c <- Subcadena(palabra, 1, 1)', 'Comprueba si c = "a" O c = "e" O ...'],
        plantilla:
`// Ejercicio: ¿Empieza por vocal?
Proceso EmpiezaVocal
    Definir palabra, c Como Cadena
    Leer palabra
    c <- Subcadena(palabra, 1, 1)

    // Comprueba si c es vocal

FinProceso`,
        casos: [
            { inputs: ['hola'],      esperado: ['NO'] },
            { inputs: ['amor'],      esperado: ['SI'] },
            { inputs: ['economia'],  esperado: ['SI'] },
            { inputs: ['barco'],     esperado: ['NO'] },
            { inputs: ['idea'],      esperado: ['SI'] },
            { inputs: ['oso'],       esperado: ['SI'] },
            { inputs: ['urgente'],   esperado: ['SI'] },
            { inputs: ['casa'],      esperado: ['NO'] },
            { inputs: ['edificio'],  esperado: ['SI'] },
            { inputs: ['zorro'],     esperado: ['NO'] },
        ],
    },

    // ── ⑫ Funciones matemáticas ──────────────────────────────────────────────
    {
        id: 'area_circulo',
        grupo: '⑫ Funciones matemáticas',
        titulo: 'Área del círculo',
        enunciado:
`Pide el radio R de un círculo y calcula su área:
    área = π · r²

Muestra el área redondeada al entero más cercano (usa la función Redon).

Como ÚLTIMA línea imprime exactamente:
    Area: X

(Usa "Area" sin tilde para que el grader sea estricto.)`,
        pistas: [
            'La constante PI ya está definida (no necesitas paréntesis)',
            'Usa el operador ^ para el cuadrado: r ^ 2',
            'Redondea con: a <- Redon(PI * r ^ 2)',
        ],
        plantilla:
`// Ejercicio: Área del círculo
Proceso AreaCirculo
    Definir r Como Real
    Definir a Como Entero
    Escribir "Introduce el radio:"
    Leer r

    // Calcula a <- Redon(PI * r ^ 2) y muéstralo

FinProceso`,
        casos: [
            { inputs: ['0'],   esperado: ['Area: 0'] },
            { inputs: ['1'],   esperado: ['Area: 3'] },
            { inputs: ['2'],   esperado: ['Area: 13'] },
            { inputs: ['3'],   esperado: ['Area: 28'] },
            { inputs: ['4'],   esperado: ['Area: 50'] },
            { inputs: ['5'],   esperado: ['Area: 79'] },
            { inputs: ['6'],   esperado: ['Area: 113'] },
            { inputs: ['7'],   esperado: ['Area: 154'] },
            { inputs: ['10'],  esperado: ['Area: 314'] },
            { inputs: ['15'],  esperado: ['Area: 707'] },
        ],
    },
    {
        id: 'hipotenusa',
        grupo: '⑫ Funciones matemáticas',
        titulo: 'Hipotenusa (Pitágoras)',
        enunciado:
`Pide los dos catetos A y B de un triángulo rectángulo y calcula la hipotenusa: h = √(a² + b²).

Muestra el resultado redondeado al entero más cercano (usa Redon y RC).

Como ÚLTIMA línea imprime exactamente:
    Hipotenusa: X`,
        pistas: ['Usa RC para la raíz cuadrada y ^ para el cuadrado', 'h <- Redon(RC(a ^ 2 + b ^ 2))', 'Aprovecha las ternas pitagóricas (3-4-5, 5-12-13, ...) para entender el caso'],
        plantilla:
`// Ejercicio: Hipotenusa
Proceso Hipotenusa
    Definir a, b Como Real
    Definir h Como Entero
    Leer a
    Leer b

    // Calcula y muestra

FinProceso`,
        casos: [
            { inputs: ['3', '4'],     esperado: ['Hipotenusa: 5'] },
            { inputs: ['5', '12'],    esperado: ['Hipotenusa: 13'] },
            { inputs: ['8', '15'],    esperado: ['Hipotenusa: 17'] },
            { inputs: ['6', '8'],     esperado: ['Hipotenusa: 10'] },
            { inputs: ['7', '24'],    esperado: ['Hipotenusa: 25'] },
            { inputs: ['1', '1'],     esperado: ['Hipotenusa: 1'] },
            { inputs: ['0', '0'],     esperado: ['Hipotenusa: 0'] },
            { inputs: ['9', '12'],    esperado: ['Hipotenusa: 15'] },
            { inputs: ['1', '2'],     esperado: ['Hipotenusa: 2'] },
            { inputs: ['20', '21'],   esperado: ['Hipotenusa: 29'] },
        ],
    },
    {
        id: 'distancia_puntos',
        grupo: '⑫ Funciones matemáticas',
        titulo: 'Distancia entre dos puntos',
        enunciado:
`Pide las coordenadas de dos puntos: (x1, y1) y (x2, y2). Calcula la distancia euclidiana:
    d = √((x2 − x1)² + (y2 − y1)²)

Muestra el resultado redondeado al entero más cercano.

Como ÚLTIMA línea imprime exactamente:
    Distancia: X`,
        pistas: ['Lee los cuatro valores en orden: x1, y1, x2, y2', 'd <- Redon(RC((x2 - x1) ^ 2 + (y2 - y1) ^ 2))'],
        plantilla:
`// Ejercicio: Distancia entre puntos
Proceso Distancia
    Definir x1, y1, x2, y2 Como Real
    Definir d Como Entero
    Leer x1
    Leer y1
    Leer x2
    Leer y2

    // Calcula y muestra

FinProceso`,
        casos: [
            { inputs: ['0', '0', '3', '4'],      esperado: ['Distancia: 5'] },
            { inputs: ['0', '0', '0', '0'],      esperado: ['Distancia: 0'] },
            { inputs: ['1', '1', '4', '5'],      esperado: ['Distancia: 5'] },
            { inputs: ['0', '0', '5', '12'],     esperado: ['Distancia: 13'] },
            { inputs: ['-1', '-1', '2', '3'],    esperado: ['Distancia: 5'] },
            { inputs: ['0', '0', '1', '1'],      esperado: ['Distancia: 1'] },
            { inputs: ['10', '10', '13', '14'],  esperado: ['Distancia: 5'] },
            { inputs: ['0', '0', '8', '15'],     esperado: ['Distancia: 17'] },
            { inputs: ['5', '5', '5', '10'],     esperado: ['Distancia: 5'] },
            { inputs: ['0', '0', '7', '24'],     esperado: ['Distancia: 25'] },
        ],
    },
];

// ── Grader ───────────────────────────────────────────────────────────────────
// Compara las últimas N líneas de los outputs (trimmed, sin líneas vacías)
// contra el array `esperado`. Si el caso define `check(outputs)`, se usa esa
// función directamente (útil para Aleatorio).
function checkCase(outputs, caso) {
    if (typeof caso.check === 'function') {
        try { return caso.check(outputs); } catch (_) { return false; }
    }
    if (!caso.esperado) return false;
    const clean = outputs.map(s => String(s).trimEnd()).filter(s => s.length > 0);
    const exp = caso.esperado.map(s => String(s).trimEnd());
    if (clean.length < exp.length) return false;
    const tail = clean.slice(clean.length - exp.length);
    return tail.every((line, idx) => line === exp[idx]);
}

async function gradeExercise(exercise, source) {
    const results = [];
    let passCount = 0;

    for (let i = 0; i < exercise.casos.length; i++) {
        const caso = exercise.casos[i];
        const outputs = [];
        let inputIdx = 0;
        let errorMsg = null;

        try {
            await runPseudo(source, {
                output: (text) => outputs.push(text),
                input: () => Promise.resolve(caso.inputs[inputIdx++] ?? ''),
            });
        } catch (err) {
            errorMsg = err && err.message ? err.message : String(err);
        }

        const passed = !errorMsg && checkCase(outputs, caso);
        if (passed) passCount++;

        results.push({
            idx: i + 1,
            inputs: caso.inputs.slice(),
            esperado: caso.esperado ? caso.esperado.slice() : null,
            obtenido: outputs.slice(),
            errorMsg,
            passed,
        });
    }

    return {
        score: passCount,
        total: exercise.casos.length,
        results,
    };
}

// ── Persistencia de notas en localStorage ────────────────────────────────────
const EX_SCORES_KEY = 'pseudoweb.scores';

function getAllScores() {
    try { return JSON.parse(localStorage.getItem(EX_SCORES_KEY)) || {}; }
    catch (_) { return {}; }
}
function getScore(id) {
    return getAllScores()[id];
}
function saveScore(id, score) {
    const all = getAllScores();
    if (all[id] === undefined || all[id] < score) {
        all[id] = score;
        try { localStorage.setItem(EX_SCORES_KEY, JSON.stringify(all)); } catch (_) {}
        return true;   // nuevo récord
    }
    return false;
}

window.PseudoExercises = {
    EXERCISES,
    gradeExercise,
    checkCase,
    getAllScores,
    getScore,
    saveScore,
};
