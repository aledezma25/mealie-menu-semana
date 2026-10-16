# Mealie · Menú de la semana (versión C)

Rediseño del planificador semanal de [Mealie](https://github.com/mealie-recipes/mealie) para la protopersona Gloria.
Entrega final de **Interacción Humano Computador**, Especialización en Inteligencia Artificial, Universidad Nacional de Colombia, Sede Manizales (octubre de 2026).

**Equipo:** Adrián Camilo Ledezma Beltrán · Julián David Aranzazu Velásquez · Santiago Rincón Agudelo
**Profesor:** Gabriel Mauricio Ramírez Villegas, PhD

## Qué incluye
- Planificar la semana: agregar, editar, mover y quitar comidas, con Deshacer y Rehacer.
- Búsqueda tolerante a errores ("ajiako" → Ajiaco santafereño) y botón "Sorpréndame".
- Estado de la semana ("5 de 7 días con comida · Faltan…"), ayuda y guía de primer uso.
- Accesibilidad configurable: tamaño de letra, temas claro, oscuro y alto contraste, modo daltonismo, espaciado, botones grandes y lectura en voz alta.
- Vistas de celular, tableta y reloj.

Usa datos de demostración, que se guardan solo en el navegador. Las fotos de los platos vienen de Wikimedia Commons con licencias libres; los créditos están en la Ayuda y en `public/recetas/creditos.json`.

## Ejecutar localmente
```bash
npm install
npm run dev
```
Se construye con React, TypeScript, Vite y Tailwind CSS.
