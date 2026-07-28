# TGCF · Evaluación física

Simulador público de evaluación física periódica de las Fuerzas Armadas, basado en los baremos del Anexo II de la Orden DEF/15/2026 (BOE de 21/01/2026).

## Uso

Abre `index.html` en un navegador o visita la versión publicada mediante GitHub Pages.

- Selecciona sexo y edad.
- Introduce tus marcas, selecciónalas en el desplegable o consulta directamente el corte APTO.
- La aptitud exige al menos 20 puntos en cada prueba aplicable; no hay compensación por media.

## Desarrollo y validación

```bash
npm test
```

Los baremos se encuentran en `src/data/annex-ii.json`; la lógica de cálculo está en `src/calculator.js`.

> Información orientativa. Consulta siempre la normativa oficial vigente.
