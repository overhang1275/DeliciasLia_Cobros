# Graph Report - DeliciasLia_Cobros  (2026-08-03)

## Corpus Check
- 110 files · ~21,926 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 468 nodes · 888 edges · 36 communities (25 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca008255`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- fiados/actions.ts
- formatters.ts
- [token]/page.tsx
- fiados/page.tsx
- session.ts
- devDependencies
- dependencies
- compilerOptions
- clientes/actions.ts
- AppIcon.tsx
- What You Must Do When Invoked
- Delicias Lia Cobros
- eslint.config.mjs
- next.config.mjs
- next-env.d.ts
- demo-ubuntu-lxc.sh
- install-ubuntu-lxc.sh
- reset-admin-password.sh script
- update-ubuntu-lxc.sh
- tailwind.config.ts
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- extraction-spec.md
- db.ts

## God Nodes (most connected - your core abstractions)
1. `db` - 33 edges
2. `registrarLog()` - 23 edges
3. `moneyFormatter` - 19 edges
4. `getConfiguracion()` - 16 edges
5. `saldoVentas()` - 16 edges
6. `compilerOptions` - 16 edges
7. `saldoVenta()` - 14 edges
8. `hashPassword()` - 12 edges
9. `dateInputValue()` - 12 edges
10. `What You Must Do When Invoked` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ClientesPage()` --calls--> `listarClientesConEstado()`  [EXTRACTED]
  app/clientes/page.tsx → lib/clientes.ts
- `PagoFiadoPage()` --calls--> `saldoVenta()`  [EXTRACTED]
  app/fiados/[id]/pago/page.tsx → lib/saldos.ts
- `GET()` --calls--> `getConfiguracion()`  [EXTRACTED]
  app/api/logo/route.ts → lib/configuracion.ts
- `POST()` --calls--> `enviarRecordatorioPago()`  [EXTRACTED]
  app/api/push/send/route.ts → lib/push.ts
- `crearCliente()` --calls--> `registrarLog()`  [EXTRACTED]
  app/clientes/actions.ts → lib/audit.ts

## Import Cycles
- None detected.

## Communities (36 total, 11 thin omitted)

### Community 0 - "fiados/actions.ts"
Cohesion: 0.12
Nodes (24): entregarCambio(), dynamic, eliminarFiado(), liquidarDeudaCliente(), registrarFiado(), registrarPagoFiado(), cancelarPedido(), crearPedido() (+16 more)

### Community 1 - "formatters.ts"
Cohesion: 0.12
Nodes (25): autorizado(), dynamic, GET(), acciones, dynamic, GET(), dynamic, PagoFiadoPage() (+17 more)

### Community 2 - "[token]/page.tsx"
Cohesion: 0.12
Nodes (16): dynamic, EstadoPublicoPage(), serialize(), AdminNotifyButton(), CopyButton(), DownloadStatementButton(), PushSubscriptionButton(), ShareStatementButton() (+8 more)

### Community 3 - "fiados/page.tsx"
Cohesion: 0.11
Nodes (25): dynamic, FiadosPage(), today, dynamic, orderLink(), PedidosPage(), today, CambioPendienteFields() (+17 more)

### Community 4 - "session.ts"
Cohesion: 0.10
Nodes (30): cambiarPasswordAdmin(), guardarConfiguracion(), RootLayout(), login(), logout(), items, clearSession(), setSession() (+22 more)

### Community 5 - "devDependencies"
Cohesion: 0.05
Nodes (37): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+29 more)

### Community 6 - "dependencies"
Cohesion: 0.07
Nodes (29): chart.js, @hookform/resolvers, lucide-react, motion, next, next-pwa, dependencies, chart.js (+21 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, es2022, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 8 - "clientes/actions.ts"
Cohesion: 0.20
Nodes (9): crearCliente(), editarCliente(), eliminarCliente(), estadoToken(), dynamic, ClientesPage(), dynamic, EliminarClienteButton() (+1 more)

### Community 9 - "AppIcon.tsx"
Cohesion: 0.07
Nodes (23): dynamic, GET(), ConfigAccordionItem(), accionesLog, ConfiguracionPage(), dynamic, passwordMessages, generateMetadata() (+15 more)

### Community 10 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 11 - "Delicias Lia Cobros"
Cohesion: 0.17
Nodes (11): APIs para N8N, Delicias Lia Cobros, Descripción, Despliegue, Estado, Objetivo, Requisitos, Responsable (+3 more)

### Community 12 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): compat, config, __dirname

### Community 26 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 27 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 28 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 29 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 30 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 36 - "db.ts"
Cohesion: 0.11
Nodes (23): autorizado(), dynamic, GET(), POST(), dynamic, dynamic, HistorialClientePage(), listarClientesConEstado() (+15 more)

## Knowledge Gaps
- **169 isolated node(s):** `dynamic`, `dynamic`, `dynamic`, `dynamic`, `dynamic` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `main()` connect `session.ts` to `dependencies`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `@prisma/client` connect `dependencies` to `session.ts`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **What connects `dynamic`, `dynamic`, `dynamic` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fiados/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12233285917496443 - nodes in this community are weakly interconnected._
- **Should `formatters.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Should `[token]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._