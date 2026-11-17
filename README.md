# El tablero de Baker Street

Sherlock Holmes caso por caso, en scroll. Demo: https://pedri77.github.io/sherlock-tablero/

1. **El tablero.** *La banda de lunares* (1892) clavado en un corcho: la cámara va de prueba en prueba y el hilo rojo se tensa hasta el culpable.
2. **Gaceta de Baker Street.** Quién era Holmes, los 60 casos y por qué son de dominio público.
3. **Lo que Holmes nunca dijo.** Un buscador recorre los 60 casos: «Elementary, my dear Watson» sale 0 veces; «elementary», 8; «my dear Watson», 92.
4. **La gorra la puso Paget.** Doyle nunca escribió «deerstalker»; una lupa recorre el dibujo de Paget hasta la gorra.
5. **El archivo.** Los 60 casos en fichas por año, de 1887 a 1927, con el hueco de 1894-1900.

## Datos y licencias

| Material | Fuente | Licencia |
|---|---|---|
| Textos (solo cifras y frases cortas de contexto) | Project Gutenberg, ebooks 244, 2097, 1661, 834, 2852, 108, 3289, 2350, 69700 | Dominio público |
| Dibujos de Sidney Paget (1861-1908) | Wikimedia Commons | Dominio público |
| Fuentes tipográficas | Google Fonts | SIL OFL / Apache 2.0 |

Conan Doyle murió en 1930: dominio público en España desde 2011; en EE. UU., los últimos relatos (1927) desde 2023.

## Scripts

```
uv run --no-project python scripts/canon.py               # datos-crudos/textos/*.txt → src/datos/canon.json
uv run --no-project --with pillow python scripts/imagenes.py   # Commons → public/paget + src/datos/imagenes.json
```

Los textos se bajan a `datos-crudos/textos/` desde el espejo `gutenberg.pglaf.org`. Commons solo sirve bien las miniaturas en tamaños estándar (250/330/500/960); los originales devuelven 429.

## Desarrollo

```
npm install
npm run dev     # http://localhost:3019
npm run build
```

Vite, React 19, Tailwind 4 y Lenis. Un único bucle requestAnimationFrame escribe los estilos; el guion de scroll de cada sección está en la cabecera de su componente.

Textos y código hechos con IA (Claude) y revisados. Las imágenes no se han generado ni modificado con IA.
