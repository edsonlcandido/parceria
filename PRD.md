# PRD - Parceria Finance

## 1. Visão Geral

Parceria Finance é uma aplicação mobile-first para acompanhamento financeiro de casal. O objetivo é permitir uma visão simples e compartilhada das finanças, com foco em saldos atuais, movimentações mensais e separação entre valores totais do casal e por usuário vinculado.

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
- Criar automaticamente os usuários iniciais do casal no onboarding e vinculá-los ao casal.
- Gerar uma URL de acesso com token secreto do casal.
- Criar contas dos tipos conta e cartão.
- Vincular cada conta a um usuário do casal por `user_id`.
- Adicionar lançamentos de receita e despesa.
- Atualizar o saldo das contas exclusivamente por lançamentos.
- Criar o saldo inicial da conta como um lançamento automático.
- Mostrar saldo do mês com navegação por mês.
- Filtrar visualização por todos do casal, Usuário 1 ou Usuário 2.
- Exibir lista de lançamentos com rolagem horizontal em layout mobile.
- Fazer CRUD de contas e lançamentos usando drawers.
- Pagar fatura de cartão de crédito a partir de uma conta bancária.

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
3. O sistema cria automaticamente os usuários iniciais vinculados ao casal.
4. O sistema gera um access_token secreto.
5. O usuário é redirecionado para /app/dashboard?access_token=:token.
6. A partir dessa URL, o casal passa a acessar e editar os próprios dados.

### 8.2 Criação de conta

1. Usuário abre o drawer de nova conta.
2. Informa nome da conta.
3. Escolhe tipo: conta ou cartão.
4. Escolhe o usuário dono da conta (Usuário 1 ou Usuário 2).
5. Informa saldo inicial opcional.
6. Ao salvar, a conta é criada.
7. Se houver saldo inicial, o sistema cria automaticamente um lançamento correspondente.
8. Para contas do tipo cartão, o saldo inicial (fatura pré-existente) é registrado como despesa (expense).

### 8.3 Criação de lançamento

1. Usuário abre o drawer de novo lançamento.
2. Seleciona a conta.
3. Informa valor.
4. Define tipo: receita ou despesa.
5. Define o usuário responsável pelo lançamento.
6. Informa descrição.
7. Define data.
8. Define se está consolidado.
9. Salva o lançamento.
10. O saldo da conta e os cards do dashboard são recalculados.

### 8.4 Navegação do dashboard

1. Usuário alterna o mês no cabeçalho.
2. Usuário filtra por todos do casal, Usuário 1 ou Usuário 2.
3. O sistema recalcula cards e listagem com base no filtro selecionado.

### 8.5 Pagamento de fatura de cartão

1. Usuário acessa a ação "Pagar Fatura" a partir de um cartão.
2. O sistema abre o drawer de pagamento de fatura.
3. Usuário seleciona o cartão a pagar.
4. Usuário seleciona a conta de origem (do tipo conta).
5. Usuário informa o valor a pagar.
6. Usuário informa a data do pagamento.
7. Usuário informa descrição (opcional).
8. Ao confirmar, o sistema cria um lançamento de despesa na conta de origem com a categoria `bill_payment`.
9. Nenhum lançamento é criado no cartão. O saldo do cartão não é alterado pelo pagamento.
10. O lançamento de pagamento de fatura não é incluído nos cálculos de Receitas e Despesas do dashboard.

## 9. Requisitos Funcionais

### 9.1 Tenant e acesso

- O sistema deve criar um novo casal ao acessar /app/ quando não houver tenant ativo.
- O sistema deve criar os usuários iniciais vinculados ao casal durante o onboarding.
- O sistema deve gerar um token secreto único para cada casal.
- O sistema deve carregar dados com base no access_token informado na URL.
- O sistema não deve usar couple_id puro como chave pública de acesso.

### 9.2 Contas

- O sistema deve permitir criar contas do tipo conta.
- O sistema deve permitir criar contas do tipo cartão.
- O sistema deve permitir vincular a conta a um usuário por `user_id`.
- O sistema deve permitir editar conta.
- O sistema deve permitir excluir conta.
- O sistema deve recalcular o saldo com base nos lançamentos da conta.

### 9.3 Lançamentos

- O sistema deve permitir criar lançamentos de receita.
- O sistema deve permitir criar lançamentos de despesa.
- O sistema deve permitir vincular o lançamento a um usuário por `user_id`.
- O sistema deve permitir editar lançamentos.
- O sistema deve permitir excluir lançamentos.
- O sistema deve permitir marcar lançamento como consolidado ou não.
- O sistema deve permitir informar descrição e data.
- O sistema deve usar o saldo inicial da conta como lançamento criado automaticamente.
- O sistema deve suportar a categoria `bill_payment` para lançamentos de pagamento de fatura de cartão.

### 9.4 Lançamentos em cartões de crédito

- Compras no cartão devem ser registradas como despesas (expense).
- Fatura inicial (saldo devedor pré-existente) deve ser registrada como despesa (expense).
- Atualização de saldo (ajustes manuais) deve ser registrada como despesa ou receita, dependendo da diferença com o saldo atual:
  - Se o ajuste aumenta a dívida → despesa (expense).
  - Se o ajuste reduz a dívida → receita (income).

### 9.5 Pagamento de fatura de cartão

- O sistema deve oferecer a ação "Pagar Fatura" para contas do tipo cartão.
- O sistema deve permitir selecionar uma conta de origem (do tipo conta) para o pagamento.
- O sistema deve criar um lançamento de despesa na conta de origem ao confirmar o pagamento.
- O sistema deve marcar o lançamento de pagamento com a categoria `bill_payment`.
- O sistema NÃO deve criar nenhum lançamento no cartão ao pagar a fatura.
- O saldo do cartão não deve ser alterado pelo pagamento da fatura.
- Lançamentos com categoria `bill_payment` NÃO devem ser incluídos nos cálculos dos cards de Receitas e Despesas do dashboard.

### 9.6 Dashboard

- O sistema deve exibir cards de Contas, Cartões, Receitas e Despesas.
- O sistema deve exibir o Saldo do Mês em destaque.
- O sistema deve permitir navegar entre meses.
- O sistema deve permitir filtrar por todos do casal, Usuário 1 e Usuário 2.
- O sistema deve listar os lançamentos do período em tabela com rolagem horizontal.

### 9.7 UI mobile-first

- O sistema deve ser otimizado para celular.
- O sistema deve usar drawers para criar, editar e excluir contas e lançamentos.
- O sistema deve priorizar ações rápidas e leitura clara dos totais.

## 10. Regras de Negócio

### 10.1 Contas do tipo conta

- O saldo de uma conta do tipo conta deve ser calculado por soma acumulada de receitas menos despesas.
- O card Contas deve mostrar o saldo atual acumulado das contas do tipo conta.
- Lançamentos com categoria `bill_payment` devem ser incluídos no cálculo do saldo da conta (pois representam saída real de dinheiro da conta bancária).

### 10.2 Contas do tipo cartão

- O saldo de um cartão deve ser calculado como saldo devedor acumulado.
- O card Cartões deve mostrar o total devedor acumulado, não apenas o valor do mês.
- O card Cartões deve sempre exibir valores positivos, pois representa dívidas/faturas a pagar.
- Compras no cartão devem ser registradas como despesas (expense).
- Fatura inicial (saldo devedor pré-existente) deve ser registrada como despesa (expense).
- Atualização de saldo (ajustes) deve ser registrada como despesa (expense) se aumenta a dívida, ou receita (income) se reduz a dívida.

### 10.3 Pagamento de fatura

- O pagamento de fatura cria um lançamento de despesa apenas na conta de origem (conta bancária).
- O pagamento de fatura NÃO gera nenhum lançamento no cartão. O saldo do cartão não é afetado.
- O lançamento de pagamento de fatura deve ter a categoria `bill_payment`.
- Lançamentos com categoria `bill_payment` NÃO devem ser contabilizados nos cards de Receitas e Despesas do dashboard.
- Lançamentos com categoria `bill_payment` DEVEM ser contabilizados no saldo da conta de origem (impactam o card Contas).

### 10.4 Regras gerais do dashboard

- Receitas e Despesas devem considerar apenas o mês selecionado no dashboard.
- O Saldo do Mês deve ser calculado por receitas do mês menos despesas do mês.
- O filtro por responsável deve considerar três opções: todos do casal, Usuário 1 e Usuário 2.
- O lançamento inicial gerado na criação da conta deve entrar nos cálculos normalmente.
- Lançamentos com categoria `bill_payment` devem ser excluídos dos cálculos de Receitas, Despesas e Saldo do Mês.

## 11. Modelo de Dados Proposto

### 11.1 couples

- id
- name
- access_token
- created
- updated

### 11.2 users

- id
- couple_id
- name
- created
- updated

### 11.3 accounts

- id
- couple_id
- user_id
- name
- type
- created
- updated

- type: conta | cartao

### 11.4 transactions

- id
- couple_id
- account_id
- user_id
- amount
- description
- type
- category
- date
- consolidated
- created
- updated

Valores válidos:

- type: income | expense
- category: regular | bill_payment (default: regular)

Observações:

- O campo `category` diferencia lançamentos comuns (`regular`) de pagamentos de fatura de cartão (`bill_payment`).
- Lançamentos com `category = bill_payment` são excluídos dos cards de Receitas, Despesas e Saldo do Mês.
- Lançamentos com `category = bill_payment` são incluídos no cálculo do saldo da conta de origem.

## 12. Cálculos do Dashboard

### 12.1 Card Contas

Somatório do saldo atual de todas as contas do tipo conta, respeitando o filtro selecionado (todos do casal ou usuário específico).

Formula:

- saldo_conta = soma(income) - soma(expense)

Nota: Inclui todos os lançamentos da conta, inclusive os de categoria `bill_payment`.

### 12.2 Card Cartões

Somatório do saldo devedor acumulado de todas as contas do tipo cartão, respeitando o filtro selecionado (todos do casal ou usuário específico).

Formula:

- saldo_cartao = soma(expense) - soma(income)

Exibição esperada:

- Sempre exibir como valor positivo (ex: R$ 500,00, não -R$ 500,00).
- O valor representa o total de dívida acumulada no cartão.

### 12.3 Card Receitas

Somatório das receitas do mês selecionado, respeitando o filtro selecionado (todos do casal ou usuário específico).

Regra: Excluir lançamentos com `category = bill_payment`.

### 12.4 Card Despesas

Somatório das despesas do mês selecionado, respeitando o filtro selecionado (todos do casal ou usuário específico).

Regra: Excluir lançamentos com `category = bill_payment`.

### 12.5 Saldo do Mês

Formula:

- saldo_mes = receitas_mes - despesas_mes

Regra: Excluir lançamentos com `category = bill_payment` de ambos os lados da fórmula.

## 13. Estrutura de Telas

### 13.1 Dashboard

Elementos principais:

- Navegação por mês no topo.
- Abas de filtro: Todos, Usuário 1, Usuário 2.
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
- Usuário
- Saldo inicial

### 13.3 Drawer de lançamento

Campos mínimos:

- Conta
- Valor
- Tipo
- Usuário
- Descrição
- Data
- Consolidado

### 13.4 Drawer de pagamento de fatura

Campos mínimos:

- Cartão a pagar
- Conta de origem (do tipo conta)
- Valor a pagar
- Data do pagamento
- Descrição (opcional)

Comportamento:

- Disponível como ação nas contas do tipo cartão.
- Ao confirmar, cria lançamento de despesa na conta de origem com `category = bill_payment`.
- Não cria nenhum lançamento no cartão.
- O saldo do cartão permanece inalterado.

## 14. Requisitos Não Funcionais

- A aplicação deve funcionar bem em telas pequenas.
- A navegação principal deve ser simples e de baixo atrito.
- O tempo de carregamento do dashboard deve ser adequado para uso cotidiano.
- O modelo de acesso deve ser simples, mas não deve expor o tenant apenas por id previsível.
- O vínculo de dados de contas e lançamentos deve usar `user_id`, sem uso de `owner_slot`.

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
- O onboarding deve criar e vincular automaticamente os usuários iniciais ao casal via `couple_id`.
- O sistema deve redirecionar para o dashboard com access_token válido.
- Deve ser possível criar conta do tipo conta e cartão.
- Deve ser possível vincular conta por `user_id`.
- O saldo inicial da conta deve ser persistido como lançamento.
- Para cartões, o saldo inicial deve ser registrado como despesa (expense).
- Deve ser possível criar, editar e excluir lançamentos.
- O dashboard deve exibir os totais corretos por mês.
- O dashboard deve responder corretamente ao filtro por todos do casal, Usuário 1 e Usuário 2.
- O card Cartões deve mostrar o saldo devedor acumulado sempre como valor positivo.
- Compras no cartão devem ser registradas como despesas.
- Ajustes de saldo em cartões devem ser despesa ou receita conforme a direção do ajuste.
- Deve ser possível pagar fatura de cartão a partir de uma conta bancária.
- O pagamento de fatura deve criar lançamento de despesa apenas na conta de origem, sem afetar o cartão.
- Lançamentos de pagamento de fatura (`bill_payment`) não devem aparecer nos cards de Receitas e Despesas.
- Lançamentos de pagamento de fatura devem impactar o saldo da conta de origem (card Contas).
- Todas as operações principais devem ser utilizáveis em interface mobile com drawers.
