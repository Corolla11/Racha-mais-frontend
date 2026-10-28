# Racha-mais-frontend

Front-End do Racha+.

## Backend

Configure `backend/.env` a partir de `backend/.env.example`, preenchendo as URLs
do PostgreSQL, `BETTER_AUTH_SECRET` e `BETTER_AUTH_TRUSTED_ORIGINS`. Para
desenvolvimento, `DATABASE_URL` deve apontar para o banco da aplicação e
`SHADOW_DATABASE_URL` para um banco shadow separado, usado pelo Prisma ao criar
migrations. Em produção, informe em `BETTER_AUTH_TRUSTED_ORIGINS` a origem
exata do front-end; prefira servir a API e o front-end sob a mesma origem.

No diretório `backend`, rode:

```sh
npm run db:generate
npm run db:migrate
npm run dev
```

`db:migrate` aplica as migrations pendentes e gera novas migrations quando o
schema muda. Em ambientes de implantação, use `npm run db:deploy`.

O envio de redefinição de senha usa a API do Resend. Configure
`RESEND_API_KEY` e `RESET_PASSWORD_EMAIL_FROM` no `backend/.env`, com um
remetente verificado no Resend. Configure `FRONTEND_URL` com a origem do
front-end. Sem essas credenciais, a solicitação de redefinição retorna erro em
vez de simular o envio.

### Integração front-end / back-end

O front-end usa `racha-front-end/.env` (copie de `.env.example`) para configurar
a URL da API. Em desenvolvimento, deixe `VITE_API_BASE_URL` vazio: o Vite
encaminha `/api/auth`, `/grupos`, `/tarefas` e `/partes` para o backend em
`http://localhost:3000`, evitando configuração de CORS durante o desenvolvimento.
Se o backend estiver em outro endereço, ajuste `VITE_BACKEND_PROXY_TARGET`.
Em produção, prefira servir front-end e API pela mesma origem via reverse proxy,
mantendo `VITE_API_BASE_URL` vazio ou relativo. Uma URL de API em outra origem
exige configuração explícita de CORS com credenciais no backend, além de incluir
a origem do front-end em `BETTER_AUTH_TRUSTED_ORIGINS`; essa configuração
cross-origin ainda não está implementada.

O helper `src/lib/api.ts` centraliza requests JSON, cookies de sessão e erros
HTTP. Login, cadastro, consulta de sessão, logout e proteção das páginas do
front-end usam as rotas BetterAuth existentes. O backend também oferece CRUD
autenticado para tarefas, membros, partes, chaves Pix e consulta de usuários.

Para desenvolvimento, inicie `npm run dev` tanto em `backend` quanto em
`racha-front-end`. As rotas de grupos, membros e partes exigem sessão autenticada.
