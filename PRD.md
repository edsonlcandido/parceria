# PRD - Parceria Finance

## 1. Visão Geral

Parceria Finance é uma aplicação mobile-first para acompanhamento financeiro de casal. O objetivo é permitir uma visão simples e compartilhada das finanças, com foco em saldos atuais, movimentações mensais e separação entre valores do casal, do Usuário 1 e do Usuário 2.

O produto não terá login no v1. O acesso será feito por uma URL com token secreto do casal, funcionando como um modelo multi-tenant simples.

Exemplo de acesso:

- /app/
- /app/dashboard?access_token=:token

## 2. Problema

Casais normalmente controlam finanças em planilhas, anotações soltas ou aplicativos individuais. Isso dificulta responder perguntas básicas como:

- Quanto temos em contas hoje?
- Quanto estamos devendo no cartão?
- Como foi o saldo do mês?
- Quanto foi gasto pelo casal, pelo Usuário 1 ou pelo Usuário 2?

O produto deve resolver isso com uma interface focada em celular, rápida de usar e com CRUD via drawers.

## 3. Objetivo do Produto

Permitir que um casal acompanhe suas finanças em uma visão consolidada e também filtrada por responsável, com cadastro de contas e lançamentos e cálculo automático dos saldos.

## 4. Objetivos de Negócio

- Reduzir a complexidade do controle financeiro compartilhado.
- Facilitar o acompanhamento mensal das finanças do casal.
- Entregar uma experiência simples, sem fricção de cadastro e login no v1.

## 5. Escopo do V1

O produto deve permitir:

- Criar automaticamente um novo casal ao acessar /app/ pela primeira vez.
- Gerar uma URL de acesso com token secreto do casal.
- Criar contas dos tipos conta e cartão.
- Vincular cada conta ao casal, ao Usuário 1 ou ao Usuário 2.
- Adicionar lançamentos de receita e despesa.
- Atualizar o saldo das contas exclusivamente por lançamentos.
- Criar o saldo inicial da conta como um lançamento automático.
- Mostrar saldo do mês com navegação por mês.
- Filtrar visualização por casal, Usuário 1 ou Usuário 2.
- Exibir lista de lançamentos com rolagem horizontal em layout mobile.
- Fazer CRUD de contas e lançamentos usando drawers.

## 6. Fora do Escopo no V1

- Login e autenticação por usuário.
- Categorias de lançamentos.
- Tipo de conta dinheiro.
- Parcelamentos.
- Lançamentos recorrentes.
- Orçamentos e metas.
- Exportação de relatórios.
- Controle de permissões por usuário.

## 7. Público-Alvo

- Casais que desejam controlar finanças compartilhadas.
- Usuários que priorizam simplicidade e uso por celular.
- Pessoas que não querem passar por fluxo de login no primeiro momento.

## 8. Fluxo Principal do Produto

### 8.1 Entrada inicial

1. Usuário acessa /app/.
2. O sistema cria automaticamente um registro de casal.
3. O sistema gera um access_token secreto.
4. O usuário é redirecionado para /app/dashboard?access_token=:token.
5. A partir dessa URL, o casal passa a acessar e editar os próprios dados.

### 8.2 Criação de conta

1. Usuário abre o drawer de nova conta.
2. Informa nome da conta.
3. Escolhe tipo: conta ou cartão.
4. Escolhe responsável: casal, Usuário 1 ou Usuário 2.
5. Informa saldo inicial opcional.
6. Ao salvar, a conta é criada.
7. Se houver saldo inicial, o sistema cria automaticamente um lançamento correspondente.

### 8.3 Criação de lançamento

1. Usuário abre o drawer de novo lançamento.
2. Seleciona a conta.
3. Informa valor.
4. Define tipo: receita ou despesa.
5. Informa descrição.
6. Define data.
7. Define se está consolidado.
8. Salva o lançamento.
9. O saldo da conta e os cards do dashboard são recalculados.

### 8.4 Navegação do dashboard

1. Usuário alterna o mês no cabeçalho.
2. Usuário filtra por casal, Usuário 1 ou Usuário 2.
3. O sistema recalcula cards e listagem com base no filtro selecionado.

## 9. Requisitos Funcionais

### 9.1 Tenant e acesso

- O sistema deve criar um novo casal ao acessar /app/ quando não houver tenant ativo.
- O sistema deve gerar um token secreto único para cada casal.
- O sistema deve carregar dados com base no access_token informado na URL.
- O sistema não deve usar couple_id puro como chave pública de acesso.

### 9.2 Contas

- O sistema deve permitir criar contas do tipo conta.
- O sistema deve permitir criar contas do tipo cartão.
- O sistema deve permitir vincular a conta ao casal, ao Usuário 1 ou ao Usuário 2.
- O sistema deve permitir editar conta.
- O sistema deve permitir excluir conta.
- O sistema deve recalcular o saldo com base nos lançamentos da conta.

### 9.3 Lançamentos

- O sistema deve permitir criar lançamentos de receita.
- O sistema deve permitir criar lançamentos de despesa.
- O sistema deve permitir editar lançamentos.
- O sistema deve permitir excluir lançamentos.
- O sistema deve permitir marcar lançamento como consolidado ou não.
- O sistema deve permitir informar descrição e data.
- O sistema deve usar o saldo inicial da conta como lançamento criado automaticamente.

### 9.4 Dashboard

- O sistema deve exibir cards de Contas, Cartões, Receitas e Despesas.
- O sistema deve exibir o Saldo do Mês em destaque.
- O sistema deve permitir navegar entre meses.
- O sistema deve permitir filtrar por casal, Usuário 1 e Usuário 2.
- O sistema deve listar os lançamentos do período em tabela com rolagem horizontal.

### 9.5 UI mobile-first

- O sistema deve ser otimizado para celular.
- O sistema deve usar drawers para criar, editar e excluir contas e lançamentos.
- O sistema deve priorizar ações rápidas e leitura clara dos totais.

## 10. Regras de Negócio

- O saldo de uma conta do tipo conta deve ser calculado por soma acumulada de receitas menos despesas.
- O saldo de um cartão deve ser calculado como saldo devedor acumulado.
- O card Cartões deve mostrar o total devedor acumulado, não apenas o valor do mês.
- O card Contas deve mostrar o saldo atual acumulado das contas do tipo conta.
- Receitas e Despesas devem considerar apenas o mês selecionado no dashboard.
- O Saldo do Mês deve ser calculado por receitas do mês menos despesas do mês.
- O filtro por responsável deve considerar três opções: casal, Usuário 1 e Usuário 2.
- O lançamento inicial gerado na criação da conta deve entrar nos cálculos normalmente.

## 11. Modelo de Dados Proposto

### 11.1 couples

- id
- name
- access_token
- created
- updated

### 11.2 accounts

- id
- couple_id
- owner_slot
- name
- type
- created
- updated

Valores válidos:

- owner_slot: casal | usuario_1 | usuario_2
- type: conta | cartao

### 11.3 transactions

- id
- couple_id
- account_id
- owner_slot
- amount
- description
- type
- date
- consolidated
- created
- updated

Valores válidos:

- owner_slot: casal | usuario_1 | usuario_2
- type: income | expense

## 12. Cálculos do Dashboard

### 12.1 Card Contas

Somatório do saldo atual de todas as contas do tipo conta, respeitando o filtro selecionado.

Formula:

- saldo_conta = soma(income) - soma(expense)

### 12.2 Card Cartões

Somatório do saldo devedor acumulado de todas as contas do tipo cartão, respeitando o filtro selecionado.

Formula:

- saldo_cartao = soma(expense) - soma(income)

Exibição esperada:

- valor negativo ou visual de dívida

### 12.3 Card Receitas

Somatório das receitas do mês selecionado, respeitando o filtro selecionado.

### 12.4 Card Despesas

Somatório das despesas do mês selecionado, respeitando o filtro selecionado.

### 12.5 Saldo do Mês

Formula:

- saldo_mes = receitas_mes - despesas_mes

## 13. Estrutura de Telas

### 13.1 Dashboard

Elementos principais:

- Navegação por mês no topo.
- Abas de filtro: Casal, Usuário 1, Usuário 2.
- Cards de resumo financeiro.
- Destaque para saldo do mês.
- Botão de novo lançamento.
- Lista de lançamentos com scroll horizontal.

Colunas mínimas da lista de lançamentos:

- Parceiro
- Tipo
- Conta
- Valor
- Data
- Descrição
- Consolidado

### 13.2 Drawer de conta

Campos mínimos:

- Nome
- Tipo
- Responsável
- Saldo inicial

### 13.3 Drawer de lançamento

Campos mínimos:

- Conta
- Valor
- Tipo
- Descrição
- Data
- Consolidado

## 14. Requisitos Não Funcionais

- A aplicação deve funcionar bem em telas pequenas.
- A navegação principal deve ser simples e de baixo atrito.
- O tempo de carregamento do dashboard deve ser adequado para uso cotidiano.
- O modelo de acesso deve ser simples, mas não deve expor o tenant apenas por id previsível.

## 15. Considerações Técnicas

- Frontend em Vue 3 + TypeScript + Pinia + Vue Router.
- Backend e dados em PocketBase.
- O roteamento continuará sob /app/.
- O acesso ao tenant será resolvido por token secreto na URL.
- O CRUD será feito em drawers para manter a experiência mobile-first.

## 16. Riscos e Observações

- Sem login, a segurança depende diretamente do sigilo da URL com token.
- Se a URL for compartilhada, qualquer pessoa com o token poderá acessar e editar os dados do casal.
- No futuro, pode ser útil separar token de visualização e token de edição.

## 17. Critérios de Aceite

- Ao acessar /app/, um novo casal deve poder ser criado automaticamente.
- O sistema deve redirecionar para o dashboard com access_token válido.
- Deve ser possível criar conta do tipo conta e cartão.
- Deve ser possível vincular conta a casal, Usuário 1 ou Usuário 2.
- O saldo inicial da conta deve ser persistido como lançamento.
- Deve ser possível criar, editar e excluir lançamentos.
- O dashboard deve exibir os totais corretos por mês.
- O dashboard deve responder corretamente ao filtro por casal, Usuário 1 e Usuário 2.
- O card Cartões deve mostrar o saldo devedor acumulado.
- Todas as operações principais devem ser utilizáveis em interface mobile com drawers.
