# Simple DS — Design System de Prueba

Repositorio del Simple DS, el design system de prueba para validar la arquitectura del Engine Core IA-Ready.

## Estructura

```
simple-ds/
├── /tokens          → Valores de diseño en JSON (primitives, semantic)
├── /contracts       → Especificación machine-readable de cada componente
├── /patterns        → Plantillas de pantalla con reglas de composición
├── /registry        → Índice semántico para búsqueda por intención
└── /examples        → Pantallas aprobadas como ground truth
```

## Componentes disponibles

| Componente           | Contrato           | Estado    |
|----------------------|--------------------|-----------|
| navigation-header    | ✅ Completo        | Listo     |
| button-primary       | ✅ Completo        | Listo     |
| button-secondary     | ✅ Completo        | Listo     |
| card-item            | ✅ Completo        | Listo     |
| input-text           | ✅ Completo        | Listo     |
| filter-bar           | ✅ Completo        | Listo     |
| empty-state          | ✅ Completo        | Listo     |
| modal-bottom-sheet   | ✅ Completo        | Listo     |

## Patterns disponibles

| Pattern              | Componentes clave                                        |
|----------------------|----------------------------------------------------------|
| lista-con-filtros    | header + filter-bar + card-item + empty-state            |
| formulario-simple    | header + input-text + button-primary                     |
| confirmacion         | modal-bottom-sheet + button-primary + button-secondary   |
| detalle              | header + card-item + button-primary                      |

## Cómo usar este repo con el Engine Core

El Engine Core lee los archivos de este repo directamente.
Configurar la variable `DS_REPO_PATH` en el `.env` del engine apuntando a esta carpeta.

## Próximos pasos

- [ ] Añadir Node IDs de Figma cuando se dibujen los componentes
- [ ] Poblar /examples con pantallas aprobadas
- [ ] Conectar con el Engine Core Fase 1
