# Contas da loja

1. No Supabase, aplique a migração `supabase/migrations/20261126203000_loja_contas.sql` e deixe o esquema `public` disponível na Data API. A migração já limita o acesso às linhas do próprio cliente e deixa os pedidos em leitura para a conta.
2. Em **Authentication → Sign In / Providers → Email**, habilite cadastro por e-mail e confirmação de e-mail. Configure um SMTP de envio, com remetente autorizado. Em **URL Configuration**, configure o domínio em **Site URL** e autorize a URL exata `https://www.usinadojet.com.br/conta/confirmar` em **Redirect URLs**. Para testar em outra origem, autorize também a URL exata daquele ambiente, como `http://localhost:5173/conta/confirmar`. Use um projeto Supabase separado para testes.
3. Nos modelos de e-mail abaixo, mantenha o fragmento `#token_hash=...`. Desative o rastreamento de cliques do SMTP para esses e-mails.

**Confirm signup**

```html
<p>Confirme seu cadastro na loja da Usina do Jet.</p>
<p><a href="{{ .RedirectTo }}#token_hash={{ .TokenHash }}&amp;type=email">Confirmar e-mail</a></p>
```

**Reset password**

```html
<p>Use o link abaixo para criar uma nova senha para sua conta.</p>
<p><a href="{{ .RedirectTo }}#token_hash={{ .TokenHash }}&amp;type=recovery">Redefinir senha</a></p>
```

4. Configure as duas variáveis em `.env.local` para desenvolvimento, ou no ambiente do projeto na Vercel.

```dotenv
LOJA_SUPABASE_URL=https://SEU-PROJETO.supabase.co
LOJA_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Com a configuração preenchida, abra o site pelo domínio HTTPS ou pela URL local de loopback. Confirme uma conta de teste pelo link real, entre de novo em outro navegador e confira a sincronização do carrinho e dos favoritos. Salve dois endereços para testar a troca e a remoção do padrão. Solicite também um e-mail de recuperação e teste o acesso com a nova senha.

Execute `npm run test:shop` para testar o contrato da API sem o Supabase. O histórico depende de registros em `shop_orders`; a integração que cria pedidos ainda precisa ser conectada.

[Modelos de e-mail do Supabase](https://supabase.com/docs/guides/auth/auth-email-templates) · [SMTP personalizado](https://supabase.com/docs/guides/auth/auth-smtp)


## Entrar com Google

1. No Google Auth Platform, crie um cliente OAuth do tipo **Aplicativo da Web**. Na lista de URIs de redirecionamento do Google, adicione a URL de callback exibida pelo provedor Google no Supabase, no formato `https://SEU-PROJETO.supabase.co/auth/v1/callback`.
2. Em **Authentication → Sign In / Providers → Google**, habilite o provedor e salve o Client ID e o Client Secret no Supabase.
3. Em **Authentication → URL Configuration**, inclua o endereço exato do ambiente seguido de `/api/loja` em **Redirect URLs**. Use, por exemplo, `http://localhost:5173/api/loja` ou `https://site-usina-khaki.vercel.app/api/loja`.
4. Defina `LOJA_GOOGLE_LOGIN=true` no ambiente correspondente. Reinicie o Vite ou gere um novo deploy na Vercel para ativar o botão.

Se o aplicativo Google estiver em modo de teste, adicione as contas de teste antes de entrar pela vitrine.

[Configuração do Google no Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
