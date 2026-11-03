# React + TypeScript + Vite

## Expedição ativa: Monte Verde 2026

A Home abre a apresentação em `/expedicoes/monte-verde-2026`. Os botões de inscrição e **Garantir vaga** levam a `/expedicoes/monte-verde-2026/inscricao#formulario`. Os endereços antigos de Campos do Jordão redirecionam para o novo fluxo; Campos permanece no histórico das expedições realizadas.

O formulário foi integrado a partir de `Formulario-Campos/formulario-usina`, incluindo os acompanhantes, documentos, opções de veículo/locação e protocolo. Os dados e anexos são enviados ao Basin de Monte Verde já configurado nesse projeto.

### Configuração necessária na Vercel

A função `api/protocol.js` precisa acessar o **mesmo Redis do formulário de Monte Verde** para manter a numeração existente. No projeto Vercel do Site-Usina, conecte essa integração ou configure o mesmo par `KV_REST_API_URL` / `KV_REST_API_TOKEN` (alternativa: `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`). Mantenha os valores somente no servidor, sem prefixo `VITE_` e sem adicioná-los ao repositório.

Sem essa configuração, o formulário apresenta uma falha de protocolo e permite tentar novamente, sem enviar uma inscrição incompleta ao Basin. As variáveis do outro projeto Vercel não são transferidas ao copiar o código.

`npm run dev` disponibiliza o frontend, mas não a função Vercel. Para verificar a interface localmente, use esse comando. Para verificar o envio real, configure o servidor numa prévia Vercel. Evite envios reais de teste para não reservar números de protocolo nem cadastrar participantes fictícios.

### Verificação local

```bash
npm run build
node --test tests/protocol.test.js
```

A landing usa a arte, as datas (6 a 8 de novembro de 2026), o roteiro e os itens incluídos do folder. O pacote casal usa R$ 5.590,00, condição do Boat Show autorizada pelo responsável também para o site. O destaque da próxima expedição na página de expedições apresenta Monte Verde, com os mesmos dados e links para a landing e a inscrição. Não foram acrescentados horários ou atrações que não constam no material. Não há galeria de imagens de expedições anteriores na landing de Monte Verde.

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
