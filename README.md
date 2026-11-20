# React + TypeScript + Vite

## Próxima expedição: Serra Negra

A Home e a página de expedições levam a `/expedicoes/serra-negra`. A data e o roteiro aguardam confirmação. Os botões **Garantir vaga** abrem o WhatsApp da Usina com mensagem de interesse em Serra Negra. Monte Verde está entre as expedições realizadas com a arte oficial e sem galeria; os endereços antigos da edição levam ao seu registro no histórico.

## Formulário arquivado: Monte Verde 2026

As rotas antigas levam ao histórico de Monte Verde. O código do formulário foi preservado como referência e a API de protocolo e seus testes foram movidos para `archive/monte-verde-2026/`, fora da pasta `api/` que a Vercel usa para publicar funções. A publicação atual não precisa de Redis nem de configuração do Basin.

### Verificação local

```bash
npm run build
node --test archive/monte-verde-2026/tests/protocol.test.js
```

Os testes da API arquivada simulam o Redis; não fazem inscrições reais.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Estoque do Conta Azul na Vercel

A Home, o catálogo e os links diretos usam a mesma coleta. Só aparecem produtos
ativos com preço e saldo disponível confirmados. Se uma coleta falhar, a vitrine
usa a última coleta completa por até 45 minutos a partir do início dessa coleta.
Depois desse prazo, os produtos são ocultados até uma nova coleta válida.

### Configuração inicial

1. No projeto da Vercel, conecte um banco Redis da Upstash para a vitrine. Configure
   as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` com os valores
   de leitura e escrita do banco. Use a URL HTTPS de REST, sem barra no fim.
2. Defina `CATALOG_ORIGIN` com o endereço HTTPS em que você vai acessar a vitrine,
   sem barra no fim. Gere dois valores diferentes com o comando abaixo. Configure
   um em `CATALOG_ADMIN_KEY` e outro em `CATALOG_ENCRYPTION_KEY`. Guarde a chave
   administrativa para entrar na tela. A chave de criptografia fica no servidor.
   Configure as variáveis como sensíveis no ambiente de produção da Vercel.

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

3. Depois de disponibilizar o projeto na Vercel, abra `/api/catalogo-admin` no
   domínio configurado e entre com a chave administrativa.
4. Na tela **Estoque da Usina do Jet**, copie a **URL de retorno** e salve esse
   endereço no aplicativo **Vitrine Usina do Jet**, no Portal do Desenvolvedor
   do Conta Azul. Volte à tela de estoque, preencha **Client ID** e **Client
   Secret** e clique em **Salvar credenciais**.
5. Clique em **Autorizar Conta Azul**, entre com a empresa da Usina e confirme.
   Na volta, confira **Empresa conectada**. Clique em **Sincronizar estoque** e
   aguarde a contagem da primeira coleta. O servidor recebe e renova os tokens.

Use o aplicativo do Conta Azul criado para a vitrine. O valor opcional
`CATALOG_EMPRESA_CNPJ` restringe o cadastro à empresa indicada. Separe as
variáveis e o namespace (`CATALOG_NAMESPACE`) de produção e de qualquer ambiente
de teste que use o mesmo Redis. Mantenha a chave de criptografia entre deploys;
a troca dessa chave exige migrar ou limpar as credenciais salvas e reautorizar.

O relatório lista os vínculos, produtos sem foto e pendências. Para confirmar
vínculos, `CATALOG_CONTAAZUL_BINDINGS` aceita um objeto JSON com os IDs do site
como chaves e os IDs do Conta Azul como valores. As fotos e links de produtos
vinculados são reaproveitados.

### Prévia na Vercel

As variáveis do painel podem ser configuradas só para a branch de prévia.
Quando a Vercel fornece o endereço da branch, o painel o usa como origem da
prévia e exibe a URL de retorno correspondente. O armazenamento usa um
namespace próprio da branch e também aceita os nomes
KV_REST_API_URL e KV_REST_API_TOKEN injetados pela integração Redis.

### Atualização automática

O Vercel Schedules chama a função privada `api/catalogo-agendado` a cada 15 minutos
em produção. O plano Hobby pode distribuir as execuções dentro de janelas de
15 minutos. Confirme pelo horário da última coleta no painel.

Se precisar usar um agendador externo, configure `CRON_SECRET` e envie
`Authorization: Bearer` com essa chave nas chamadas a `/api/catalogo-sync`.

Para testar a conexão antes de promover um deploy de produção, use um deploy
em espera com Vercel Authentication e `CATALOG_STAGED_ADMIN=1`. Nesse deploy,
o painel também aceita a URL gerada pela Vercel e mostra o retorno OAuth
correspondente. Depois de promover, cadastre no Conta Azul a URL oficial de
retorno para as próximas autorizações e remova a variável de configuração
temporária dos futuros deploys.

### Testes locais

A prévia local do estoque continua disponível para testes. O comando
`npm run estoque:previa` lê um token temporário em entrada oculta e grava
a última coleta na pasta ignorada `.catalogo-local`. Rode `npm run dev` para
visualizar a coleta no computador. Se a pasta estiver vazia, o modo de
desenvolvimento mostra o catálogo de demonstração.

Para testar autorização, expiração e atualização sem credenciais reais:

    npm run test:catalog
    npm run build
