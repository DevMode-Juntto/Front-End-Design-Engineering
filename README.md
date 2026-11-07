# Front-End Design Engineering — Checklist GS 2026/2

**Tema:** CitizenTech • **Stack obrigatória:** React + Vite + TypeScript + Tailwind CSS • **Fonte:** PDF oficial, págs. **58–74** • **Entrega:** 19/11/2026, 23h55 • **Apresentação:** 23–27/11.

## Objetivo

Construir **SPA responsiva** e modular que navega por rotas, usa componentes reutilizáveis e **consome a API REST Java real** da disciplina de DDD. Publicar no **Vercel**, manter repositório **GitHub público** e entregar vídeo de demonstração.

## Requisitos técnicos e checklists por rubrica — 70 pontos

### 1) Construção do projeto — 10 pontos

- [ ] **2 pts:** iniciar aplicação com **React + Vite**, scripts válidos no `package.json`.
- [ ] **2 pts:** desenvolver código próprio em **`.ts` e `.tsx`**.
- [ ] **2 pts:** organizar pastas por **componentes, páginas, serviços e tipos** (ou equivalentes).
- [ ] **2 pts:** usar tipos/interfaces em **props, estados e dados** principais.
- [ ] **2 pts:** garantir execução local com `npm install` e `npm run dev`, sem erro impeditivo.

### 2) Componentização, páginas e rotas — 10 pontos

- [ ] **2 pts:** ter **dois ou mais componentes próprios** reutilizados em pelo menos duas partes da aplicação.
- [ ] **2 pts:** separar responsabilidades entre páginas/componentes/serviços.
- [ ] **2 pts:** implementar **cinco páginas institucionais**: `Home`, `Integrantes`, `Sobre`, `FAQ`, `Contato`, **e ao menos duas páginas próprias da solução** (**7 páginas no total**).
- [ ] **2 pts:** implementar rotas **estáticas** e ao menos **uma rota dinâmica com parâmetro**.
- [ ] **2 pts:** menu e links funcionais; acesso direto às rotas sem erro.

### 3) Tailwind CSS e responsividade — 8 pontos

- [ ] **2 pts:** instalar/configurar **Tailwind CSS** e usar classes utilitárias como estilização principal.
- [ ] **1,5 pt:** interface sem quebra em **mobile 390 × 844**.
- [ ] **1,5 pt:** interface sem quebra em **tablet 768 × 1024**.
- [ ] **1,5 pt:** interface sem quebra em **desktop 1440 × 900**.
- [ ] **1,5 pt:** evitar rolagem horizontal indevida, elementos cortados e sobreposição.

### 4) Integração com API Java — 18 pontos

- [ ] **3 pts:** API Java em URL **remota pública** e URL documentada no README.
- [ ] **3 pts:** fazer ao menos um **GET real** e mostrar dados retornados na interface.
- [ ] **4 pts:** fazer ao menos uma **escrita real** por POST, PUT, PATCH **ou** DELETE.
- [ ] **2 pts:** organizar chamadas HTTP numa **camada de serviços**.
- [ ] **3 pts:** mostrar estados de **loading, erro e ausência de dados**.
- [ ] **3 pts:** tipar dados recebidos com interfaces/tipos TypeScript.
- [ ] Usar exclusivamente **Fetch API** para HTTP; **Axios e outras bibliotecas de requisição não são aceitas**.
- [ ] **Não usar mocks ou API genérica** como substitutos do backend Java obrigatório.

### 5) Formulários e experiência do usuário — 7 pontos

- [ ] **1,5 pt:** formulário estruturado, campos identificados e apropriados.
- [ ] **1,5 pt:** validar obrigatoriedade e formatos.
- [ ] **1,5 pt:** mensagens de erro de preenchimento e confirmação de sucesso.
- [ ] **1,5 pt:** feedback de sucesso/falha de operações da API.
- [ ] **1 pt:** inputs legíveis, botões evidentes e fluxo intuitivo.

### 6) Deploy na Vercel — 7 pontos

- [ ] **2 pts:** publicar SPA em URL acessível no **Vercel**.
- [ ] **1 pt:** incluir URL do Vercel no README.
- [ ] **2 pts:** garantir carregamento sem erro impeditivo.
- [ ] **2 pts:** garantir rotas e API funcionando **na aplicação publicada**, não somente localmente.

### 7) GitHub, README e vídeo — 10 pontos

- [ ] **1 pt:** GitHub **público** com a versão final.
- [ ] **2 pts:** **mínimo 5 commits por integrante e 15 commits no total**.
- [ ] **2 pts:** README com título, objetivo, tecnologias, estrutura de pastas e integrantes.
- [ ] **2 pts:** README com comandos de execução e URLs de **GitHub, Vercel, API Java e YouTube** (o slide também pede contato).
- [ ] **3 pts:** vídeo no **YouTube (público ou não listado)** de **até 3 minutos**, mostrando funcionalidades e integração API.

### Visão geral da pontuação

| Critério | Pontos |
|---|---:|
| Construção do projeto | 10 |
| Componentização, páginas e rotas | 10 |
| Tailwind CSS e responsividade | 8 |
| Integração com a API Java | 18 |
| Formulários e UX | 7 |
| Deploy Vercel | 7 |
| GitHub, README e vídeo | 10 |
| Apresentação presencial | 30 |
| **Total** | **100** |

## Entrega (arquivo ZIP)

- [ ] Preparar um **único `.zip` com até 50 MB** contendo código-fonte, configs, imagens/recursos e README.
- [ ] **Excluir `node_modules/`** do ZIP.
- [ ] **Não enviar apenas links**: o ZIP é obrigatório, e o GitHub/Vercel/YouTube complementam a entrega.
- [ ] Apenas o **representante** envia o ZIP na disciplina no Portal FIAP.
- [ ] Incluir no README final **título, objetivo, tecnologias, estrutura, integrantes, execução, GitHub, Vercel, API, YouTube e contato**.
- [ ] Validar que `npm install && npm run dev` funciona com conteúdo do ZIP.
- [ ] Verificar navegação por URL direta (rotas) e CORS da API na versão Vercel.
- [ ] Incluir, se aplicável, `/assets` com imagens, ícones e mídias.

> **Inconsistência:** pág. 74 cita “páginas HTML” e “estilos CSS” no ZIP, mas as págs. 58–73 exigem **React + Vite + TypeScript + Tailwind**. Siga a stack obrigatória; confirme interpretação com o professor. A regra geral da GS (pág. 15) menciona arquivo `.txt` de identificação nos ZIPs.

## Apresentação presencial — 30 pontos

- [ ] **3 pts:** apresentar problema e contexto.
- [ ] **3 pts:** explicar a solução em sequência clara.
- [ ] **3 pts:** mostrar páginas obrigatórias, menu e navegação.
- [ ] **3 pts:** mostrar responsividade em mobile, tablet e desktop.
- [ ] **3 pts:** demonstrar menu mobile, interações, validações e feedback dos formulários.
- [ ] **4 pts + 4 pts:** domínio técnico de HTML/CSS/JavaScript aparece **duas vezes** na rubrica original — possível duplicidade editorial; confirmar com o professor.
- [ ] **4 pts:** todos participam oralmente de forma efetiva.
- [ ] **3 pts:** responder perguntas sobre código, funcionamento e decisões técnicas.

## Penalidades / riscos

| Problema | Penalidade |
|---|---|
| ZIP maior que 50 MB | −2 pts |
| `node_modules` incluído | −3 pts |
| Arquivos essenciais ausentes | −10 pts |
| Axios ou biblioteca HTTP diferente de Fetch API | −10 pts |
| Não entregar o ZIP obrigatório | **nota zero** |
| Template/tema/projeto pronto como base substancial | **nota zero** |
| Substituir React + Vite por Angular, Vue, Next.js, Create React App etc. | **nota zero** |
| Projeto incompatível com React/Vite/TS ou tema CitizenTech | **nota zero** |
| Plágio/cópia substancial | **zero + ocorrência** |

_Fonte: Global Solution 2026/2 — Front-End Design Engineering, págs. 58–74._
