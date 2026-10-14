# OpenCode en el proyecto (parte 2)

[OpenCode](https://opencode.ai) es el agente de codificación de terminal que usamos en la parte 2.
Esta guía explica cómo instalarlo y configurarlo con un **modelo gratuito** y cómo comprobar que
lee nuestras reglas (`AGENTS.md`). **No se escribe ninguna clave en el repositorio**: las claves van
siempre en variables de entorno.

## 1. Instalación

Elige una opción y comprueba la versión:

```bash
# Opción A — instalador oficial
curl -fsSL https://opencode.ai/install | bash

# Opción B — npm
npm install -g opencode-ai

# Opción C — Homebrew (macOS/Linux)
brew install sst/tap/opencode

opencode --version   # en el proyecto se ha usado la 1.18.35
```

## 2. Elegir un modelo gratuito

El briefing admite cualquiera de estas vías:

| Proveedor | Coste | Cómo se configura |
| --- | --- | --- |
| **OpenCode Zen** | Modelos `-free` | Viene con OpenCode; se elige en `/models` |
| **OpenRouter** | Modelos con sufijo `:free` | `OPENROUTER_API_KEY` |
| **Groq** | Capa gratuita | `GROQ_API_KEY` |
| **Google Gemini** | Capa gratuita | `GEMINI_API_KEY` |
| **Ollama (local)** | Gratuito | Servidor en `http://localhost:11434` |

La forma más sencilla es arrancar `opencode`, abrir el selector con `/models` y elegir uno marcado
como gratuito. La elección se guarda en el fichero de configuración:

- Global: `~/.config/opencode/opencode.jsonc`
- Del proyecto: `opencode.json` en la raíz (opcional; **nunca** con claves dentro).

Ejemplo de configuración **sin claves** (global), eligiendo un modelo gratuito:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/deepseek-v4-flash-free"
}
```

## 3. Las claves van en variables de entorno

Nunca se escriben en el repositorio ni en `opencode.json`. Se exportan en la terminal (o en el
perfil del sistema) solo para los proveedores que necesiten clave:

```bash
export OPENROUTER_API_KEY="..."   # no se sube al repositorio
export GROQ_API_KEY="..."
export GEMINI_API_KEY="..."
```

Los modelos locales con Ollama no necesitan ninguna clave.

> Regla del proyecto (`AGENTS.md`): `.env` y cualquier fichero con secretos **no se commitean**. Si
> una variable nueva es necesaria, se documenta en `.env.example` con un valor ficticio.

## 4. OpenCode lee `AGENTS.md`

OpenCode carga automáticamente el `AGENTS.md` de la raíz del proyecto (y, si existe, el global de
`~/.config/opencode/AGENTS.md`) al iniciar la sesión. En este repositorio, `AGENTS.md` está en la
raíz y contiene el stack, la estructura, los comandos, el flujo de trabajo y lo que el agente no
debe hacer.

**Comprobación:** dentro del repositorio, abre `opencode` y pide `Resume AGENTS.md`; debe devolver
las reglas del proyecto (capas, ramas, checks, convenciones) en lugar de inventarlas.

## 5. Uso diario

```bash
cd g2-python-crud-api
opencode                 # abre la interfaz
# o para una tarea puntual:
opencode run "Algo pequeño y concreto"
```

Recomendaciones:

- Una tarea = una sesión = una rama = una PR (ver `AGENTS.md`).
- Antes de dar por buena una tarea, ejecuta los checks del lado que cambiaste
  (`backend/`: `ruff check .` y `pytest`; `frontend/`: `npm run lint`, `npm run format:check`,
  `npm run test` y `npm run build`).
- Anota qué se le pidió y qué se aceptó o rechazó en `docs/ai-log.md`.
