const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])

const notes = {
  saved: 'Credenciais salvas. Agora autorize o Conta Azul.',
  connected: 'Autorização salva. Confira a empresa e clique em Sincronizar estoque.',
  updated: 'Estoque sincronizado.',
  bad_key: 'Chave administrativa inválida.',
  invalid: 'Solicitação inválida ou expirada. Inicie novamente.',
  busy: 'Uma operação já está em andamento. Aguarde e recarregue a página.',
  secret_required: 'Informe o Client Secret do aplicativo.',
  disconnected: 'Autorize o Conta Azul antes da primeira coleta.',
  authorization_failed: 'O Conta Azul não concluiu a autorização. Confira as credenciais e a URL de retorno.',
  wrong_company: 'A empresa autorizada não corresponde ao cadastro desta vitrine.',
  sync_failed: 'A coleta falhou. Consulte o status abaixo.',
}

export const secureHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self' https://login.contaazul.com; base-uri 'none'; frame-ancestors 'none'",
}

const layout = `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estoque da Usina do Jet</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#100f0e;color:#fffaf4;font:16px/1.5 system-ui,sans-serif}
main{width:min(100% - 2rem,46rem);margin:clamp(2rem,8vw,5rem) auto}h1,h2,p{margin-top:0}
h1{font-size:clamp(2rem,6vw,3.5rem);line-height:1.05;letter-spacing:-.045em}
h2{font-size:1.3rem}section{margin:1rem 0;padding:clamp(1rem,4vw,1.7rem);border-radius:.75rem;background:#211f1d;border:1px solid #55504a}
form{display:grid;gap:.5rem}input,button{min-height:2.8rem;border-radius:.35rem;padding:.65rem .85rem;font:inherit}input{width:100%;min-width:0;color:#fffaf4;background:#151412;border:1px solid #8a827a}
label{font-weight:650;margin-top:.25rem}button{width:max-content;max-width:100%;font-weight:700;background:#ff8a37;color:#160a00;border:1px solid transparent;cursor:pointer}
button.secondary{background:transparent;border-color:#8a827a;color:inherit}button:disabled{opacity:.55;cursor:default}
:focus-visible{outline:3px solid #ffba88;outline-offset:3px}.notice{padding:1rem;border-left:3px solid #ff8a37;background:#29241e}
.actions{display:flex;gap:.6rem;flex-wrap:wrap;margin:.9rem 0}code{overflow-wrap:anywhere}small{color:#dfd4c7}
ul{padding-left:1.3rem}a{color:#ffad71}summary{cursor:pointer}dd{margin:0 0 .6rem}
</style><body><main><h1>Estoque da Usina do Jet</h1>`

function button(value, label, { secondary = false, disabled = false } = {}) {
  return '<button name="action" value="' + value + '"' + (secondary ? ' class="secondary"' : '') +
    (disabled ? ' disabled' : '') + '>' + label + '</button>'
}

function dateLabel(value, unavailable = 'Aguardando primeira coleta') {
  return value ? new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
  }).format(new Date(value)) : unavailable
}

function reportList(title, records) {
  if (!records?.length) return ''
  return '<details><summary>' + title + ' (' + records.length + ')</summary><ul>' +
    records.slice(0, 100).map(row => '<li>' + esc(row.name) +
      (row.sku ? ' · SKU ' + esc(row.sku) : '') + (row.reason ? ' · ' + esc(row.reason) : '') + '</li>').join('') +
    '</ul>' + (records.length > 100 ? '<p>Mostrando os primeiros 100 itens.</p>' : '') + '</details>'
}

function integrationScreen(status, redirectUri) {
  const report = status.snapshot?.report
  const sync = status.sync
  return '<section><h2>Aplicativo do Conta Azul</h2><p>Cadastre esta URL de retorno no aplicativo da vitrine.</p><p><code>' +
    esc(redirectUri) + '</code></p><form method="post" action="/api/catalogo-admin">' +
    '<label for="id">Client ID</label><input id="id" name="clientId" required maxlength="200" autocomplete="off" value="' +
    esc(status.clientId) + '"><label for="secret">Client Secret</label>' +
    '<input id="secret" name="clientSecret" type="password" maxlength="300" autocomplete="new-password">' +
    (status.clientId ? '<small>Deixe em branco para manter o segredo salvo quando o Client ID for o mesmo.</small>' : '') +
    button('save', 'Salvar credenciais') + '</form></section><section><h2>Autorizar e sincronizar</h2>' +
    '<dl><dt>Empresa conectada</dt><dd>' + esc(status.company || 'Aguardando autorização') +
    '</dd><dt>Última coleta completa</dt><dd>' + esc(dateLabel(status.snapshot?.updatedAt)) + '</dd></dl>' +
    (sync?.state === 'running' && Date.now() - Date.parse(sync.attempt) < 330_000 ? '<p>Coleta em andamento. Atualize a página para acompanhar.</p>' : '') +
    (sync?.state === 'failed' ? '<p role="status">' + esc(sync.message) + '</p>' : '') +
    '<form class="actions" method="post" action="/api/catalogo-admin">' +
    button('authorize', 'Autorizar Conta Azul', { disabled: !status.clientId }) +
    button('sync', 'Sincronizar estoque', { disabled: !status.connected }) + '</form>' +
    (report ? '<p><strong>' + esc(report.published) + '</strong> publicados de ' + esc(report.received) +
      ' cadastros ativos. ' + esc(report.linked) + ' vínculos com o site.</p>' +
      (typeof report.examined === 'number' ? '<p>Produtos principais consultados: ' + esc(report.examined) + '.</p>' : '') +
      (report.erpPhotos ? '<p>Fotos do Conta Azul: ' + esc(report.erpPhotos.downloaded + report.erpPhotos.reused) +
        ' utilizadas de ' + esc(report.erpPhotos.candidates) + ' analisadas.</p>' : '') +
      reportList('Preços a preencher', report.withoutPrice) +
      reportList('Produtos em revisão', report.review) + reportList('Produtos sem foto', report.withoutPhoto) +
      reportList('Produtos sem descrição confirmada', report.withoutDescription) +
      reportList('Produtos do site sem vínculo', report.unmatchedLocal) : '') +
    '</section><form method="post" action="/api/catalogo-admin">' + button('logout', 'Sair', { secondary: true }) + '</form>'
}

export function adminPage({ status, redirectUri, notice, unavailable } = {}) {
  const body = unavailable
    ? '<p>Esta área estará disponível quando o armazenamento e as chaves do catálogo forem configurados na Vercel.</p>'
    : status ? integrationScreen(status, redirectUri)
      : '<section><h2>Acesso administrativo</h2><form method="post" action="/api/catalogo-admin">' +
        '<label for="key">Chave administrativa da vitrine</label><input id="key" name="key" type="password" required maxlength="128" autocomplete="current-password">' +
        button('login', 'Entrar') + '</form></section>'
  return new Response(layout + (Object.hasOwn(notes, notice) ? '<p class="notice" role="status">' + notes[notice] + '</p>' : '') +
    body + '</main></body></html>', {
    status: unavailable ? 503 : 200,
    headers: { ...secureHeaders, 'Referrer-Policy': 'same-origin', 'Content-Type': 'text/html; charset=utf-8' },
  })
}
