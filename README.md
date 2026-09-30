# Gerenciamento de Projetos

Listagem, criação, edição e exclusão de projetos, com a possibilidade de busca por nome do projeto, filtragem por favoritos e ordenação por ordem alfabética, data de início e término do projeto.

## Como rodar o projeto

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test:unit  # unitários
pnpm test:e2e   # Playwright (precisa do dev server no ar)
pnpm build      # build de produção
```

## Requisitos cobertos

[x] Exibir uma listagem inicial sem nenhum projeto cadastrado, conforme o design.
[x] Exibir o título da página e o total de projetos cadastrados.
[x] Implementar um filtro para exibir apenas os projetos favoritos.
[x] Ordenar por Ordem alfabética (padrão).
[x] Ordenar por Projetos iniciados mais recentemente.
[x] Ordenar por Projetos próximos à data de finalização.
[x] Página com o formulário de edição de projeto.
[x] Página com o formulário de criação de projeto.
[x] Modal de confirmação de remoção.
[x] Favoritar: Permitir favoritar/desfavoritar projetos.
[x] Implementar uma barra de busca onde o usuário pode digitar ao menos 3 caracteres para disparar a busca.
[x] (Opcional) Implementar um histórico das últimas 5 buscas recentes.
[x] (Opcional) Exibir um highlight no texto dos resultados que correspondam à busca.

## Informações gerais

- Decidi não usar uma API, então persisto os dados no localStorage e as imagens no IndexedDB.
- Criei e2e/journeys.spec.ts, que espelha as regras de negócio do projeto, e outros e2e que lidam com edge cases.
- Também criei testes de componente, funções auxiliares, stores, etc.

## Tradeoffs

- Como o Figma, por padrão, deixa a borda dentro do componente, precisei usar box-shadow inset para ter o mesmo tamanho dos botões do Figma.
- Mantive os projetos ordenados pelas datas, mesmo que já tenha passado a data de término.

## O que eu faria se tivesse mais tempo

- Cuidaria melhor da responsabilidade
- Melhoraria a organização dos estilos
- Adicionaria hover no componente de botão
- Arrumaria o bug visual quando se navega por tab até o último item do histórico
- Aumentaria a cobertura de testes

## O que eu faria se fosse um projeto real

- Conversaria com o UI para adicionar um fundo nas actions do card, porque em certas imagens fica ruim de ver;
- Conversaria com o UI para normalizar alguns espaçamentos, como o do botão grande, que tem 15px de padding-block. Poderia ser 16, por ser múltiplo de 8;
- Conversaria com o UI para normalizar estilos de texto, pois existem muitas combinações com diferentes font-size e line-height. Poderíamos diminuir essas variações e criar padrões de texto como "text-base" ou algo assim;
- Conversaria com o UI para criar estados vazios para a listagem de projetos quando não há resultados de filtragem e busca;
- Conversaria com o UI para resolver como lidar com projetos que já passaram da data;
- Conversaria com o UI para criar feedbacks visuais após criar/editar/deletar.
