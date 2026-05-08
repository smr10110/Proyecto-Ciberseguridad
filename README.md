<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/CodeQL-2.25-6e40c9?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Dev%20Container-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<h1 align="center">🔒 Security Analyzer</h1>

<p align="center">
  <strong>Pipeline automatizado de analisis de seguridad para repositorios de codigo abierto</strong><br/>
  Miner &rarr; Analyzer &rarr; Visualizer
</p>

<p align="center">
  <em>Proyecto desarrollado para el curso de Ciberseguridad (ICC610) — 2026</em>
</p>

---

## Descripcion General

**Security Analyzer** es una herramienta de linea de comandos que automatiza el analisis de seguridad de repositorios de GitHub. El sistema implementa un pipeline de tres etapas — **Miner**, **Analyzer** y **Visualizer** — que permite clonar repositorios, generar inventarios de dependencias (SBOM), detectar vulnerabilidades conocidas (CVEs), realizar analisis estatico de codigo fuente y presentar los resultados en un dashboard interactivo en tiempo real.

El proyecto esta disenado para ejecutarse completamente dentro de un **Dev Container** de Docker, que preinstala todas las herramientas necesarias (CodeQL, Grype, Syft, Python, Node.js, Java y Maven), garantizando un entorno reproducible y sin configuracion manual.

---

## Caracteristicas Principales

| Capacidad | Descripcion |
|---|---|
| 📥 **Clonacion inteligente** | Clona repositorios individuales o todos los de una organizacion de GitHub, filtrando por actividad reciente, forks y archivados |
| 📦 **Generacion de SBOM** | Genera la lista completa de componentes y dependencias de cada repositorio con **Syft** |
| 🔓 **Escaneo de vulnerabilidades** | Detecta CVEs conocidos en dependencias usando **Grype** contra las bases de datos NVD, GitHub Advisory y OSV |
| 🔍 **Analisis estatico de codigo** | Identifica vulnerabilidades en el codigo fuente (SQL injection, XSS, credenciales expuestas) con **CodeQL** |
| 🧠 **Caracterizacion sistematica** | Consolida y estructura los hallazgos en un dataset unificado, identificando patrones y metricas de riesgo |
| 📊 **Dashboard interactivo** | Aplicacion web React con graficos en tiempo real (Recharts), con auto-refresh y vistas por severidad, repositorio y tipo |
| 🌊 **Modo Stream** | Pipeline end-to-end que procesa cada repositorio de forma individual y actualiza el dashboard en tiempo real |
| ⚡ **Ejecucion paralela** | Procesamiento concurrente configurable con `ThreadPoolExecutor` para acelerar el analisis de multiples repositorios |
| 🐳 **Entorno reproducible** | Dev Container con todas las herramientas preinstaladas; cero configuracion manual |

---

## Arquitectura del Sistema

El proyecto sigue una arquitectura de **pipeline de tres capas** donde cada componente tiene una responsabilidad bien definida:

```
┌──────────────────────┬──────────────────────┬──────────────────────────────┐
│                      SECURITY ANALYZER                                    │
├──────────────────────┬──────────────────────┬──────────────────────────────┤
│                      │                      │                              │
│  🔨 MINER            │  🧠 ANALYZER         │  📊 VISUALIZER               │
│  (Recoleccion)       │  (Procesamiento)     │  (Presentacion)              │
│                      │                      │                              │
│  clone_repos.py      │  analyzer.py         │  React + Vite + Recharts     │
│  generate_sboms.py   │                      │  Dashboard interactivo       │
│  generate_grype.py   │  Consolida datos     │  Auto-refresh (5s)           │
│  generate_codeql.py  │  de Grype + CodeQL   │  4 vistas:                   │
│  generate_reports.py │  en un dataset       │    - Dashboard               │
│                      │  unificado           │    - CVEs (Grype)            │
│                      │                      │    - CodeQL                  │
│  Salida:             │  Salida:             │    - SBOM                    │
│   data/results/      │   data.json          │                              │
│   *-sbom.json        │   analysis_summary   │  Acceso:                     │
│   *-grype.json       │   dataset.csv        │   localhost:5173             │
│   *-codeql.json      │                      │                              │
└──────────────────────┴──────────────────────┴──────────────────────────────┘
```

---

## Estructura del Proyecto

```
📁 security-analyzer/
│
├── 📄 main.py                      # CLI principal (Click) — punto de entrada
├── 📄 pyproject.toml                # Dependencias Python (uv/pip)
├── 📄 uv.lock                      # Lock file de dependencias
├── 📄 .gitignore
│
├── 📁 scripts/                      # Modulos del Miner + Analyzer
│   ├── clone_repos.py              #   Clonacion de repositorios (GitHub API)
│   ├── generate_sboms.py           #   Generacion de SBOMs (Syft)
│   ├── generate_grype.py           #   Escaneo de vulnerabilidades (Grype)
│   ├── generate_codeql.py          #   Analisis estatico (CodeQL)
│   ├── generate_reports.py         #   Generacion de reportes consolidados
│   ├── analyzer.py                 #   Caracterizacion sistematica de hallazgos
│   └── subprocess_utils.py         #   Utilidad para ejecucion de comandos
│
├── 📁 data/
│   ├── config.json                 # Configuracion de repositorios y opciones
│   ├── 📁 repos/                   # Repositorios clonados (git ignored)
│   └── 📁 results/                 # Resultados de analisis (git ignored)
│       ├── *-sbom.json             #   SBOM por repositorio
│       ├── *-grype.json            #   Vulnerabilidades por repositorio
│       ├── *-codeql.json           #   Hallazgos CodeQL por repositorio
│       ├── analysis_summary.json   #   Resumen del Analyzer
│       ├── vulnerabilities_dataset.csv  # Dataset consolidado
│       ├── consolidated-report.json     # Reporte final
│       └── 📁 databases/          #   Bases de datos CodeQL
│
├── 📁 nbs/                         # Jupyter Notebooks
│   ├── 00_pipeline_completo.ipynb  #   Pipeline completo en notebook
│   └── 01_analisis.ipynb           #   Analisis cuantitativo y cualitativo
│
├── 📁 visualizer/                   # Dashboard interactivo (React)
│   ├── package.json                #   Dependencias Node.js
│   ├── vite.config.js              #   Configuracion de Vite
│   ├── tailwind.config.js          #   Configuracion de Tailwind CSS
│   ├── 📁 public/
│   │   └── data.json               #   Datos inyectados por el Analyzer
│   └── 📁 src/
│       ├── main.jsx                #   Punto de entrada React
│       ├── App.jsx                 #   Componente principal + navegacion
│       ├── index.css               #   Estilos globales
│       ├── 📁 hooks/
│       │   └── useData.js          #   Hook para carga y auto-refresh de datos
│       └── 📁 pages/
│           ├── Dashboard.jsx       #   Vista principal con KPIs y graficos
│           ├── VulnPage.jsx        #   Vista de CVEs (Grype)
│           ├── CodeQLPage.jsx      #   Vista de hallazgos CodeQL
│           └── SbomPage.jsx        #   Vista de inventario SBOM
│
├── 📁 .devcontainer/               # Entorno de desarrollo containerizado
│   ├── Dockerfile                  #   Python 3.11 + CodeQL + Grype + Syft + Node.js + Java
│   └── devcontainer.json           #   Configuracion de VS Code + extensiones
│
├── 📄 GUIA_DE_USO.md               # Guia paso a paso completa
└── 📄 analisis_vulnerabilidades.md  # Analisis cualitativo y cuantitativo de resultados
```

---

## Requisitos Previos

| Requisito | Version | Verificacion |
|---|---|---|
| **Docker Desktop** | Ultima estable | `docker --version` |
| **VS Code** | Ultima estable | — |
| **Extension Dev Containers** | — | Panel de extensiones de VS Code |
| **Git** | 2.x+ | `git --version` |

> **Nota:** Todas las herramientas de analisis (CodeQL, Grype, Syft, Python, Node.js, Java, Maven) se instalan automaticamente dentro del Dev Container. No es necesario instalarlas en la maquina local.

---

## Inicio Rapido

### 1. Clonar el repositorio y abrir en Dev Container

```bash
git clone <URL_DEL_REPOSITORIO>
cd security-analyzer
code .
```

En VS Code: `F1` → **Dev Containers: Reopen in Container** → esperar la construccion (~5-15 min la primera vez).

### 2. Configurar repositorios a analizar

Editar `data/config.json` con las URLs o nombres de organizaciones deseadas:

```json
{
    "repositories": [
        "https://github.com/pallets/flask",
        "https://github.com/psf/requests"
    ],
    "organizations": ["OWASP"],
    "clone_options": {
        "max_inactive_days": 30,
        "skip_archived": true,
        "skip_forks": true,
        "max_repos": 50
    }
}
```

### 3. Ejecutar el pipeline completo

```bash
# Pipeline completo (clone → sbom → grype → codeql → analyzer → report)
uv run python main.py all
```

### 4. Iniciar el Visualizer

```bash
cd visualizer
npm install
npm run dev
# → Abrir http://localhost:5173
```

---

## Comandos Disponibles

| Comando | Descripcion |
|---|---|
| `uv run python main.py clone` | 📥 Clonar repositorios desde `config.json` |
| `uv run python main.py sbom` | 📦 Generar SBOMs con Syft |
| `uv run python main.py grype` | 🔓 Escanear vulnerabilidades con Grype |
| `uv run python main.py codeql` | 🔍 Analizar codigo con CodeQL |
| `uv run python main.py analyze` | 🧠 Ejecutar el Analyzer (genera `data.json` para el Visualizer) |
| `uv run python main.py report` | 📊 Generar reporte consolidado |
| `uv run python main.py all` | 🚀 Ejecutar pipeline completo |
| `uv run python main.py stream` | 🌊 Pipeline end-to-end por repositorio (actualiza dashboard en vivo) |

Todas las opciones aceptan flags como `--config`, `--repos-dir`, `--output-dir` y `--workers`. Consultar `--help` para mas detalles.

---

## Stack Tecnologico

### Backend (Miner + Analyzer)

| Tecnologia | Uso |
|---|---|
| **Python 3.11+** | Lenguaje principal del pipeline |
| **Click** | Framework CLI para la interfaz de linea de comandos |
| **Rich** | Tablas y output enriquecido en terminal |
| **Pandas** | Procesamiento y estructuracion de datasets |
| **Requests** | Comunicacion con la API de GitHub |
| **ThreadPoolExecutor** | Ejecucion paralela de tareas |

### Herramientas de Analisis

| Herramienta | Funcion |
|---|---|
| **Syft** (Anchore) | Generacion de SBOM (Software Bill of Materials) |
| **Grype** (Anchore) | Deteccion de CVEs en dependencias (NVD, GitHub Advisory, OSV) |
| **CodeQL** (GitHub) | Analisis estatico de codigo fuente (Python, JS, Java, C++, C#) |

### Frontend (Visualizer)

| Tecnologia | Uso |
|---|---|
| **React 18** | Framework de interfaz de usuario |
| **Vite 5** | Bundler y servidor de desarrollo |
| **Recharts** | Graficos interactivos |
| **Tailwind CSS** | Estilos utilitarios |
| **Lucide React** | Iconografia |

### Infraestructura

| Tecnologia | Uso |
|---|---|
| **Docker** | Containerizacion del entorno de desarrollo |
| **Dev Containers** | Integracion con VS Code |
| **uv** (Astral) | Gestor de paquetes y entornos Python |

---

## Documentacion Adicional

- **[GUIA_DE_USO.md](GUIA_DE_USO.md)** — Guia paso a paso con ejemplos detallados, troubleshooting y capturas de salida esperada.
- **[analisis_vulnerabilidades.md](analisis_vulnerabilidades.md)** — Analisis cuantitativo y cualitativo completo de los resultados obtenidos sobre repositorios de la organizacion Apache.

---

## Licencia

Proyecto academico desarrollado para el curso de Ciberseguridad (ICC610) — 2026.
