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
