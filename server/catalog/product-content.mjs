const photoMatches = new Map([
  ['ca-3a7a9ca9326e19e59e0908ef', [2]],
  ['ca-d66104d5212f35f00076d4d4', [3]],
  ['ca-70bc1bbc812144f790f56588', [12]],
  ['ca-6f9e18d466e6b6cafeaf1dbc', [36]],
  ['ca-1fea594842f20056902e8542', [11, 'Ice']],
  ['ca-ed95618816309f6ab9721aa1', [11, 'Ice']],
  ['ca-02c924ff1103d55249cf71c2', [11, 'Ice']],
  ['ca-16a5f241f56f0fa16ab09487', [17, 'Rosa']],
  ['ca-48da01df4fd59c3f17a8e128', [18, 'Dinos']],
  ['ca-edda80654ccbe8f5141f8d17', [18, 'Unicórnio']],
])

const productFamilies = [
  [/\bcanijet\b/, 'Acessórios', 'Ferramenta dobrável para retirar cabos e detritos presos na turbina do jet ski ou na hélice. Reúne um gancho e uma lâmina serrilhada na mesma peça.', { Marca: 'Âncora Alfa', Modelo: 'Canijet', Material: 'Aço inoxidável' }],
  [/\bancora alfa compact\b/, 'Âncoras', 'Kit de ancoragem para jet ski com âncora dobrável. A haste recolhe para facilitar o transporte e guardar a âncora no compartimento da embarcação.', { Marca: 'Âncora Alfa', Modelo: 'Compact' }],
  [/\bcoletes?\b.*\bhydro citrus\b/, 'Coletes', 'Colete náutico da linha Hydro Citrus da Prolife. Confira a cor e o tamanho do item ao escolher a opção.', { Marca: 'Prolife', Modelo: 'Hydro Citrus' }],
  [/\bcoletes?\b.*\bpro ?life\b.*\bn1\b/, 'Coletes', 'Colete náutico Prolife N1. Escolha o tamanho pela opção disponível e confira as medidas de ajuste com a Usina.', { Marca: 'Prolife', Modelo: 'N1' }],
  [/\bcolete\b.*\bpet aventura\b/, 'Coletes', 'Colete de flutuação para cães da linha Pet Aventura. Confira a cor e o tamanho na ficha antes de escolher.', { Modelo: 'Pet Aventura' }],
  [/\bcolete\b.*\binfantil\b.*\bpro ?life\b|\bcolete\b.*\bpro ?life\b.*\binfantil\b/, 'Coletes', 'Colete infantil Prolife para atividades na água. Confira a estampa e a faixa de peso indicada na etiqueta do modelo.', { Marca: 'Prolife' }],
  [/\bcalca slim 1 0 mm neo\b/, 'Roupas', 'Calça Johnn Brava da linha Neo, com corte slim e neoprene de 1 mm. Confira os tamanhos disponíveis na ficha.', { Marca: 'Johnn Brava', Modelo: 'Slim Neo', Espessura: '1 mm', Material: 'Neoprene' }],
  [/\bponcho atoalhado\b/, 'Roupas', 'Poncho atoalhado para se secar e facilitar a troca de roupa depois de sair da água.', { Marca: 'Johnn Brava' }],
  [/\baccuri 2\b/, 'Óculos', 'Óculos da linha Accuri 2 da 100% para pilotagem off-road. A espuma facial de três camadas ajuda a absorver o suor durante o uso.', { Marca: '100%', Modelo: 'Accuri 2' }],
  [/\bstrata 2\b.*\b(?:juvenil|mini|infantil)\b/, 'Óculos', 'Óculos Strata 2 em versão juvenil para pilotagem off-road. A versão infantil tem ajuste diferente da linha adulta.', { Marca: '100%', Modelo: 'Strata 2 Juvenil' }],
  [/\bstrata 2\b/, 'Óculos', 'Óculos da linha Strata 2 da 100% para motocross e mountain bike. A armação usa espuma facial e uma tira ajustável para encaixe no capacete.', { Marca: '100%', Modelo: 'Strata 2' }],
  [/\bstrata\b/, 'Óculos', 'Óculos da linha Strata da 100% para pilotagem off-road. Confira a versão e a cor da lente na ficha do produto.', { Marca: '100%', Modelo: 'Strata' }],
  [/\b(speedcraft|racetrap)\b/, 'Óculos', 'Óculos esportivos da 100% para ciclismo. Confira a cor e a configuração da lente na identificação do item.', { Marca: '100%' }],
  [/\boculos\b.*\b(erba|hakan|renshaw|slent)\b/, 'Óculos', 'Óculos da linha 100%. Veja o nome completo da versão para confirmar o acabamento da armação e a lente.', { Marca: '100%' }],
  [/\bluva\b.*\b(airmatic|exceeda|ridecamp|sling)\b/, 'Roupas', 'Luva esportiva da 100% para pilotagem. O tamanho e a cor disponíveis constam no nome ou na opção do produto.', { Marca: '100%' }],
  [/\bcapacetes?\b.*\bwraaap\b/, 'Equipamentos', 'Capacete off-road Airoh WRAAAP. A identificação do item indica o acabamento e a medida cadastrada.', { Marca: 'Airoh', Modelo: 'WRAAAP' }],
  [/\bbolsa (?:estanque|estaque)\b/, 'Acessórios', 'Bolsa estanque para organizar e transportar pertences nos passeios de jet ski. Confira a capacidade e as medidas indicadas para a versão selecionada.'],
  [/\bsapatilha water pro\b/, 'Roupas', 'Sapatilha para atividades aquáticas da linha Water Pro. Confira a cor e o tamanho na ficha.', { Modelo: 'Water Pro' }],
  [/\bkit cabo rebocador\b/, 'Acessórios', 'Kit de cabo para reboque ou atracação. Confira o comprimento indicado no nome do produto ou nas opções disponíveis.'],
  [/\bsuporte\b.*\b(?:camera insta|insta ?360)\b/, 'Acessórios', 'Suporte para câmera de ação Insta360 para uso em jet ski. Confirme o encaixe com a câmera e a moto aquática antes da compra.'],
  [/\bsuporte\b.*\b(?:copo|porta copo)\b/, 'Acessórios', 'Suporte para copo de jet ski. Confira a indicação de casco e de lado de instalação quando constar na identificação da peça.'],
  [/\bcapa sea doo nylon\b/, 'Acessórios', 'Capa de nylon para proteger o jet ski quando estiver fora de uso. Os modelos e o ano cadastrados constam no nome da peça.', { Material: 'Nylon' }],
  [/\bcamisa lycra pro ?life 703l\b/, 'Roupas', 'Camisa Prolife 703L de manga longa para atividades ao ar livre e esportes aquáticos. Consulte a tabela da marca para escolher o tamanho.', { Marca: 'Prolife', Modelo: '703L' }],
  [/\badaptador para kit de adocamento\b/, 'Acessórios', 'Adaptador para conectar o kit de adoçamento do jet ski. Confira o encaixe da peça com o seu kit.'],
  [/\bboia inflavel deck flutuante 244x244cm\b/, 'Acessórios', 'Deck inflável quadrado que forma uma plataforma flutuante para lazer. O modelo cadastrado tem 244 cm de lado.', { Formato: 'Quadrado', Dimensões: '244 × 244 cm' }],
  [/\bchave sea doo para codificar\b/, 'Acessórios', 'Chave Sea-Doo para programação no jet ski. Consulte o código de peça e a compatibilidade com o seu modelo.', { Marca: 'Sea-Doo' }],
  [/\bcold sak 15l duffle\b/, 'Acessórios', 'Bolsa térmica de 15 litros no formato duffle para levar bebidas e alimentos em passeios.', { Capacidade: '15 L' }],
  [/\bdefensa para jet ski alfa\b/, 'Acessórios', 'Defensa para usar na atracação do jet ski. Ajuda a reduzir o contato direto entre o casco e o atracadouro.'],
  [/\bfiltro de oleo\b.*\bsea doo 4t brp\b/, 'Acessórios', 'Filtro de óleo para manutenção de jet ski Sea-Doo de quatro tempos. Confirme o código da peça para o motor do seu modelo.', { Marca: 'BRP' }],
  [/\bblusa supreme de neoprene\b/, 'Roupas', 'Blusa de neoprene Johnn Brava da linha Supreme para esportes aquáticos.', { Marca: 'Johnn Brava', Modelo: 'Supreme', Material: 'Neoprene' }],
  [/\bjohnn brava lycra preta uv\b/, 'Roupas', 'Camiseta de lycra preta Johnn Brava para atividades na água e ao ar livre.', { Marca: 'Johnn Brava', Cor: 'Preta' }],
  [/\bjohnn brava sunga neo\b/, 'Roupas', 'Sunga Johnn Brava da linha Neo. A ficha mostra os tamanhos disponíveis para escolher.', { Marca: 'Johnn Brava', Linha: 'Neo' }],
  [/\bkit mascara oculos mergulho snorkel respirador\b/, 'Óculos', 'Conjunto com máscara de mergulho e snorkel para respiração na superfície.'],
  [/\btampa de acesso casco jet original sea doo\b/, 'Acessórios', 'Tampa para o ponto de acesso do casco de jet ski Sea-Doo. Confira as medidas e o código da peça para o seu modelo.', { Marca: 'Sea-Doo' }],
  [/\btanque externo com suporte jet cooler\b/, 'Acessórios', 'Tanque externo acompanhado de suporte da linha Jet Cooler. Confirme a capacidade e o encaixe com a Usina antes da compra.'],
]

const categoryPatterns = [
  [/\bcolete\b/, 'Coletes'],
  [/\b(?:calca|camisa|blusa|lycra|sunga|poncho|luva|sapatilha)\b/, 'Roupas'],
  [/\boculos\b/, 'Óculos'],
  [/\bancora\b/, 'Âncoras'],
  [/\b(?:capa|bolsa|suporte|filtro|chave|tampa|boia|cabo|cooler|tanque|defensa|adaptador)\b/, 'Acessórios'],
]

export function productContent(id, normalizedName, legacyById, normalize, options) {
  const [, category, description, specs] = productFamilies.find(([pattern]) => pattern.test(normalizedName)) ?? []
  const [photoId, color] = photoMatches.get(id) ?? []
  const source = legacyById.get(photoId)
  const hasMatchingColor = !color || options.every(option => normalize(option.label).split(' ').includes(normalize(color)))
  return {
    category: category ?? categoryPatterns.find(([pattern]) => pattern.test(normalizedName))?.[1],
    description,
    specs,
    images: hasMatchingColor ? (color ? source?.imagensPorCor?.[color] : source?.imagens) : undefined,
  }
}
