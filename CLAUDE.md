# CLAUDE.md — Master Prompt do Projeto Vida & Carteira

> Este arquivo é a fonte única de verdade do projeto. Toda sessão do Claude Code nesta pasta começa lendo este arquivo. Não modifique sem antes consultar Eduardo.

## Identidade do projeto

Nome: Vida & Carteira

Proprietário: Eduardo Campos

Propósito: Sistema pessoal privado que organiza a trajetória de vida do proprietário em seis dimensões, do nascimento (1986) até cinco anos à frente (2031), com revisão trimestral guiada. Funciona como diário reflexivo para o passado e painel de gestão para o futuro.

Tagline interna: "Da infância ao norte de cinco anos — uma vida vista como carteira."

## Os seis pilares (hierarquia explícita)

A hierarquia abaixo é parâmetro do sistema, não decoração. Aparece em ordem visual, sensibilidade de alertas e peso na revisão trimestral.

1. Saúde (prioridade 1) — cor vermelho — corpo, mente, hábitos

2. Família (prioridade 2) — cor coral — marido, mãe, pai, irmãos, sobrinhos

3. Trabalho (prioridade 3) — cor âmbar — Onix Capital, carreira, propósito profissional

4. Relacionamentos — cor roxo — amizades, sócios não-Onix, mentores

5. Material — cor verde água — patrimônio, posses, evolução de net worth

6. Espiritual — cor azul — valores, crenças, autoconhecimento

## Princípios não-negociáveis

1. Privacidade por criptografia. A URL pode ser pública; a segurança vem da criptografia AES-GCM no navegador, não da obscuridade. Dados ininteligíveis sem a senha mestra. Chave nunca sai do navegador. Princípio alinhado com Bitwarden, Signal, Bitcoin.

2. Marco com reflexão. Marco histórico sem campo reflection preenchido é incompleto.

3. JSON antes de UI. Nenhuma feature visual é construída sem que o schema correspondente esteja definido e validado.

4. Hierarquia respeitada. Saúde, Família e Trabalho aparecem primeiro em qualquer listagem ordenada por dimensão.

5. Densidade variável. Anos vazios são informação válida.

6. Constelação, não régua. A linha do tempo é decorativa.

## Arquitetura técnica

Stack: HTML + CSS + JavaScript vanilla (sem framework), AES-GCM via Web Crypto API, GitHub Pages em repositório privado, SVG nativo.

Estrutura de pastas:

- assets/ (app.js, crypto.js, constellation.js, review.js, styles.css)

- data/ (marcos.json.enc, pessoas.json.enc, schema/)

- docs/ (ARCHITECTURE.md, PRIVACY.md, REVIEW-RITUAL.md)

- .agents/ (definições dos 4 sub-agentes)

## Os quatro sub-agentes

1. Schema Keeper — Estrutura JSON e validação. Worktree: schema/

2. Privacy Guardian — Gate de senha e criptografia AES-GCM. Worktree: privacy/

3. Constellation Builder — Visualização SVG dos marcos. Worktree: constellation/

4. Review Conductor — Fluxo de Revisão Trimestral. Worktree: review/

Cada sub-agente tem definição completa em .agents/

## Paleta oficial dos pilares

- Saúde: #F09595 / #A32D2D

- Família: #F0997B / #712B13

- Relacionamentos: #AFA9EC / #3C3489

- Trabalho: #EF9F27 / #633806

- Material: #5DCAA5 / #085041

- Espiritual: #85B7EB / #0C447C

## Convenções de código

- Idioma: comentários e variáveis em português. UI em português brasileiro.

- JavaScript moderno ES2022+, sem transpilador.

- Sem framework (sem React/Vue/Svelte).

- Dependências via CDN com SRI.

- Acessibilidade: ARIA labels, contraste WCAG AA, navegação por teclado.

- Mobile-first.

## Schemas dos dados

Marco histórico: id, type=historico, title, year, month, dimension, weight (1-10), description, reflection {learning, belief_reinforced}, tags, people, created_at.

Marco prospectivo: id, type=prospectivo, title, year, month, dimension, weight, description, target {deadline, indicators}, decisions, tags, people, created_at.

Pessoa: id, name, relation, since, dimension, notes.

## Roadmap em fases

- Fase 1 (semanas 1-3): gate de senha, criptografia, constelação com 5 marcos exemplo

- Fase 2 (semanas 4-8): 60-100 marcos cadastrados, entidade Pessoas, zoom e filtros

- Fase 3 (semanas 9-14): marcos prospectivos completos, fluxo de Revisão Trimestral

- Fase 4 (semanas 15-20): integração, métricas vivas, decisão sobre /viagens

## Como Eduardo dá instruções

Padrão recomendado:

> [DIMENSÃO] [VERBO] [OBJETO] [RESTRIÇÃO OPCIONAL]

Exemplos:

> SCHEMA adicionar campo "private" booleano ao marco histórico

> PRIVACY implementar fluxo de mudança de senha

> CONSTELLATION ajustar zoom para suportar touch no mobile

> REVIEW criar variação do ritual para revisão anual

## Palavra final ao maestro

Este sistema é privado, pessoal e tem peso emocional. Não é um app de mercado. Decisões devem priorizar clareza, privacidade e respeito ao significado acima de elegância técnica. Quando estiver em dúvida, escolha o caminho mais simples, mais seguro e mais respeitoso ao usuário (que é o próprio Eduardo).
