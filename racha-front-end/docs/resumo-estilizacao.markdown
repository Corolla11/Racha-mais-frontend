# Resumo da estilização do Racha+

Este documento reúne as alterações visuais realizadas nas telas existentes, nas novas interfaces e na estrutura compartilhada de estilos do frontend.

## 1. Direção visual

As referências enviadas foram usadas para revisar a composição das interfaces, mantendo o laranja nas ações principais, fundos claros, superfícies brancas, áreas de apoio em azul/lavanda, cantos arredondados e ícones Lucide.

Depois da primeira implementação, as telas novas foram refeitas para aproximar sua estrutura das referências. Em seguida, foi corrigida a diferença de escala entre telas que usavam textos e controles muito pequenos e outras que já apresentavam dimensões maiores.

A padronização foi feita por hierarquia visual e função do componente, sem aplicar zoom à aplicação e sem atribuir o mesmo tamanho a todos os textos.

## 2. Revisão visual das interfaces

| Interface | Alterações de estilização |
| --- | --- |
| Planos e assinaturas | Comparação em três cards no desktop, destaque para o plano recomendado, alternância de periodicidade, benefícios e FAQ abaixo dos planos. |
| Checkout | Composição em duas colunas, com pagamento e faturamento à esquerda e resumo do pedido à direita; adaptação para uma coluna no celular. |
| Gerenciar assinatura | Cards de plano atual, periodicidade, renovação e histórico, seguindo a apresentação de configurações. |
| Convite | Modal centralizado sobre fundo desfocado, foto de capa, identificação do grupo, participantes e ações de aceitar ou recusar. |
| Recuperação e redefinição de senha | Estrutura compartilhada com painel lateral laranja, formulário branco, indicação de etapas e mensagens de confirmação. |
| Pagamento via Pix | Modal com resumo da tarefa, valor individual em destaque, recebedor, QR Code ilustrativo, cópia e área de comprovante. |
| Gerenciar pagamentos | Página com resumo financeiro, progresso de arrecadação e lista de participantes com seus estados de pagamento. |
| Editar grupo | Drawer lateral com categorias visuais, capa, datas, descrição, regra de rateio e ações no rodapé. |
| Membros e convites | Modal com abas, avatares, permissões, informações dos membros e ações administrativas. |
| Auditoria e encerramento | Capa do grupo, checklist de conformidade, indicadores financeiros e chamada para encerramento. |
| Perfil e configurações | Organização por abas e painéis de perfil, notificações, segurança, Pix e assinatura. |
| Telas existentes | Ajustes de tipografia, controles e hierarquia em login, cadastro, grupos, criação de grupo, tarefas, notificações e FAQ. |

As composições próprias das telas foram preservadas. A uniformidade passou a vir da escala, dos controles e dos componentes compartilhados.

## 3. Escala tipográfica

Foi criada uma escala central em [`design-tokens.css`](../src/styles/design-tokens.css). Os valores abaixo são os equivalentes em pixels considerando uma base de 16 px; as definições utilizam `rem`.

| Função | Tamanho |
| --- | --- |
| Badge e informação curta | 11 px |
| Legenda e texto auxiliar | 12 px |
| Label, aba e navegação compacta | 13 px |
| Texto principal, campo e botão | 14 px |
| Texto de destaque | 16 px |
| Título de card | 18 px |
| Título de seção | 20 px |
| Título de modal ou drawer | 24 px |
| Valor financeiro de destaque | 28 px |
| Título de página | 32 px no desktop e 28 px no celular |
| Título promocional | 40 px no desktop e 32 px no celular |

Também foram definidos:

- Família tipográfica compartilhada: `Plus Jakarta Sans`, com fallback para `Segoe UI` e `sans-serif`.
- Altura de linha de referência de `1.5` para conteúdo e `1.25` para títulos.
- Classes semânticas do Tailwind, como `text-ui-body`, `text-ui-label`, `text-ui-caption` e `text-ui-page-title`.
- Estilos básicos para títulos sem tamanho explícito.
- Mapeamento compartilhado de classes em [`typography.ts`](../src/lib/typography.ts), utilizado pelo login no lugar da escala local anterior.

Os tamanhos muito pequenos presentes em diferentes telas foram substituídos por referências à escala comum. A escolha do nível depende da função do texto.

## 4. Campos, botões e cards

| Elemento | Padrão definido |
| --- | --- |
| Campo de texto ou select | 44 px de altura e texto de 14 px |
| Textarea | Altura mínima de 104 px, com crescimento vertical |
| Botão padrão | Altura mínima de 44 px e texto de 14 px |
| Botão compacto | Altura mínima de 40 px |
| Botão grande | Altura mínima de 48 px |
| Campos e botões | Raio de borda de 8 px |
| Cards compartilhados | Raio de 12 px |
| Padding de card | 24 px no desktop e 20 px no celular |
| Espaçamento base | 16 px |
| Espaçamento entre seções | 24 px |
| Padding de página | Referência de 32 px no desktop e 16 px no celular |

Foram ajustados ainda o espaço reservado aos ícones nos campos, o alinhamento entre texto e ícone nos botões e os estados de foco e desabilitado.

Botões com textos que precisam ocupar mais de uma linha podem crescer em altura. Fotos, QR Codes, ícones, gráficos, avatares e toggles mantêm dimensões adequadas às suas funções.

## 5. Componentes reutilizáveis

Foi criado [`ui.tsx`](../src/components/ui.tsx) com os seguintes componentes:

| Componente | Finalidade |
| --- | --- |
| `Button` | Botões primário, secundário, destrutivo e discreto, com opções de tamanho e largura total. |
| `Input` | Campo com a geometria e tipografia compartilhadas. |
| `Select` | Seleção com o mesmo padrão dos demais campos. |
| `Textarea` | Entrada de texto multilinha. |
| `Field` | Agrupamento de label, campo, dica e mensagem de erro. |
| `Card` | Superfície reutilizável para seções. |
| `PageHeading` | Título, descrição e identificação opcional da página. |

Esses componentes foram aplicados a interfaces como recuperação de senha, redefinição, escolha de criação e cabeçalho de configurações. As telas anteriores também passaram a utilizar as classes `ui-control` e `ui-button` para compartilhar as medidas sem exigir a reconstrução de seus layouts.

O `OrangeButton` passou a delegar sua renderização ao `Button`, mantendo a interface de uso existente.

Outros componentes criados ou revisados na organização visual incluem:

- `AppShell`: estrutura de sidebar, cabeçalho e navegação utilizada nas novas interfaces, no grupo e nas configurações.
- `AuthLayout`: composição compartilhada da recuperação e redefinição de acesso.
- `Overlay`: apresentação de modais e drawers com cabeçalho, conteúdo e rodapé.
- `GroupFlows` e `GroupPanels`: interfaces de grupo, membros, pagamentos, edição e auditoria.
- `AccountPanels`: painéis de Pix e segurança.
- `PixPreview`: representação visual do QR Code, sem código de pagamento real.

## 6. Menu de perfil

O `aba-perfil.tsx` foi redesenhado com base na imagem enviada, incluindo avatar, identificação, status, chave Pix, indicadores, atalhos e encerramento de sessão.

Após o ajuste solicitado, sua largura voltou para **280 px**, com aumento dos textos, avatar, ícones e espaçamentos. O limite de largura considera a tela disponível, e o conteúdo pode rolar quando necessário.

O avatar e a opção “Meu Perfil” abrem a tela de perfil e fecham o menu. Os demais atalhos também foram conectados. O menu pode abrir acima do acionador na sidebar ou abaixo dele no cabeçalho.

Seus estilos específicos estão em [`profile-menu.css`](../src/components/profile-menu.css), utilizando a escala tipográfica compartilhada.

## 7. Organização dos arquivos de estilo

| Arquivo | Responsabilidade |
| --- | --- |
| `src/index.css` | Tailwind, tema, classes tipográficas semânticas, referências de fonte e raios e estilos básicos dos títulos. |
| `src/styles/design-tokens.css` | Medidas centrais de tipografia, controles, espaçamentos e responsividade. |
| `src/styles/ui.css` | Regras compartilhadas dos componentes e adaptação da escala entre telas. |
| `src/flows.css` | Organização das importações dos estilos dos fluxos. |
| `src/styles/flow-base.css` | Base visual de superfícies, mensagens, labels, badges e elementos recorrentes. |
| `src/styles/flow-shell.css` | Estrutura da aplicação, sidebar e cabeçalho. |
| `src/styles/flow-plans.css` | Composição de planos e checkout. |
| `src/styles/flow-dialogs.css` | Modais, drawers, membros e pagamento via Pix. |
| `src/styles/flow-accounts.css` | Configurações, chaves Pix, cartões e transações. |
| `src/styles/flow-auth.css` | Recuperação e redefinição de senha. |
| `src/styles/flow-groups.css` | Convite, grupo e auditoria. |
| `src/styles/flow-payments.css` | Gerenciamento de pagamentos e participantes. |
| `src/components/profile-menu.css` | Apresentação do menu de perfil. |

O `main.tsx` importa os estilos gerais e os componentes utilizam as referências compartilhadas. A orientação para manutenção está em [`ui-standards.md`](ui-standards.md).

## 8. Responsividade e comportamento visual

- Colunas são reorganizadas verticalmente em telas menores.
- Os textos podem quebrar de linha sem reduzir excessivamente sua fonte.
- Títulos de página e espaçamentos externos têm variações próprias para celular.
- Drawers se adaptam à largura disponível.
- Modais mantêm uma área principal de rolagem, com ações acessíveis no rodapé quando configuradas.
- O menu lateral possui apresentação própria para dispositivos móveis.
- Tabelas extensas têm rolagem no próprio contêiner.
- As dimensões de campos e botões priorizam leitura e interação.

Uma foto ilustrativa de praia foi adicionada em `public/images/florianopolis-cover.jpg` para que a capa dos exemplos não dependa do carregamento externo. A fonte da imagem está registrada no README da pasta.

## 9. Verificações realizadas

Houve conferência das telas renderizadas em desktop de 1440 px e em largura móvel de 390 px, incluindo páginas antigas e novas. Nas rotas verificadas, não foi identificada rolagem horizontal da página.

Também foram conferidas medidas calculadas pelo navegador, como os títulos de página de 32/28 px e os campos de 44 px.

Build e lint passaram após os ajustes. Os seis testes financeiros existentes também passaram como verificação de regressão; esses testes validam regras de rateio e encerramento, não a aparência das telas. O build mantém um aviso sobre o tamanho do pacote JavaScript principal.

## 10. Recursos temporários e limites do trabalho

A página `/revisao`, a biblioteca de estados, as rotas `/previa/*` e o botão “Biblioteca de telas” foram usados para inspeção visual sem depender do login. Eles são recursos de desenvolvimento e revisão e não devem compor a navegação pública do produto final.

Atualmente, esses recursos ainda estão no aplicativo. Antes da publicação, será necessário remover ou restringir suas rotas e retirar o botão da versão pública; apenas escondê-lo visualmente não elimina as rotas.

A estilização não representa uma integração completa com o backend. QR Codes, cobranças, convites e outras ações identificadas como demonstração continuam dependendo das integrações correspondentes para uso real.
