# Racha-mais-frontend

Front-End do Racha+.

## Backend

Configure `backend/.env` a partir de `backend/.env.example`, preenchendo as URLs
do PostgreSQL, `BETTER_AUTH_SECRET` e `BETTER_AUTH_TRUSTED_ORIGINS`. Para
desenvolvimento, `DATABASE_URL` deve apontar para o banco da aplicação e
`SHADOW_DATABASE_URL` para um banco shadow separado, usado pelo Prisma ao criar
migrations. Em produção, informe em `BETTER_AUTH_TRUSTED_ORIGINS` a origem
exata do front-end; prefira servir a API e o front-end sob a mesma origem.

O fluxo de recuperação de senha do Better Auth envia o link pelo Resend. Configure
`RESEND_API_KEY` e `RESEND_FROM_EMAIL` no `backend/.env`; para desenvolvimento,
pode usar o remetente de testes do Resend, sujeito às restrições da conta. Em
produção, use um remetente de domínio verificado. O front-end deve chamar
`POST /api/auth/request-password-reset` com o e-mail e o `redirectTo` da tela de
redefinição, e `POST /api/auth/reset-password` para salvar a nova senha.
Para obter a chave, crie uma API key em [resend.com/api-keys](https://resend.com/api-keys)
com permissão de envio e coloque-a em `RESEND_API_KEY`. Em testes, o remetente
`onboarding@resend.dev` só pode enviar para destinatários permitidos pela conta
Resend; para outros destinatários, configure e verifique um domínio.
Para testar, inicie o backend e o front-end, abra `/esqueceu-senha`, solicite a
recuperação para uma conta existente e use o link recebido para cadastrar a nova
senha. Confira a caixa de spam e os logs de envio no painel do Resend.

### Plano Pro

O backend oferece Pro por **R$ 4,90/mês** ou **R$ 49,90/ano**. Os benefícios ainda
não estão definidos. O checkout recorrente da AbacatePay usa cartão e requer dois
produtos de assinatura criados no painel, um mensal e outro anual, com esses
valores. Configure os IDs em `ABACATEPAY_PRO_MONTHLY_PRODUCT_ID` e
`ABACATEPAY_PRO_ANNUAL_PRODUCT_ID`, além da chave de API em `ABACATEPAY_API_KEY`.
Use uma chave de Dev mode para testes e dê a ela as permissões
`SUBSCRIPTION:CREATE` e `SUBSCRIPTION:DELETE`. O backend confere o valor retornado
no checkout antes de entregar o link, evitando cobrar um preço diferente do
mostrado no catálogo do app.

Configure `ABACATEPAY_RETURN_URL` e `ABACATEPAY_COMPLETION_URL` com as URLs de
retorno do front-end. Cadastre na AbacatePay o webhook
`https://<api>/webhooks/abacatepay?webhookSecret=<segredo>` para os eventos
`subscription.completed`, `subscription.cancelled` e `subscription.renewed`.
O mesmo segredo deve estar em `ABACATEPAY_WEBHOOK_SECRET`; configure também a
chave de verificação HMAC em `ABACATEPAY_WEBHOOK_PUBLIC_KEY`. A assinatura só é
ativada após confirmação do webhook.

Endpoint público:

- `GET /planos` — listar os ciclos e preços disponíveis.

Endpoints autenticados:

- `GET /assinaturas/grupos/:idGrupo` — consultar o estado Pro do grupo; qualquer
  membro pode consultar.
- `POST /assinaturas/grupos/:idGrupo/pro/checkout` com
  `{ "ciclo": "mensal" | "anual" }` — o dono cria ou recupera o checkout pendente.
- `POST /assinaturas/grupos/:idGrupo/cancel` — o dono cancela o checkout pendente
  ou assinatura Pro (o provedor cancela imediatamente e o acesso Pro é removido).

O cancelamento imediato é a opção oferecida pela API da AbacatePay; não há
período de acesso até o fim do ciclo depois de cancelar. Um grupo não pode ser
excluído enquanto houver assinatura ativa ou checkout pendente; cancele primeiro.

No diretório `backend`, rode:

```sh
npm run db:generate
npm run db:migrate
npm run dev
```

`db:migrate` aplica as migrations pendentes e gera novas migrations quando o
schema muda. Em ambientes de implantação, use `npm run db:deploy`.

### Notificações

As notificações são persistidas no banco e consultadas pelo próprio usuário.
O backend notifica quando alguém é adicionado a um grupo, quando uma tarefa é
criada e quando uma parte/cobrança é atribuída. Para partes ainda não
finalizadas/canceladas, o backend verifica a cada 15 minutos prazos nas próximas
24 horas e vencidos nas últimas 24 horas; cada aviso é criado uma única vez por
parte e prazo. As notificações de prazo dependem de a pessoa responsável ter uma
parte cadastrada na tarefa. No fluxo atual, `FINALIZADA` encerra os lembretes.

Endpoints autenticados:

- `GET /notificacoes` — listar notificações; aceita `naoLidas=true`, `pagina` e
  `limite` (1 a 100).
- `PATCH /notificacoes/:id/lida` — marcar uma notificação como lida.
- `PATCH /notificacoes/lidas` — marcar todas como lidas.

O modelo atual não tem um tipo separado para “bloco de informação”; uma tarefa
com descrição e sem valor pode ser usada para esse aviso. A notificação é
in-app; envio por e-mail/push e eventos de mensagens ficam fora desta etapa.

### Criação de grupos com Gemini

Configure `GEMINI_API_KEY` no `backend/.env` com uma chave criada no
[Google AI Studio](https://aistudio.google.com/apikey). O navegador chama
`POST /ia/grupos/rascunho` com `{ "prompt": "..." }`; o endpoint autenticado
retorna um nome e uma descrição sugeridos. O usuário pode editá-los antes de
confirmar a criação do grupo via `POST /grupos`. O prompt é enviado ao Gemini,
mas a chave permanece no backend. A assinatura do app Gemini não substitui a
chave de API nem necessariamente cobre o uso da Gemini API; confira cotas e
preços no AI Studio antes de usar em produção. Não envie dados pessoais ou
segredos no prompt.

### Integração front-end / back-end

O front-end usa `racha-front-end/.env` (copie de `.env.example`) para configurar
a URL da API. Em desenvolvimento, deixe `VITE_API_BASE_URL` vazio: o Vite
encaminha `/api/auth`, `/grupos`, `/ia`, `/tarefas` e `/partes` para o backend em
`http://localhost:3000`, evitando configuração de CORS durante o desenvolvimento.
As rotas `/notificacoes`, `/planos` e `/assinaturas` também são encaminhadas pelo
proxy.
Se o backend estiver em outro endereço, ajuste `VITE_BACKEND_PROXY_TARGET`.
Em produção, prefira servir front-end e API pela mesma origem via reverse proxy,
mantendo `VITE_API_BASE_URL` vazio ou relativo. Uma URL de API em outra origem
exige configuração explícita de CORS com credenciais no backend, além de incluir
a origem do front-end em `BETTER_AUTH_TRUSTED_ORIGINS`; essa configuração
cross-origin ainda não está implementada.

O helper `src/lib/api.ts` centraliza requests JSON, cookies de sessão e erros
HTTP. Login, cadastro, consulta de sessão, logout e proteção das páginas do
front-end usam as rotas BetterAuth existentes. O CRUD de Tarefas ainda não está
implementado no backend; a migration que relaciona Parte e Tarefa precisa ser
alinhada com a pessoa responsável por esse CRUD antes de ser aplicada.

Para desenvolvimento, inicie `npm run dev` tanto em `backend` quanto em
`racha-front-end`. As rotas de grupos, membros e partes exigem sessão autenticada.
