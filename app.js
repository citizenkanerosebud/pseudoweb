// PseudoWeb — wiring de la UI (MVP v0.1)
// Conecta el editor + botones con runPseudo() del intérprete.

(function () {
    const editor      = document.getElementById('editor');
    const output      = document.getElementById('output');
    const btnRun      = document.getElementById('btnRun');
    const btnClear    = document.getElementById('btnClear');
    const btnNuevo    = document.getElementById('btnNuevo');
    const examplesSel = document.getElementById('examples');
    const inputRow    = document.getElementById('inputRow');
    const inputLabel  = document.getElementById('inputLabel');
    const inputField  = document.getElementById('inputField');

    const STORAGE_KEY = 'pseudoweb.draft';
    const STARTER_TEMPLATE =
`// Mi nuevo algoritmo
Proceso MiAlgoritmo
    // 1) Declara aquí tus variables
    Definir x Como Entero

    // 2) Pide datos al usuario
    Escribir "Introduce un número:"
    Leer x

    // 3) Procesa y muestra el resultado
    Escribir "Has introducido: ", x
FinProceso`;

    // ── Ejemplos precargados (organizados por nivel didáctico) ────────────
    const EXAMPLES = {
        // ── ① Básico — entrada / salida / operaciones aritméticas ─────────
        hola:
`// Saluda al usuario por su nombre
Proceso HolaMundo
    Definir nombre Como Cadena
    Escribir "¿Cómo te llamas?"
    Leer nombre
    Escribir "¡Hola, ", nombre, "!"
FinProceso`,

        suma2:
`// Suma dos números introducidos por el usuario
Proceso Suma
    Definir a, b, s Como Real
    Escribir "Introduce el primer número:"
    Leer a
    Escribir "Introduce el segundo número:"
    Leer b
    s <- a + b
    Escribir a, " + ", b, " = ", s
FinProceso`,

        area_rect:
`// Calcula el área de un rectángulo (base x altura)
Proceso AreaRectangulo
    Definir base, altura, area Como Real
    Escribir "Base del rectángulo:"
    Leer base
    Escribir "Altura del rectángulo:"
    Leer altura
    area <- base * altura
    Escribir "Área = ", area, " unidades cuadradas"
FinProceso`,

        // ── ② Condicional simple (Si / SiNo) ──────────────────────────────
        par:
`// Determina si un número es par o impar — Si / SiNo simple
Proceso ParImpar
    Definir n Como Entero
    Escribir "Introduce un número entero:"
    Leer n
    Si n MOD 2 = 0 Entonces
        Escribir n, " es PAR"
    SiNo
        Escribir n, " es IMPAR"
    FinSi
FinProceso`,

        signo:
`// Determina el signo: positivo, negativo o cero
// Ejemplo de Si/SiNo anidado (un Si dentro del SiNo de otro)
Proceso Signo
    Definir n Como Real
    Escribir "Introduce un número:"
    Leer n
    Si n > 0 Entonces
        Escribir n, " es POSITIVO"
    SiNo
        Si n < 0 Entonces
            Escribir n, " es NEGATIVO"
        SiNo
            Escribir "El número es CERO"
        FinSi
    FinSi
FinProceso`,

        mayor_edad:
`// Comprueba si una persona es mayor de edad — condicional simple con cálculo
Proceso MayorEdad
    Definir edad Como Entero
    Escribir "¿Cuántos años tienes?"
    Leer edad
    Si edad >= 18 Entonces
        Escribir "Eres mayor de edad (", edad, " años)"
    SiNo
        Escribir "Eres menor de edad. Te faltan ", 18 - edad, " años"
    FinSi
FinProceso`,

        // ── ③ Condicionales múltiples (anidados / encadenados) ────────────
        mayor3:
`// Encuentra el mayor de tres números (dos comparaciones encadenadas)
Proceso MayorDeTres
    Definir a, b, c, mayor Como Real
    Escribir "Introduce tres números (uno por uno):"
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
    Escribir "El mayor es ", mayor
FinProceso`,

        nota:
`// Convierte una nota numérica (0-10) en una calificación textual
// Ejemplo de condicionales múltiples encadenados (if/elif clásico)
Proceso Calificacion
    Definir nota Como Real
    Escribir "Introduce la nota (0-10):"
    Leer nota
    Si nota < 0 O nota > 10 Entonces
        Escribir "Nota fuera de rango"
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

        triangulo:
`// Clasifica un triángulo según sus lados — uso de operadores lógicos Y / O
Proceso TipoTriangulo
    Definir a, b, c Como Real
    Escribir "Introduce los tres lados (uno por uno):"
    Leer a
    Leer b
    Leer c
    Si a = b Y b = c Entonces
        Escribir "Triángulo EQUILÁTERO"
    SiNo
        Si a = b O b = c O a = c Entonces
            Escribir "Triángulo ISÓSCELES"
        SiNo
            Escribir "Triángulo ESCALENO"
        FinSi
    FinSi
FinProceso`,

        // ── ④ Bucle Para (iteración controlada por contador) ──────────────
        tabla:
`// Imprime la tabla de multiplicar de un número
Proceso Tabla
    Definir n, i Como Entero
    Escribir "Tabla de multiplicar del:"
    Leer n
    Para i <- 1 Hasta 10 Hacer
        Escribir n, " x ", i, " = ", n * i
    FinPara
FinProceso`,

        factorial:
`// Calcula el factorial: n! = 1 * 2 * 3 * ... * n
Proceso Factorial
    Definir n, i, f Como Entero
    Escribir "Calcula el factorial de:"
    Leer n
    f <- 1
    Para i <- 1 Hasta n Hacer
        f <- f * i
    FinPara
    Escribir n, "! = ", f
FinProceso`,

        fibonacci:
`// Imprime los N primeros términos de la serie de Fibonacci
// Patrón: se usa una variable temporal (sig) para no perder el valor anterior
Proceso Fibonacci
    Definir n, i, a, b, sig Como Entero
    Escribir "¿Cuántos términos de Fibonacci quieres ver?"
    Leer n
    a <- 0
    b <- 1
    Para i <- 1 Hasta n Hacer
        Escribir "Término ", i, ": ", a
        sig <- a + b
        a <- b
        b <- sig
    FinPara
FinProceso`,

        // ── ⑤ Bucle Mientras (iteración controlada por condición) ─────────
        suma_n:
`// Suma los primeros N números naturales con un Mientras
Proceso SumaN
    Definir n, i, s Como Entero
    Escribir "¿Hasta qué número sumar?"
    Leer n
    s <- 0
    i <- 1
    Mientras i <= n Hacer
        s <- s + i
        i <- i + 1
    FinMientras
    Escribir "La suma de 1 a ", n, " es ", s
FinProceso`,

        validar:
`// Valida que la entrada esté entre 0 y 10
// Patrón: se inicializa con un valor "imposible" para que entre al bucle
Proceso ValidarNota
    Definir nota Como Real
    nota <- -1
    Mientras nota < 0 O nota > 10 Hacer
        Escribir "Introduce una nota entre 0 y 10:"
        Leer nota
        Si nota < 0 O nota > 10 Entonces
            Escribir "  → Valor incorrecto. Inténtalo de nuevo."
        FinSi
    FinMientras
    Escribir "Nota aceptada: ", nota
FinProceso`,

        adivinar:
`// Juego: adivina el número secreto. Cuenta el número de intentos.
// Usa Aleatorio(1, 100) para que el número cambie cada vez que ejecutes
Proceso Adivina
    Definir secreto, intento, intentos Como Entero
    secreto <- Aleatorio(1, 100)
    intentos <- 0
    intento <- -1
    Escribir "Adivina el número secreto (entre 1 y 100):"
    Mientras intento <> secreto Hacer
        Leer intento
        intentos <- intentos + 1
        Si intento < secreto Entonces
            Escribir "  → Mi número es MAYOR. Sigue intentando."
        SiNo
            Si intento > secreto Entonces
                Escribir "  → Mi número es MENOR. Sigue intentando."
            FinSi
        FinSi
    FinMientras
    Escribir "¡Lo conseguiste en ", intentos, " intentos!"
FinProceso`,

        promedio:
`// Calcula el promedio de una serie de números
// Patrón centinela: se termina cuando se introduce -1
Proceso Promedio
    Definir n, suma, prom Como Real
    Definir contador Como Entero
    suma <- 0
    contador <- 0
    Escribir "Introduce números (-1 para terminar):"
    Leer n
    Mientras n <> -1 Hacer
        suma <- suma + n
        contador <- contador + 1
        Leer n
    FinMientras
    Si contador > 0 Entonces
        prom <- suma / contador
        Escribir "Promedio de ", contador, " números: ", prom
    SiNo
        Escribir "No se introdujeron números"
    FinSi
FinProceso`,

        // ── ⑥ Algoritmos clásicos ─────────────────────────────────────────
        primo:
`// Determina si un número es primo
// Optimización clásica: solo divide hasta la raíz cuadrada (i*i <= n)
// Variable bandera (es_primo) para salir del bucle cuando se encuentra divisor
Proceso EsPrimo
    Definir n, i Como Entero
    Definir es_primo Como Logico
    Escribir "Introduce un número entero positivo:"
    Leer n
    Si n < 2 Entonces
        Escribir n, " NO es primo (los primos son >= 2)"
    SiNo
        es_primo <- Verdadero
        i <- 2
        Mientras i * i <= n Y es_primo Hacer
            Si n MOD i = 0 Entonces
                es_primo <- Falso
            FinSi
            i <- i + 1
        FinMientras
        Si es_primo Entonces
            Escribir n, " SÍ es primo"
        SiNo
            Escribir n, " NO es primo"
        FinSi
    FinSi
FinProceso`,

        mcd:
`// Máximo común divisor por el algoritmo de Euclides
// Idea: MCD(a, b) = MCD(b, a MOD b)  hasta que b sea 0
Proceso MaximoComunDivisor
    Definir a, b, resto Como Entero
    Escribir "Calcula el MCD de dos números enteros."
    Escribir "Introduce el primero:"
    Leer a
    Escribir "Introduce el segundo:"
    Leer b
    Mientras b <> 0 Hacer
        resto <- a MOD b
        a <- b
        b <- resto
    FinMientras
    Escribir "El MCD es: ", a
FinProceso`,

        invertir:
`// Invierte los dígitos de un número entero (1234 → 4321)
// Técnica: extraer el último dígito con MOD 10 y "empujarlo" a la izquierda
// Aprovecha que al asignar a una variable Entero se trunca automáticamente
Proceso InvertirNumero
    Definir n, invertido, digito Como Entero
    Escribir "Introduce un número entero positivo:"
    Leer n
    invertido <- 0
    Mientras n > 0 Hacer
        digito <- n MOD 10           // último dígito
        invertido <- invertido * 10 + digito
        n <- n / 10                  // al ser Entero, se trunca (123 → 12)
    FinMientras
    Escribir "Número invertido: ", invertido
FinProceso`,

        // ── ⑦ Listas / arreglos (Dimension) ───────────────────────────────
        suma_vector:
`// Lee N números en un vector y calcula la suma
// Dimension reserva memoria para un array de 1..N (1-indexado)
Proceso SumaVector
    Definir n, i, suma Como Entero
    Dimension v[100]
    Escribir "¿Cuántos números vas a introducir?"
    Leer n
    Para i <- 1 Hasta n Hacer
        Escribir "Número ", i, ":"
        Leer v[i]
    FinPara
    suma <- 0
    Para i <- 1 Hasta n Hacer
        suma <- suma + v[i]
    FinPara
    Escribir "La suma de los ", n, " números es: ", suma
FinProceso`,

        max_vector:
`// Encuentra el valor máximo en un vector
// Patrón clásico: inicializamos max con el primer elemento y recorremos el resto
Proceso MaximoVector
    Definir n, i, max Como Entero
    Dimension v[100]
    Escribir "¿Cuántos números?"
    Leer n
    Para i <- 1 Hasta n Hacer
        Escribir "Elemento ", i, ":"
        Leer v[i]
    FinPara
    max <- v[1]
    Para i <- 2 Hasta n Hacer
        Si v[i] > max Entonces
            max <- v[i]
        FinSi
    FinPara
    Escribir "El máximo es: ", max
FinProceso`,

        busqueda:
`// Búsqueda secuencial: localiza la posición de un valor en el vector
// Devuelve -1 si no aparece. Usa una bandera para salir del bucle al encontrarlo.
Proceso BusquedaSecuencial
    Definir n, i, buscar, pos Como Entero
    Dimension v[100]
    Escribir "¿Cuántos elementos tiene el vector?"
    Leer n
    Para i <- 1 Hasta n Hacer
        Escribir "Elemento ", i, ":"
        Leer v[i]
    FinPara
    Escribir "¿Qué valor quieres buscar?"
    Leer buscar
    pos <- -1
    i <- 1
    Mientras i <= n Y pos = -1 Hacer
        Si v[i] = buscar Entonces
            pos <- i
        FinSi
        i <- i + 1
    FinMientras
    Si pos <> -1 Entonces
        Escribir "Encontrado en la posición ", pos
    SiNo
        Escribir "El valor ", buscar, " no está en el vector"
    FinSi
FinProceso`,

        invertir_vector:
`// Invierte el orden de los elementos de un vector
// Se intercambian las parejas v[i] ↔ v[n-i+1] hasta la mitad
Proceso InvertirVector
    Definir n, i, mitad, temp Como Entero
    Dimension v[100]
    Escribir "¿Cuántos elementos?"
    Leer n
    Para i <- 1 Hasta n Hacer
        Escribir "Elemento ", i, ":"
        Leer v[i]
    FinPara
    mitad <- n / 2
    Para i <- 1 Hasta mitad Hacer
        temp <- v[i]
        v[i] <- v[n - i + 1]
        v[n - i + 1] <- temp
    FinPara
    Escribir "Vector invertido:"
    Para i <- 1 Hasta n Hacer
        Escribir "  [", i, "] = ", v[i]
    FinPara
FinProceso`,

        burbuja:
`// Ordenación burbuja: compara pares adyacentes y los intercambia hasta ordenar
// Complejidad O(n²) — sirve para aprender, no para grandes datos
Proceso OrdenarBurbuja
    Definir n, i, j, temp Como Entero
    Dimension v[100]
    Escribir "¿Cuántos elementos?"
    Leer n
    Para i <- 1 Hasta n Hacer
        Escribir "Elemento ", i, ":"
        Leer v[i]
    FinPara
    Para i <- 1 Hasta n - 1 Hacer
        Para j <- 1 Hasta n - i Hacer
            Si v[j] > v[j + 1] Entonces
                temp <- v[j]
                v[j] <- v[j + 1]
                v[j + 1] <- temp
            FinSi
        FinPara
    FinPara
    Escribir "Vector ordenado:"
    Para i <- 1 Hasta n Hacer
        Escribir "  ", v[i]
    FinPara
FinProceso`,

        // ── ⑧ Menús (estructura Segun / FinSegun) ─────────────────────────
        calculadora:
`// Calculadora con menú interactivo — patrón "Mientras opción <> 0"
// Demuestra la estructura Segun (switch/case) sobre la variable opcion
Proceso Calculadora
    Definir a, b, resultado Como Real
    Definir opcion Como Entero
    opcion <- -1
    Mientras opcion <> 0 Hacer
        Escribir ""
        Escribir "═══ CALCULADORA ═══"
        Escribir "  1. Sumar"
        Escribir "  2. Restar"
        Escribir "  3. Multiplicar"
        Escribir "  4. Dividir"
        Escribir "  0. Salir"
        Escribir "Elige una opción:"
        Leer opcion
        Si opcion >= 1 Y opcion <= 4 Entonces
            Escribir "Introduce a:"
            Leer a
            Escribir "Introduce b:"
            Leer b
            Segun opcion Hacer
                1:
                    resultado <- a + b
                    Escribir a, " + ", b, " = ", resultado
                2:
                    resultado <- a - b
                    Escribir a, " - ", b, " = ", resultado
                3:
                    resultado <- a * b
                    Escribir a, " x ", b, " = ", resultado
                4:
                    Si b <> 0 Entonces
                        resultado <- a / b
                        Escribir a, " / ", b, " = ", resultado
                    SiNo
                        Escribir "Error: división por cero"
                    FinSi
            FinSegun
        SiNo
            Si opcion <> 0 Entonces
                Escribir "Opción no válida"
            FinSi
        FinSi
    FinMientras
    Escribir "¡Hasta luego!"
FinProceso`,

        gestor_notas:
`// Gestor de notas: añadir, listar, calcular promedio
// Combina menú (Segun) + lista (Dimension) + bucle de aplicación
Proceso GestorNotas
    Definir n, i, opcion Como Entero
    Definir suma, promedio Como Real
    Dimension notas[100]
    n <- 0
    opcion <- -1
    Mientras opcion <> 0 Hacer
        Escribir ""
        Escribir "═══ GESTOR DE NOTAS ═══"
        Escribir "  1. Añadir nota"
        Escribir "  2. Ver todas las notas"
        Escribir "  3. Calcular promedio"
        Escribir "  0. Salir"
        Escribir "Elige una opción:"
        Leer opcion
        Segun opcion Hacer
            1:
                n <- n + 1
                Escribir "Introduce la nota ", n, ":"
                Leer notas[n]
            2:
                Si n = 0 Entonces
                    Escribir "  (no hay notas registradas)"
                SiNo
                    Escribir "Notas registradas:"
                    Para i <- 1 Hasta n Hacer
                        Escribir "  Nota ", i, ": ", notas[i]
                    FinPara
                FinSi
            3:
                Si n = 0 Entonces
                    Escribir "  (no hay notas para promediar)"
                SiNo
                    suma <- 0
                    Para i <- 1 Hasta n Hacer
                        suma <- suma + notas[i]
                    FinPara
                    promedio <- suma / n
                    Escribir "Promedio (", n, " notas): ", promedio
                FinSi
            De Otro Modo:
                Si opcion <> 0 Entonces
                    Escribir "  → Opción no válida"
                FinSi
        FinSegun
    FinMientras
    Escribir "Saliendo del gestor..."
FinProceso`,

        conversor:
`// Conversor de unidades con menú
// Cada opción aplica una fórmula distinta — buen ejercicio para practicar Segun
Proceso Conversor
    Definir valor, resultado Como Real
    Definir opcion Como Entero
    opcion <- -1
    Mientras opcion <> 0 Hacer
        Escribir ""
        Escribir "═══ CONVERSOR ═══"
        Escribir "  1. Celsius → Fahrenheit"
        Escribir "  2. Fahrenheit → Celsius"
        Escribir "  3. Kilómetros → Millas"
        Escribir "  4. Millas → Kilómetros"
        Escribir "  0. Salir"
        Leer opcion
        Si opcion >= 1 Y opcion <= 4 Entonces
            Escribir "Valor a convertir:"
            Leer valor
            Segun opcion Hacer
                1:
                    resultado <- valor * 9 / 5 + 32
                    Escribir valor, " °C = ", resultado, " °F"
                2:
                    resultado <- (valor - 32) * 5 / 9
                    Escribir valor, " °F = ", resultado, " °C"
                3:
                    resultado <- valor * 0.621371
                    Escribir valor, " km = ", resultado, " millas"
                4:
                    resultado <- valor / 0.621371
                    Escribir valor, " millas = ", resultado, " km"
            FinSegun
        FinSi
    FinMientras
FinProceso`,

        // ── ⑨ Bucle Repetir / Hasta Que ───────────────────────────────────
        validar_repetir:
`// Validar entrada con Repetir/Hasta Que
// Repetir comprueba la condición AL FINAL → el bucle se ejecuta al menos una vez
// Más limpio que Mientras: no hace falta inicializar con un valor "imposible"
Proceso ValidarNota
    Definir nota Como Real
    Repetir
        Escribir "Introduce una nota entre 0 y 10:"
        Leer nota
        Si nota < 0 O nota > 10 Entonces
            Escribir "  → Valor incorrecto. Inténtalo de nuevo."
        FinSi
    Hasta Que nota >= 0 Y nota <= 10
    Escribir "Nota aceptada: ", nota
FinProceso`,

        menu_repetir:
`// Menú principal con Repetir/Hasta Que (sale cuando opción = 0)
// Patrón muy común — más natural que el "Mientras opción <> 0" con valor inicial
Proceso MenuPrincipal
    Definir opcion Como Entero
    Repetir
        Escribir ""
        Escribir "═══ MENÚ ═══"
        Escribir "  1. Saludar"
        Escribir "  2. Decir la hora (simulada)"
        Escribir "  0. Salir"
        Escribir "Elige una opción:"
        Leer opcion
        Segun opcion Hacer
            1: Escribir "¡Hola!"
            2: Escribir "Son las ", Aleatorio(0, 23), ":", Aleatorio(0, 59)
            0: Escribir "Saliendo..."
            De Otro Modo: Escribir "Opción no válida"
        FinSegun
    Hasta Que opcion = 0
FinProceso`,

        tabla_repetir:
`// Imprimir tablas de multiplicar — repite mientras el usuario quiera
// Usa una cadena ("s"/"n") como respuesta y compara
Proceso TablasRepetidas
    Definir n, i Como Entero
    Definir continuar Como Cadena
    Repetir
        Escribir "¿Tabla de qué número quieres ver?"
        Leer n
        Para i <- 1 Hasta 10 Hacer
            Escribir n, " x ", i, " = ", n * i
        FinPara
        Escribir "¿Otra tabla? (s/n):"
        Leer continuar
        continuar <- Minusculas(continuar)
    Hasta Que continuar = "n"
    Escribir "¡Hasta otra!"
FinProceso`,

        // ── ⑩ Números aleatorios y juegos ─────────────────────────────────
        dado:
`// Tirar un dado N veces y contar la frecuencia de cada cara (1..6)
// Combina Aleatorio + arreglo + bucle Para
Proceso TirarDado
    Definir n, i, cara Como Entero
    Dimension frecuencias[6]
    Para i <- 1 Hasta 6 Hacer
        frecuencias[i] <- 0
    FinPara
    Escribir "¿Cuántas tiradas quieres simular?"
    Leer n
    Para i <- 1 Hasta n Hacer
        cara <- Aleatorio(1, 6)
        frecuencias[cara] <- frecuencias[cara] + 1
    FinPara
    Escribir ""
    Escribir "Frecuencias tras ", n, " tiradas:"
    Para i <- 1 Hasta 6 Hacer
        Escribir "  Cara ", i, ": ", frecuencias[i]
    FinPara
FinProceso`,

        piedra_papel_tijera:
`// Piedra, Papel, Tijera contra la máquina
// La máquina elige al azar con Aleatorio(1, 3)
Proceso PPT
    Definir jugador, maquina Como Entero
    Escribir "1 = Piedra · 2 = Papel · 3 = Tijera"
    Escribir "Tu jugada:"
    Leer jugador
    maquina <- Aleatorio(1, 3)
    Escribir "Tú elegiste: ", jugador
    Escribir "Máquina elige: ", maquina
    Si jugador = maquina Entonces
        Escribir "🤝 Empate"
    SiNo
        Si (jugador = 1 Y maquina = 3) O (jugador = 2 Y maquina = 1) O (jugador = 3 Y maquina = 2) Entonces
            Escribir "🏆 ¡Ganas tú!"
        SiNo
            Escribir "💻 Gana la máquina"
        FinSi
    FinSi
FinProceso`,

        // ── ⑪ Cadenas de texto ────────────────────────────────────────────
        longitud_palabra:
`// Pedir una palabra y mostrar cuántos caracteres tiene
// Longitud(cadena) devuelve el número de caracteres
Proceso LongitudPalabra
    Definir palabra Como Cadena
    Definir n Como Entero
    Escribir "Introduce una palabra:"
    Leer palabra
    n <- Longitud(palabra)
    Escribir "La palabra '", palabra, "' tiene ", n, " caracteres"
FinProceso`,

        palindromo:
`// ¿Es palíndromo? — una palabra que se lee igual al derecho y al revés
// Compara cada carácter con su simétrico desde el final
// Subcadena(s, i, i) devuelve el carácter en la posición i (1-indexado)
Proceso EsPalindromo
    Definir palabra Como Cadena
    Definir n, i Como Entero
    Definir es_pal Como Logico
    Escribir "Introduce una palabra (sin acentos ni espacios):"
    Leer palabra
    palabra <- Minusculas(palabra)
    n <- Longitud(palabra)
    es_pal <- Verdadero
    Para i <- 1 Hasta n / 2 Hacer
        Si Subcadena(palabra, i, i) <> Subcadena(palabra, n - i + 1, n - i + 1) Entonces
            es_pal <- Falso
        FinSi
    FinPara
    Si es_pal Entonces
        Escribir "'", palabra, "' SÍ es palíndromo"
    SiNo
        Escribir "'", palabra, "' NO es palíndromo"
    FinSi
FinProceso`,

        contar_vocales:
`// Recorrer una palabra carácter por carácter y contar las vocales
Proceso ContarVocales
    Definir palabra, c Como Cadena
    Definir i, n, contador Como Entero
    Escribir "Introduce una palabra:"
    Leer palabra
    palabra <- Minusculas(palabra)
    n <- Longitud(palabra)
    contador <- 0
    Para i <- 1 Hasta n Hacer
        c <- Subcadena(palabra, i, i)
        Si c = "a" O c = "e" O c = "i" O c = "o" O c = "u" Entonces
            contador <- contador + 1
        FinSi
    FinPara
    Escribir "'", palabra, "' tiene ", contador, " vocales"
FinProceso`,

        mayus_minus:
`// Pasar un texto a mayúsculas y a minúsculas
// Muestra dos funciones complementarias de cadena
Proceso MayusMinus
    Definir frase Como Cadena
    Escribir "Introduce una frase:"
    Leer frase
    Escribir "Mayúsculas: ", Mayusculas(frase)
    Escribir "Minúsculas: ", Minusculas(frase)
    Escribir "Longitud:   ", Longitud(frase), " caracteres"
FinProceso`,

        // ── ⑫ Funciones matemáticas ───────────────────────────────────────
        raiz_cuadrada:
`// Raíz cuadrada con la función RC
// Detecta el caso de número negativo (no hay raíz real)
Proceso RaizCuadrada
    Definir x, r Como Real
    Escribir "Introduce un número:"
    Leer x
    Si x < 0 Entonces
        Escribir "Error: no existe raíz cuadrada real de un número negativo"
    SiNo
        r <- RC(x)
        Escribir "√", x, " = ", r
    FinSi
FinProceso`,

        hipotenusa:
`// Calcular la hipotenusa de un triángulo rectángulo (Pitágoras)
// h = √(a² + b²)  → usa los operadores ^ (potencia) y la función RC
Proceso Hipotenusa
    Definir a, b, h Como Real
    Escribir "Cateto A:"
    Leer a
    Escribir "Cateto B:"
    Leer b
    h <- RC(a ^ 2 + b ^ 2)
    Escribir "Hipotenusa = ", h
FinProceso`,

        ecuacion_cuadratica:
`// Resuelve ax² + bx + c = 0 con la fórmula del discriminante
// Tres casos según el signo del discriminante b² − 4ac
Proceso EcuacionCuadratica
    Definir a, b, c, disc, x1, x2 Como Real
    Escribir "Resuelve  ax² + bx + c = 0"
    Escribir "Coeficiente a:"
    Leer a
    Escribir "Coeficiente b:"
    Leer b
    Escribir "Coeficiente c:"
    Leer c
    Si a = 0 Entonces
        Escribir "No es ecuación de segundo grado (a = 0)"
    SiNo
        disc <- b ^ 2 - 4 * a * c
        Si disc < 0 Entonces
            Escribir "Sin soluciones reales (discriminante < 0)"
        SiNo
            Si disc = 0 Entonces
                x1 <- -b / (2 * a)
                Escribir "Solución única: x = ", x1
            SiNo
                x1 <- (-b + RC(disc)) / (2 * a)
                x2 <- (-b - RC(disc)) / (2 * a)
                Escribir "Dos soluciones:"
                Escribir "  x1 = ", x1
                Escribir "  x2 = ", x2
            FinSi
        FinSi
    FinSi
FinProceso`,
    };

    // Restaura el último borrador guardado, o carga "Hola mundo" la primera vez
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    editor.value = (savedDraft && savedDraft.trim()) ? savedDraft : EXAMPLES.hola;

    // Auto-guardado en localStorage (debounced 400 ms)
    let saveTimer;
    editor.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            try { localStorage.setItem(STORAGE_KEY, editor.value); } catch (_) {}
        }, 400);
    });

    // ── Helpers de output ─────────────────────────────────────────────────
    function appendLine(text, cls = 'out-line') {
        const span = document.createElement('span');
        span.className = cls;
        span.textContent = text + '\n';
        output.appendChild(span);
        output.scrollTop = output.scrollHeight;
    }

    function clearOutput() {
        output.textContent = '';
        hideInputRow();
    }

    function showInputRow(label) {
        inputLabel.textContent = `Leer ${label}:`;
        inputRow.classList.add('active');
        inputField.value = '';
        inputField.focus();
    }

    function hideInputRow() {
        inputRow.classList.remove('active');
        inputField.value = '';
    }

    // ── Input handler basado en Promise ───────────────────────────────────
    function askInput(label) {
        return new Promise((resolve) => {
            showInputRow(label);
            const handler = (ev) => {
                if (ev.key === 'Enter') {
                    ev.preventDefault();
                    const value = inputField.value;
                    inputField.removeEventListener('keydown', handler);
                    appendLine(`> ${value}`, 'in-line');
                    hideInputRow();
                    resolve(value);
                }
            };
            inputField.addEventListener('keydown', handler);
        });
    }

    // ── Ejecución ─────────────────────────────────────────────────────────
    async function ejecutar() {
        clearOutput();
        btnRun.disabled = true;
        btnRun.textContent = '⏳ Ejecutando…';
        const t0 = performance.now();

        try {
            await runPseudo(editor.value, {
                output: (text) => appendLine(text, 'out-line'),
                input:  (label) => askInput(label),
            });
            const dt = (performance.now() - t0).toFixed(0);
            appendLine(`\n[Programa terminado en ${dt} ms]`, 'ok-line');
        } catch (err) {
            if (err instanceof PseudoError) {
                appendLine(`\n[Error] ${err.message}`, 'err-line');
            } else {
                appendLine(`\n[Error interno] ${err.message || err}`, 'err-line');
                console.error(err);
            }
        } finally {
            btnRun.disabled = false;
            btnRun.textContent = '▶ Ejecutar';
            hideInputRow();
        }
    }

    // ── Atajos de teclado ─────────────────────────────────────────────────
    editor.addEventListener('keydown', (ev) => {
        // Ctrl+Enter o F5 → ejecutar
        if ((ev.ctrlKey && ev.key === 'Enter') || ev.key === 'F5') {
            ev.preventDefault();
            ejecutar();
            return;
        }
        // Tab → insertar 4 espacios (en lugar de cambiar el foco)
        if (ev.key === 'Tab') {
            ev.preventDefault();
            const s = editor.selectionStart, e = editor.selectionEnd;
            editor.value = editor.value.substring(0, s) + '    ' + editor.value.substring(e);
            editor.selectionStart = editor.selectionEnd = s + 4;
        }
    });

    // ── Wiring de botones ─────────────────────────────────────────────────
    btnRun.addEventListener('click', ejecutar);
    btnClear.addEventListener('click', clearOutput);

    document.getElementById('btnManual').addEventListener('click', () => {
        window.open('pseudoweb_manual.pdf', '_blank', 'noopener');
    });

    btnNuevo.addEventListener('click', () => {
        const actual = editor.value.trim();
        if (actual && actual !== STARTER_TEMPLATE.trim() &&
            !confirm('Esto borrará el contenido actual del editor. ¿Continuar?')) return;
        editor.value = STARTER_TEMPLATE;
        try { localStorage.setItem(STORAGE_KEY, editor.value); } catch (_) {}
        editor.focus();
        // Coloca el cursor al final del comentario "1) Declara aquí tus variables"
        const cursorPos = STARTER_TEMPLATE.indexOf('Como Entero') + 'Como Entero'.length;
        editor.setSelectionRange(cursorPos, cursorPos);
    });

    examplesSel.addEventListener('change', (ev) => {
        const key = ev.target.value;
        if (key && EXAMPLES[key]) {
            const actual = editor.value.trim();
            const isStarter = actual === STARTER_TEMPLATE.trim();
            const isExample = Object.values(EXAMPLES).some(s => s.trim() === actual);
            if (actual && !isStarter && !isExample &&
                !confirm('Esto reemplazará el contenido del editor. ¿Cargar ejemplo?')) {
                ev.target.value = '';
                return;
            }
            editor.value = EXAMPLES[key];
            try { localStorage.setItem(STORAGE_KEY, editor.value); } catch (_) {}
            editor.focus();
            editor.setSelectionRange(0, 0);
            editor.scrollTop = 0;
        }
        ev.target.value = '';
    });

    // Pista inicial en la salida
    appendLine('PseudoWeb listo. Ctrl+Enter o ▶ Ejecutar para correr el programa.', 'info-line');
    appendLine('Pulsa 📝 Ejercicios para practicar con corrección automática (12 ejercicios).', 'info-line');

    // ── ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ──
    // ── Sistema de ejercicios (modal con lista / detalle / corrección) ───
    // ── ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ──
    const btnExercises = document.getElementById('btnExercises');
    const modalEx      = document.getElementById('modalEx');
    const exContent    = document.getElementById('exContent');

    function escapeHTML(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;');
    }

    function scoreIcon(score) {
        if (score === undefined)  return '⚪';
        if (score === 10)         return '🟢';
        if (score >= 5)           return '🟡';
        return '🔴';
    }

    function showExerciseList() {
        const scores = PseudoExercises.getAllScores();
        let html = '<h2>📝 Elige un ejercicio</h2>';
        html += '<ul class="ex-list">';
        for (const ex of PseudoExercises.EXERCISES) {
            const score = scores[ex.id];
            const best  = score !== undefined ? `${score}/10` : '—';
            html += `<li data-id="${escapeHTML(ex.id)}">
                <span class="ex-icon">${scoreIcon(score)}</span>
                <span class="ex-titulo">${escapeHTML(ex.titulo)}</span>
                <span class="ex-best">${best}</span>
                <span class="ex-group">${escapeHTML(ex.grupo)}</span>
            </li>`;
        }
        html += '</ul>';
        html += `<div class="modal-actions">
            <span class="spacer"></span>
            <button id="exCloseListBtn">Cerrar</button>
        </div>`;
        exContent.innerHTML = html;

        exContent.querySelectorAll('.ex-list li').forEach(li => {
            li.addEventListener('click', () => showExerciseDetail(li.dataset.id));
        });
        document.getElementById('exCloseListBtn').addEventListener('click', closeExModal);
    }

    function showExerciseDetail(id) {
        const ex = PseudoExercises.EXERCISES.find(e => e.id === id);
        if (!ex) { showExerciseList(); return; }
        const best = PseudoExercises.getScore(id);

        let html = `
            <h2>📝 ${escapeHTML(ex.titulo)} <span class="ex-group-chip">${escapeHTML(ex.grupo)}</span></h2>
        `;
        if (best !== undefined) {
            html += `<div class="ex-best-line">Mejor nota anterior: <strong>${best} / 10</strong></div>`;
        }
        html += `<div class="ex-enunciado">${escapeHTML(ex.enunciado)}</div>`;

        if (ex.pistas && ex.pistas.length) {
            html += '<div class="ex-pistas"><details><summary>💡 Pistas (' + ex.pistas.length + ')</summary><ul>';
            for (const p of ex.pistas) html += `<li>${escapeHTML(p)}</li>`;
            html += '</ul></details></div>';
        }
        if (ex.nota) {
            html += `<div class="ex-note">ℹ ${escapeHTML(ex.nota)}</div>`;
        }
        html += `<div class="modal-actions">
            <button class="link-btn" id="exBackToListBtn">← Volver a la lista</button>
            <span class="spacer"></span>
            <button id="exLoadTmplBtn">Cargar plantilla en editor</button>
            <button id="exGradeBtn" class="primary">✓ Corregir mi código</button>
        </div>`;
        exContent.innerHTML = html;

        document.getElementById('exBackToListBtn').addEventListener('click', showExerciseList);
        document.getElementById('exLoadTmplBtn').addEventListener('click', () => loadPlantilla(ex));
        document.getElementById('exGradeBtn').addEventListener('click', () => gradeAndShow(ex));
    }

    function loadPlantilla(ex) {
        const cur = editor.value.trim();
        if (cur && cur !== ex.plantilla.trim() &&
            !confirm('Esto reemplazará el contenido actual del editor. ¿Continuar?')) {
            return;
        }
        editor.value = ex.plantilla;
        try { localStorage.setItem(STORAGE_KEY, editor.value); } catch (_) {}
        closeExModal();
        editor.focus();
        // Sitúa el cursor donde dice "// (escribe aquí" si aparece, si no al inicio
        const hint = editor.value.indexOf('// ');
        editor.setSelectionRange(hint, hint);
        editor.scrollTop = 0;
    }

    async function gradeAndShow(ex) {
        exContent.innerHTML = `
            <h2>📝 ${escapeHTML(ex.titulo)}</h2>
            <div class="ex-loading">Corrigiendo… ejecutando ${ex.casos.length} casos.</div>`;

        let result;
        try {
            result = await PseudoExercises.gradeExercise(ex, editor.value);
        } catch (err) {
            exContent.innerHTML = `
                <h2>📝 ${escapeHTML(ex.titulo)}</h2>
                <div class="ex-note" style="border-left-color: var(--err); color: var(--err);">
                    Error inesperado del intérprete: ${escapeHTML(err.message || String(err))}
                </div>
                <div class="modal-actions">
                    <button class="link-btn" id="exBackAfterErrBtn">← Volver al enunciado</button>
                    <span class="spacer"></span>
                    <button id="exCloseAfterErrBtn" class="primary">Cerrar</button>
                </div>`;
            document.getElementById('exBackAfterErrBtn').addEventListener('click', () => showExerciseDetail(ex.id));
            document.getElementById('exCloseAfterErrBtn').addEventListener('click', closeExModal);
            return;
        }

        const nuevoRecord = PseudoExercises.saveScore(ex.id, result.score);
        const cls = result.score === result.total ? 'ok' :
                    result.score >= 5            ? 'partial' : 'ko';
        const label = result.score === result.total ? '¡Perfecto!' :
                      result.score >= 5            ? 'Casi' : 'Sigue intentándolo';

        let html = `
            <h2>📝 Corrección — ${escapeHTML(ex.titulo)}</h2>
            <div class="ex-result-summary ${cls}">
                ${result.score} / ${result.total}
                <span class="small">${label}${nuevoRecord ? ' · nuevo récord guardado' : ''}</span>
            </div>
            <ul class="ex-result-list">`;
        for (const r of result.results) {
            const badge = r.passed ? '✓ OK   ' : '✗ FALLA';
            const inputsStr = r.inputs.length === 0 ? '(sin entrada)' :
                              r.inputs.map(s => `"${s}"`).join(', ');
            let detail = '';
            if (!r.passed) {
                if (r.errorMsg) {
                    detail = `<div class="detail">Error: ${escapeHTML(r.errorMsg)}</div>`;
                } else if (r.esperado) {
                    const obt = r.obtenido.map(s => String(s).trimEnd()).filter(s => s.length > 0)
                                .slice(-Math.max(1, r.esperado.length));
                    detail = `<div class="detail">esperado: <code>${escapeHTML(JSON.stringify(r.esperado))}</code><br>obtuviste: <code>${escapeHTML(JSON.stringify(obt))}</code></div>`;
                } else {
                    const last = r.obtenido.map(s => String(s).trimEnd()).filter(s => s.length > 0).slice(-1);
                    detail = `<div class="detail">formato/rango incorrecto (última línea: <code>${escapeHTML(JSON.stringify(last))}</code>)</div>`;
                }
            }
            html += `<li class="${r.passed ? 'pass' : 'fail'}">
                <span class="badge">${badge}</span> · Caso ${r.idx} · entrada [${escapeHTML(inputsStr)}]
                ${detail}
            </li>`;
        }
        html += `</ul>
            <div class="modal-actions">
                <button class="link-btn" id="exBackToDetailBtn">← Volver al enunciado</button>
                <span class="spacer"></span>
                <button id="exDoneBtn" class="primary">Cerrar</button>
            </div>`;
        exContent.innerHTML = html;

        document.getElementById('exBackToDetailBtn').addEventListener('click', () => showExerciseDetail(ex.id));
        document.getElementById('exDoneBtn').addEventListener('click', closeExModal);
    }

    function closeExModal() { modalEx.classList.remove('active'); }

    btnExercises.addEventListener('click', () => {
        showExerciseList();
        modalEx.classList.add('active');
    });
    modalEx.addEventListener('click', (ev) => {
        if (ev.target === modalEx) closeExModal();
    });
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape' && modalEx.classList.contains('active')) closeExModal();
    });
})();
