# Padrão de escala visual do Racha+

A escala está definida em `src/styles/design-tokens.css`. Os controles compartilhados estão em `src/components/ui.tsx` e `src/styles/ui.css`.

| Uso | Tamanho padrão |
| --- | --- |
| Badge e informação curta | 11 px |
| Legenda e texto auxiliar | 12 px |
| Label, aba e navegação compacta | 13 px |
| Texto principal, campo e botão | 14 px |
| Texto de destaque | 16 px |
| Título de card | 18 px |
| Título de seção | 20 px |
| Título de modal/drawer | 24 px |
| Título de página | 32 px; 28 px no mobile |
| Valor financeiro de destaque | 28 px |
| Título promocional | 40 px; 32 px no mobile |

- Campos e botões: 44 px de altura mínima; variação compacta explícita de 40 px e grande de 48 px.
- Campos e botões: raio de 8 px. Textareas: altura mínima de 104 px e crescimento vertical.
- Cards: raio de 12 px e padding de 24 px no desktop ou 20 px no mobile.
- As telas antigas usam `ui-control` e `ui-button` para compartilhar a mesma geometria dos componentes novos.
- `OrangeButton` delega ao componente `Button`, mantendo compatibilidade com os usos existentes.
- Use `Button`, `Input`, `Select`, `Textarea`, `Field`, `Card` e `PageHeading` nas novas interfaces.
- Nos trechos com Tailwind, use `text-ui-body`, `text-ui-label`, `text-ui-caption`, `text-ui-page-title` e os demais nomes semânticos do tema.
- Preserve dimensões próprias de fotos, QR Codes, gráficos, ícones e toggles; elas não representam a escala dos controles de formulário.
- Evite criar tamanhos de fonte isolados ou diminuir fontes no mobile. Reorganize as colunas e permita quebra de texto.
