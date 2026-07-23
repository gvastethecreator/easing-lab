# Easing Lab: notas para agentes

## Contrato del proyecto

- Usa Bun para instalar dependencias y ejecutar tareas.
- Conserva la interfaz, el sistema visual y los nombres de los flujos existentes salvo que una tarea los cambie de forma explícita.
- Antes de modificar código, revisa el tracker local y el plan activo.
- Registra las tareas y la deuda con evidencia de comandos y rutas afectadas.

## Agent skills

### Issue tracker

Project work lives under `.scratch/`; remote issues and PRs are read-only sources. See `docs/agents/issue-tracker.md`.

### Triage labels

Use `bug` and `enhancement` for categories and the local lifecycle values in `docs/agents/triage-labels.md` for status.

### Domain docs

This is a single-context project. Consult `docs/agents/domain.md` before exploring domain code.
