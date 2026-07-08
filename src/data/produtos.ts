export interface Produto {
  id: number;
  nome: string;
  categoria: string | string[];
  preco: string | number;
  descricao?: string;
  fichaTecnica?: Record<string, string>;
  imagens: string[];
  variacoes?: Record<string, string[]>;
  tamanhosPorCor?: Record<string, string[]>;
  lentesPorCor?: Record<string, string[]>;
  imagensPorCor?: Record<string, string[]>;
  linkwhatsapp?: string;
  linkWhatsapp?: string;
  linkMercadoLivre?: string;
  disponivel: boolean;
}

export const produtos: Produto[] = [
  {
    id: 1,
    nome: "Ancora Jet Ski Rocna / Alfa Inox 1,4 Kg Com Kit Completo",
    categoria: "Âncoras",
    preco: "R$ 699,99",
    descricao: "A Ancora Jet Ski Rocna / Alfa Inox 1,4 Kg Com Kit Completo é a escolha perfeita para os entusiastas de esportes aquáticos que procuram segurança e durabilidade. Fabricada pela renomada marca Alfa, esta âncora é feita de inox, um material conhecido pela sua resistência à corrosão e durabilidade, garantindo um produto de longa duração.\n\nCom um peso de 1,4 kg e dimensões de 43 cm de comprimento e 26 cm de largura, esta âncora é fácil de manusear e armazenar, tornando-a ideal para jet skis e pequenos barcos. O design do modelo ANCORA ALFA INOX JET BARCO é pensado para proporcionar uma fixação segura e eficiente, mesmo em condições de mar agitado.\n\nO kit completo que acompanha a âncora inclui tudo o que você precisa para uma instalação rápida e fácil. Assim, você pode passar menos tempo se preocupando com a preparação e mais tempo desfrutando do seu dia na água.",
    fichaTecnica: { "Marca": "Alfa", "Modelo": "Âncora Alfa Inox Jet Barco", "Comprimento x Largura": "43cm x 26cm" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_951867-MLB107475393946_032026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_908659-MLB107475393844_032026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_760449-MLB107476165652_032026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_953182-MLB107476105958_032026-F.webp"
    ],
    variacoes: { Cores: ["Prata"], Tamanho: ["Único"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/ancora-jet-ski-rocna--alfa-inox-14-kg-com-kit-completo/up/MLBU3832150354",
    disponivel: true
  },
  {
    id: 2,
    nome: "Canijet Limpeza Turbina Jet Ski Ferramenta Barco",
    categoria: ["Âncoras"],
    preco: "R$ 499,00",
    descricao: "Canijet Limpeza Turbina Jet Ski Ferramenta Barco - Alfa\n\nO Canijet entrega praticidade imediata para quem usa jet ski ou embarcações leves. Compacto, dobrável e resistente, ele reúne gancho de apoio e lâmina serrilhada em uma única ferramenta, ideal para ancoragem rápida, limpeza de turbina e cortes emergenciais.\n\nEspecificações Técnicas\nMaterial: aço inox\nFunções: gancho + lâmina serrilhada\nComprimento: 50 cm aberto / 26 cm fechado\nAplicação: jet skis e embarcações leves\nAcessório: cordão de segurança",
    fichaTecnica: { "Marca": "Âncora Alfa", "Modelo": "Canijet", "Material": "Aço inoxidável" },
    imagens: [
      "https://http2.mlstatic.com/D_Q_NP_945248-MLA101195518093_122025-F-canijet-limpeza-turbina-jet-ski-ferramenta-barco.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_989907-MLB108203910859_032026-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_890779-MLA101195556575_122025-F-canijet-limpeza-turbina-jet-ski-ferramenta-barco.webp"
    ],
    variacoes: { Cores: ["Prata"], Tamanhos: ["Único"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/canijet-limpeza-turbina-jet-ski-ferramenta-multiuso-barco-lancha-alfa/p/MLB63126890?pdp_filters=item_id%3AMLB6723034668",
    disponivel: true
  },
  {
    id: 3,
    nome: "Kit Jet - Âncora Alfa Compact Dobrável Em Inox - 1.4kg",
    categoria: ["Âncoras"],
    preco: "R$ 839,00",
    descricao: "Âncora Alfa de Inox 1.4kg Dobrável para Jet Ski - Leve, Prática e Inovadora\n\nCaracterísticas do Produto:\nDesign Dobrável: Facilita o armazenamento e transporte, tornando a âncora compacta e prática de carregar.\n\nMaterial de Alta Qualidade: Fabricada em aço inoxidável, garantindo resistência à corrosão e durabilidade em ambientes marítimos.\n\nPeso Leve (1.4kg): Equivalente a uma âncora Bruce de 4.0kg, mas com muito mais leveza e facilidade de manuseio.\n\nAlça Inovadora: Caso a âncora caia invertida, sua alça permite que ela se vire automaticamente ao ser puxada pelo cabo, garantindo uma ancoragem eficiente e rápida.\n\nVersatilidade: Ideal para Jet Skis, caiaques e barcos de até 15 pés, permitindo que você ancore em qualquer lugar com total segurança.",
    fichaTecnica: { "Peso": "1.4kg", "Marca": "Aço inoxidável" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_701051-MLA99853150699_112025-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_659977-MLA92473408866_092025-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_714235-MLA92473251938_092025-F.webp"
    ],
    variacoes: { Cores: ["Verde"], Tamanhos: ["Único"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/p/MLB45673805?pdp_filters=item_id:MLB4441737373&matt_tool=38524122#origin=share&sid=share&wid=MLB4441737373&action=whatsapp",
    disponivel: true
  },
  {
    id: 4,
    nome: "Colete Salva Vidas Prolife Hydro Black Edition",
    categoria: ["Coletes"],
    preco: "R$ 620,00",
    descricao: "O Colete Salva-Vidas Hydro Black Edition Prolife foi desenvolvido especialmente para a prática de atividades aquáticas e náuticas através do seu design tecnológico totalmente anatômico e focado no desempenho. É tão confortável que nem parece um colete!\nComo se não bastasse, ao contrário de outros modelos de coletes slim, o Hydro é Homologado pela Marinha do Brasil, garantindo a segurança e resistência habituais dos produtos Prolife.",
    fichaTecnica: { "Marca": "Prolife", "Modelo": "Hydro Black Edition", "Número de homologação da Marinha": "211.001/2020" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_953022-MLB101405017190_122025-F-colete-salva-vidas-prolife-hydro-black-edition.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_648011-MLB101405036988_122025-F-colete-salva-vidas-prolife-hydro-black-edition.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_733218-MLB101405036990_122025-F-colete-salva-vidas-prolife-hydro-black-edition.webp"
    ],
    variacoes: { Cores: ["Preto"], Tamanhos: ["EG"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-6079937674-colete-salva-vidas-prolife-hydro-black-edition-_JM",
    disponivel: false
  },
  {
    id: 5,
    nome: "Suporte Camera Insta360 E Gopro Jetski Seadoo Preto",
    categoria: "Acessórios",
    preco: "R$ 799,90",
    descricao: "NÃO INCLUI A CÂMERA E O BASTÃO!\n\nProduto Original JETXPLORER\n\nEncaixe perfeito em giro na plataforma do seu Seadoo, com sistema de vedação para que não entre água no seu jet com oring.\nTodos os parafusos de INOX, cabe bastão de 36mm de espessura e bastões de 25mm.\n\nO Suporte Traseiro Jetxplorer foi desenvolvido para garantir a melhor experiência na captura de imagens em esportes aquáticos com câmeras 360°. Este manual apresenta a instalação rápida, os cuidados essenciais e os diferenciais do produto, que é o primeiro suporte 100% nacional para câmeras Insta360 em motos aquáticas Seadoo.",
    fichaTecnica: { "Marca": "JetExplorer", "Modelo": "Suporte Insta 360/GoPro", "Tipo de Montagem": "Parafusado rosqueável, com parafusos e roscas do próprio jet ski"},
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_895057-MLB107475678494_032026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_647749-MLB108194571337_032026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_689987-MLB107476231286_032026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_795491-MLB108194574055_032026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_909442-MLB107475710070_032026-F.webp"
    ],
    variacoes: { Cores: ["Preto"], Tamanho: ["Único"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/suporte-camera-insta360-e-gopro-jetski-seadoo/up/MLBU3822108257?pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&search_layout=grid&position=18&type=product&tracking_id=f19ebfc6-223d-46db-a9da-c4a8a1bf6b09&wid=MLB4509104515&sid=search",
    disponivel: true
  },
  {
    id: 6,
    nome: "Óculos 100% Racetrap Espelhado Azul e Transparente",
    categoria: ["Acessórios"],
    preco: "R$ 519,00",
    descricao: "Óculos para Ciclismo 100% Racetrap Branco Azul Espelhado e Transparente UV400\n\nO óculos 100% Racetrap conta com uma composição de armação TR90 - altamente durável, leve e flexível, que favorece o caimento junto ao rosto e mantém a aerodinâmica elevada para encarar as estradas e trilhas com proteção, durabilidade e versatilidade, graças ao design que possibilita a troca de lentes.\n\nContando com um design que possibilita um campo de visão muito mais amplo, o Óculos de Ciclismo 100% Racetrap permite que a segurança seja muito superior, mesmo em terrenos mais acidentados e com maiores trepidações, graças aos nosepads (narigueiras) e pontas das hastes emborrachadas que favorecem a fixação junto ao rosto, mesmo sobre as cintas jugulares dos capacetes de ciclismo.\n\nAs lentes Ultra HD® em policarbonato favorecem a durabilidade e a resistência a impactos, além de visibilidade e durabilidade superiores com tratamentos antirrisco e filtro 100% ultravioleta. Com tratamentos oleofóbicos e hidrofóbicos, a capacidade de repelência à água e sujeiras é muito superior, garantindo nitidez única para encarar os mais variados terrenos.\n\nItens Inclusos:\n- 01 Óculos 100% Racetrap Branco\n- 01 Lente Azul Espelhada\n- 01 Lente Transparente\n- 02 Narigueiras extras\n- 01 Case Flanela\n- 01 Case rígido",
    fichaTecnica: { 
      "Marca": "100%", 
      "Modelo": "Racetrap",
      "Material da armação": "TR90",
      "Material da lente": "Policarbonato",
      "Tratamento da lente": "Espelhada",
      "Proteção UV": "Sim (UV400)",
      "Peso aproximado": "40g"
    },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_612521-MLA99459847920_112025-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_910508-MLU74123412919_012024-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_968145-MLU74163661087_012024-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_766056-MLU74022910112_012024-F.webp"
    ],
    variacoes: { 
      "Cores": ["Branco com Azul"] 
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/oculos-100-racetrap-espelhado-team-movistar-azul-d-bike/p/MLB27067983?pdp_filters=item_id%3AMLB4634196303",
    disponivel: true
  },
  {
    id: 7,
    nome: "Colete Salva Vidas Prolife Neoprene Protech Extreme",
    categoria: ["Coletes"],
    preco: "R$ 299,00",
    descricao: "Coletes Salva-Vidas Classe V Prolife são homologados pela Marinha do Brasil, garantindo a sua proteção por completo!\n\nUsado e aprovado pelos atletas profissionais patrocinados pela marca, o Colete Salva-Vidas Homologado Protech Extreme foi desenvolvido para garantir o melhor desempenho para quem não abre mão de ter um colete de altíssima qualidade sem restrições, que exceda seus limites com confiança e o conforto de saber que você está bem protegido.",
    fichaTecnica: { "Marca": "Prolife", "Modelo": "Neoprene Protech Extreme" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_635862-MLB101409358622_122025-F-colete-salva-vidas-prolife-neoprene-protech-extreme.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_905389-MLB101911101319_122025-F-colete-salva-vidas-prolife-neoprene-protech-extreme.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_910651-MLB101910902801_122025-F-colete-salva-vidas-prolife-neoprene-protech-extreme.webp"
    ],
    variacoes: { Cores: ["Selva"], Tamanhos: ["M"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-4375087621-colete-salva-vidas-prolife-neoprene-protech-extreme-_JM?searchVariation=188251816388&pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&searchVariation=188251816388&search_layout=grid&position=25&type=item&tracking_id=1a82fa58-f20b-47ef-aea6-8e0a6fabcec0",
    disponivel: true
  },
  {
    id: 8,
    nome: "Kit Cabo Rebocador Atracador 5m Âncora Alfa Náilon Verde Limão Jet Ski",
    categoria: ["Acessórios", "Âncoras"],
    preco: "R$ 189,00",
    descricao: "Kit Cabo Trançado + Boia de Isopor + Mosquetão\n\nAcompanha Boia Isopor, Mosquetão e Cabo Trançado 5,0 metros.\nKit compacto, montado, pronto para usar.\nIdeal para Jet Ski.\n\nCaracterísticas\nCabo Trançado: aproximadamente 4,8 metros\nBoia em Isopor Flutuadora\nMosquetão em Inox (um em cada ponta)\nComprimento total do Conjunto: 5,0 metros",
    fichaTecnica: { "Marca": "Âncora Alfa", "Material": "Náilon" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_907769-MLA100458101268_122025-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_929929-MLA100951917755_122025-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_612824-MLA100951580161_122025-F.webp"
    ],
    variacoes: { Cores: ["Verde Limão"], Tamanhos: ["Ùnico"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/kit-cabo-rebocador-atracador-5m-ncora-alfa-nailon-verde-limo-jet-ski/p/MLB63018198?pdp_filters=item_id:MLB4445402395",
    disponivel: true
  },
  {
    id: 9,
    nome: "Johnn Brava Camisa Lycra Manga Longa Com Proteção Uv Preta Plus Size",
    categoria: ["Roupas"],
    preco: "R$ 380,00",
    descricao: "Camisa Lycra Manga Longa com Proteção UV 50+ Slim Plus Size Masculina\n\nCamisa lycra de estilo moderno, com modelagem slim e corte reto, proporcionando ótimo caimento e visual jovem. Confeccionada em tecido encorpado, macio e confortável.\n\nPossui proteção UV 50+, sendo ideal para esportes e atividades ao ar livre com exposição ao sol. A composição em poliamida com elastano garante elasticidade, mobilidade e secagem rápida, mantendo o conforto térmico durante o uso.\n\nIndicada para náutica, corrida, academia, bike e atividades ao ar livre.",
    fichaTecnica: { "Marca": "Johnn Brava", "Tipo de Manga": "Longa" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_919335-MLB105826401086_022026-F-camisa-lycra-manga-longa-com-proteco-uv-preta-plus-size.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_733610-MLB105824401230_022026-F-camisa-lycra-manga-longa-com-proteco-uv-preta-plus-size.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_629102-MLB106679797323_022026-F-camisa-lycra-manga-longa-com-proteco-uv-preta-plus-size.webp"
    ],
    variacoes: { Cores: ["Preta"], Tamanhos: ["Plus S (XG)"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/camisa-lycra-manga-longa-com-protecao-uv-preta-plus-size/up/MLBU3766428111?pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&search_layout=grid&position=12&type=product&tracking_id=d850cf73-7a62-4fa7-8255-2dce81940168&wid=MLB6219140610&sid=search",
    disponivel: true
  },
  {
    id: 10,
    nome: "Johnn Brava Lycra Proteção Uv Capuz Preta",
    categoria: ["Roupas"],
    preco: "R$ 399,00",
    descricao: "Lycra com capuz masculina, moderna e sofisticada, com corte slim reto e alinhado, garantindo excelente caimento e conforto. Confeccionada em tecido encorpado, macio e tecnológico, ideal para atividades com exposição ao sol como náutica, corrida, academia e bike.\n\nPossui proteção UV 50+, oferecendo segurança contra os raios solares. Sua composição em poliamida com elastano proporciona secagem rápida, mobilidade e conforto térmico, mantendo a temperatura corporal equilibrada durante o uso.\n\nO capuz traz praticidade extra, auxiliando na fixação do boné durante a navegação e ajudando a manter o cabelo alinhado em atividades ao ar livre.",
    fichaTecnica: { "Marca": "Johnn Brava", "Tipo de Manga": "Longa" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_974026-MLB106861709287_022026-F-lycra-proteco-uv-capuz-preta.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_785891-MLB106234568224_022026-F-lycra-proteco-uv-capuz-preta.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_986011-MLB106234568368_022026-F-lycra-proteco-uv-capuz-preta.webp"
    ],
    variacoes: { Cores: ["Preto"], Tamanhos: ["P", "GG", "XG"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-4467503217-lycra-proteco-uv-capuz-preta-_JM?searchVariation=190334984752&pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&searchVariation=190334984752&search_layout=grid&position=1&type=item&tracking_id=f69ba915-4f09-41ae-865a-1d2f537f5434",
    disponivel: true
  },
  {
    id: 11,
    nome: "Colete Salva Vidas Prolife Hydro Citrus",
    categoria: ["Coletes"],
    preco: "R$ 529,00",
    descricao: "O Colete Salva-Vidas Hydro Citrus Prolife foi desenvolvido especialmente para a prática de atividades aquáticas e náuticas através do seu design tecnológico totalmente anatômico e focado no desempenho. É tão confortável que nem parece um colete!\n\nComo se não bastasse, ao contrário de outros modelos de coletes slim, o Hydro é Homologado pela Marinha do Brasil, garantindo a segurança e resistência habituais dos produtos Prolife.\n\nNo fim das contas, qual o sentido de abrir mão de diversão ou segurança se você pode ter os dois? Garanta ambos em uma única escolha.",
    fichaTecnica: { "Marca": "Prolife", "Modelo": "Hydro Citrus" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_979856-MLB101904931823_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_974368-MLB101904454565_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_990489-MLB101404144806_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp"
    ],
    variacoes: { Cores: ["Azul-Turquesa", "Grafite", "Ice"], Tamanhos: ["M", "EG", "G1"] },
    tamanhosPorCor: {
      "Azul-Turquesa": ["G1"],
      "Grafite": ["EG"],
      "Ice": ["M"]
    },
    imagensPorCor: {
      "Azul-Turquesa": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_974368-MLB101904454565_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_829792-MLB101404145728_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_881242-MLB101904553459_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp"
      ],
      "Grafite": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_990489-MLB101404144806_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_661895-MLB101403955410_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_896275-MLB101904552449_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp"
      ],
      "Ice": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_979856-MLB101904931823_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_603899-MLB101904554057_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_684983-MLB101402991014_122025-F-colete-salva-vidas-prolife-hydro-citrus.webp"
      ]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-6079949538-colete-salva-vidas-prolife-hydro-citrus-_JM?attributes=COLOR_SECONDARY_COLOR%3AQXp1bC10dXJxdWVzYQ%3D%3D&picker=true&searchVariation=194435909537&pdp_filters=seller_id%3A1378474553&quantity=1",
    disponivel: true
  },
  {
    id: 12,
    nome: "Colete Salva Vidas ProLife N1",
    categoria: ["Coletes"],
    preco: "R$ 199,00",
    descricao: "Os Coletes Salva-Vidas Classe V Prolife são homologados pela Marinha do Brasil, garantindo a sua proteção por completo!\n\nPara os fanáticos por água que buscam estilo, conforto e economia, o Colete Salva-Vidas Homologado N1 100% Nylon traz a clara escolha vencedora.\n\nComo se não bastasse, seu design exclusivo e altamente tecnológico proporciona ao usuário experiências fantásticas em qualquer atividade náutica ou aquática.",
    fichaTecnica: { "Marca": "Prolife", "Modelo": "N1" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_946647-MLB101407927500_122025-F-colete-salva-vidas-prolife-n1.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_841325-MLB101407977182_122025-F-colete-salva-vidas-prolife-n1.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_919423-MLB101407927498_122025-F-colete-salva-vidas-prolife-n1.webp"
    ],
    variacoes: { Cores: ["Preto"], Tamanhos: ["G1", "G2"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-6079955642-colete-salva-vidas-prolife-n1-_JM?searchVariation=194437148511&pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&searchVariation=194437148511&search_layout=grid&position=13&type=item&tracking_id=3dfc0ffa-95fd-4d95-a3b9-b180dab53239",
    disponivel: true
  },
  {
    id: 13,
    nome: "Johnn Brava Camisa Lycra Manga Longa Com Proteção Uv Preta Masculina",
    categoria: ["Roupas"],
    preco: "R$ 379,00",
    descricao: "Lycra Slim Reta – Estilo Moderno e Conforto\n\nLycra com corte slim reto e estilo moderno, trazendo um toque maori ao visual. Ideal para quem busca um look jovem, alinhado e descolado.\n\nFeita em tecido encorpado e macio, proporciona caimento confortável e liberdade de movimento. Perfeita para atividades como náutica, corrida, academia e bike, especialmente em exposição ao sol.\n\nDesenvolvida com tecido tecnológico UV 50+, garante proteção durante o uso. A composição em Poliamida e Elastano oferece secagem rápida e mantém a temperatura corporal, permitindo maior desempenho nas atividades.",
    fichaTecnica: { "Marca": "Johnn Brava", "Tipo de Manga": "Longa" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_652064-MLB106061157930_022026-F-camisa-lycra-manga-longa-com-proteco-uv-preta-masculina.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_849725-MLB106432362597_022026-F-camisa-lycra-manga-longa-com-proteco-uv-preta-masculina.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_997917-MLB105823106960_022026-F-camisa-lycra-manga-longa-com-proteco-uv-preta-masculina.webp"
    ],
    variacoes: { Cores: ["Preta"], Tamanhos: ["P", "M"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-6219947634-camisa-lycra-manga-longa-com-proteco-uv-preta-masculina-_JM?searchVariation=196653573869&pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&searchVariation=196653573869&search_layout=grid&position=8&type=item&tracking_id=deb29c58-6189-4065-9ad3-6bcba8523443",
    disponivel: true
  },
  {
    id: 14,
    nome: "Johnn Brava Camisa Lycra Manga Longa Com Proteção Uv Azul Masculina",
    categoria: ["Roupas"],
    preco: "R$ 379,00",
    descricao: "Eleve seu visual com esta Lycra de corte slim, que une a sofisticação do estilo moderno a um caimento impecável e alinhado. Desenvolvida para quem busca um look jovem e descolado, ela é fabricada com tecido tecnológico de Poliamida e Elastano, garantindo um toque macio, secagem ultra rápida e total liberdade de movimento.\n\nIdeal para náutica, corrida, bike e academia, o modelo conta com proteção UV 50+ para garantir sua segurança sob o sol. Sua estrutura de alta qualidade mantém a temperatura corporal estável e oferece o conforto necessário para as atividades mais intensas. Uma peça indispensável para quem exige tecnologia e estilo em um só produto.",
    fichaTecnica: { "Marca": "Johnn Brava", "Tipo de Manga": "Longa" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_856331-MLB106060094178_022026-F-camisa-lycra-manga-longa-com-proteco-uv-azul-masculina.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_643257-MLB106060124544_022026-F-camisa-lycra-manga-longa-com-proteco-uv-azul-masculina.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_989022-MLB106060124258_022026-F-camisa-lycra-manga-longa-com-proteco-uv-azul-masculina.webp"
    ],
    variacoes: { Cores: ["Azul"], Tamanhos: ["GG", "XG"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-6231075168-camisa-lycra-manga-longa-com-proteco-uv-azul-masculina-_JM?searchVariation=196805432305&pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&searchVariation=196805432305&search_layout=grid&position=10&type=item&tracking_id=fb921ca7-1f43-4164-942e-f4fcf1e55325",
    disponivel: true
  },
  {
    id: 15,
    nome: "Lycra Uc Com Capuz E Mascara Cinza Masculina",
    categoria: ["Roupas"],
    preco: "R$ 399,00",
    descricao: "A Lycra Masculina com Capuz e Máscara é a definição de estilo moderno e funcional. Possui corte slim reto, alinhado ao corpo, garantindo um visual jovem e sofisticado sem abrir mão do conforto. Confeccionada em tecido encorpado, com toque macio, oferece excelente caimento e liberdade de movimentos.\n\nDesenvolvida com tecnologia UV 50+ Protection, é ideal para atividades com exposição ao sol, como náutica, corrida, academia e ciclismo. Sua composição em poliamida com elastano proporciona alta elasticidade, respirabilidade e secagem rápida, ajudando a manter a temperatura corporal durante o uso.\n\nO capuz e a máscara (bala clave) integrados oferecem proteção extra contra sol, vento e respingos de chuva, trazendo mais praticidade e conforto para qualquer esporte ou aventura ao ar livre.",
    fichaTecnica: { "Marca": "Johnn Brava", "Tipo de Manga": "Longa" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_972556-MLB106680448959_022026-F-lycra-uc-com-capuz-e-mascara-cinza-masculina.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_703081-MLB106680507827_022026-F-lycra-uc-com-capuz-e-mascara-cinza-masculina.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_959574-MLB106679854927_022026-F-lycra-uc-com-capuz-e-mascara-cinza-masculina.webp"
    ],
    variacoes: { Cores: ["Cinza"], Tamanhos: ["M", "G"] },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-6231179202-lycra-uc-com-capuz-e-mascara-cinza-masculina-_JM?searchVariation=196805071227&pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&searchVariation=196805071227&search_layout=grid&position=5&type=item&tracking_id=943568a8-0143-44a8-90c8-419e84cfb2dc",
    disponivel: true
  },
  {
    id: 16,
    nome: "Kit Infantil De Mascara E Snorkel Bubbles Em Silicone Seasub Cor Azul",
    categoria: "Acessórios",
    preco: "R$ 249,99",
    descricao: "- Diversão e Conforto sob a Água: Kit Máscara e Snorkel SeaSub Bubbles\nTransforme a diversão na piscina ou no mar em uma verdadeira exploração! O Kit Bubbles da SeaSub é referência em qualidade, projetado especificamente para a anatomia das crianças, garantindo que nada atrapalhe a visão do mundo subaquático.\n\n- Por que escolher o Kit SeaSub Bubbles?\nConforto Superior (Silicone): Ao contrário dos modelos comuns de plástico/PVC, este kit é feito em Silicone, que é muito mais macio, não machuca o rosto e oferece uma vedação perfeita para não entrar água.\n\nHipoalergênico: O silicone é um material inerte e seguro, ideal para a pele sensível das crianças, evitando irritações.\n\nVisão Cristalina: Lentes de policarbonato de alta resistência que oferecem excelente visibilidade e segurança contra impactos.",
    fichaTecnica: { "Marca": "Seasub", "Idade": "Crianças" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_721736-MLA99535755400_122025-F-kit-infantil-mascara-e-snorkel-bubbles-em-silicone-cor-azul.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_806677-MLB107519713295_022026-F-kit-infantil-mascara-e-snorkel-bubbles-em-silicone-cor-azul.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_768169-MLA93509659541_092025-F-kit-infantil-mascara-e-snorkel-bubbles-em-silicone-cor-azul.webp"
    ],
    variacoes: { Cores: ["Azul"], Tamanhos: ["Único"] },
    linkWhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-4482558363-kit-infantil-mascara-e-snorkel-bubbles-em-silicone-cor-azul-_JM",
    disponivel: true
  },
  {
    id: 17,
    nome: "Colete Salva Vidas Pet Ativa Nautica Aventura Azul Claro",
    categoria: "Coletes",
    preco: "R$ 89,99",
    descricao: "🐾Segurança e Estilo: Colete Salva-Vidas Pet Ativa\nProteja seu melhor amigo em todas as aventuras na água! Seja na piscina, no mar ou em passeios de barco e jet ski, o Colete Ativa Pet garante flutuabilidade e total segurança para o seu cão.",
    fichaTecnica: { "Marca": "Aventura Naútica", "Modelo": "Colete Salva Vidas Aventura" },
    imagens: ["https://via.placeholder.com/600x600?text=Foto+Prod+15"],
    variacoes: { Cores: ["Rosa", "Azul-Claro"], Tamanhos: ["P", "PP"] },
    tamanhosPorCor: {
      "Rosa": ["P", "PP"],
      "Azul-Claro": ["P"],
    },
    imagensPorCor: {
      "Rosa": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_675711-MLB106842436230_022026-F-colete-salva-vidas-pet-ativa-nautica-aventura-azul-claro.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_863752-MLB106841201210_022026-F-colete-salva-vidas-pet-ativa-nautica-aventura-azul-claro.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_823627-MLA81873222180_012025-F-colete-salva-vidas-pet-ativa-nautica-aventura-azul-claro.webp"
      ],
      "Azul-Claro": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_646980-MLA99901846087_112025-F-colete-salva-vidas-pet-ativa-nautica-aventura-azul-claro.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_745323-MLB107515699017_022026-F-colete-salva-vidas-pet-ativa-nautica-aventura-azul-claro.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_823627-MLA81873222180_012025-F-colete-salva-vidas-pet-ativa-nautica-aventura-azul-claro.webp"
      ],
    },
    linkWhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-4482526247-colete-salva-vidas-pet-ativa-nautica-aventura-azul-claro-_JM?attributes=PATTERN_NAME%3ATGlzbw%3D%3D%2CCOLOR_SECONDARY_COLOR%3AUm9zYQ%3D%3D&picker=true&searchVariation=190532869952&pdp_filters=seller_id%3A1378474553&quantity=1",
    disponivel: true
  },
  {
    id: 18,
    nome: "Bóia Colete Salva Vidas Homologado Infantil Prolife Até 25kg",
    categoria: "Coletes",
    preco: "R$ 89,99",
    descricao: "Segurança e Diversão: Colete Salva-Vidas Infantil Homologado\nDê aos seus filhos a liberdade de brincar na água com a proteção que só um product Homologado pela Marinha do Brasil pode oferecer.",
    fichaTecnica: { "Marca": "Prolife", "Modelo": "Infantil" },
    imagens: ["https://via.placeholder.com/600x600?text=Foto+Prod+16"],
    variacoes: { Cores: ["Flamingo", "Bella", "Crazy Shark", "Crocoloco", "Dinos", "Ted Sideral", "Unicórnio"], Tamanhos: ["Único"] },
    imagensPorCor: {
      "Flamingo": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_904667-MLA99404958082_112025-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_624894-MLA96314786482_102025-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_954125-MLA106842812272_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp"
      ],
      "Bella": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_703960-MLB107518560631_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_821201-MLB107518560649_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_909675-MLB107517380325_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp"
      ],
      "Crazy Shark": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_951107-MLB106842252470_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_603363-MLB106844056698_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_764122-MLA107518893059_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp"
      ],
      "Crocoloco": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_814707-MLB107517349827_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_854123-MLB106842451622_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_809278-MLB106843400986_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp"
      ],
      "Dinos": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_716586-MLB107517681979_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_959848-MLB107517474615_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_821719-MLA106843565054_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp"
      ],
      "Ted Sideral": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_607488-MLB106842458062_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_892045-MLB106844085822_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_811406-MLA107519039277_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp"
      ],
      "Unicórnio": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_879423-MLB106842423856_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_977960-MLB106843373788_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_756279-MLA106843592100_022026-F-colete-salva-vidas-homologado-infantil-prolife-ate-25kg.webp"
      ]
    },
    linkWhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-4482629731-colete-salva-vidas-homologado-infantil-prolife-ate-25kg-_JM?searchVariation=197278975201&pdp_filters=seller_id%3A1378474553#polycard_client=search-desktop&searchVariation=197278975201&search_layout=grid&position=30&type=item&tracking_id=5f51a571-6d5b-433a-af64-ce1ff884b5a6",
    disponivel: true
  },
  {
    id: 19,
    nome: "Cinta Catraca Amarração De Carga Jet Skis e Motos",
    categoria: "Acessórios",
    preco: "R$ 39,99",
    descricao: "Cinta de Amarração com Catraca – 800kg | Jet Ski, Moto e Cargas\nSegurança máxima para o transporte do seu patrimônio.",
    fichaTecnica: { "Marca": "Malaysia Collection", "Capacidade": "Até 800kg", "Comprimento": "De 0,3m até 4,3m" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_694022-MLB106976576998_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_710204-MLB106976200830_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_904293-MLB107663105191_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_848660-MLB106976196648_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_697762-MLB106976226458_022026-F.webp"
    ],
    variacoes: { Cores: ["Preto"], Tamanhos: ["Único"] },
    linkWhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/cinta-catraca-amarracao-de-carga-jet-skis-e-motos-800kg-43m/up/MLBU3806780829",
    disponivel: true
  },
  {
    id: 20,
    nome: "Cinta De Elevação",
    categoria: "Acessórios",
    preco: "R$ 39,99",
    descricao: "Cinta de Elevação Sling 2 Toneladas – 1 Metro | Alta Resistência e Segurança\nPotência e confiabilidade para movimentação de cargas pesadas.",
    fichaTecnica: { "Marca": "Multifitas", "Comprimento x Largura": "1 m x 6 cm", "Capacidade": "2 Toneladas" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_965739-MLA99842164523_112025-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_737572-MLA81256457757_122024-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_751780-MLA106978357872_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_900160-MLA106978628084_022026-F.webp"
    ],
    variacoes: { Cores: ["Verde"], Tamanhos: ["Único"] },
    linkWhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/cinta-de-elevacao-2-toneladas-1-metro-60mm-fator-71-verde/up/MLBU3806860983",
    disponivel: true
  },
  {
    id: 21,
    nome: "Kit 4 Cintas de Amarração com Catraca – 800kg | 4,5 Metros",
    categoria: "Acessórios",
    preco: "R$ 69,99",
    descricao: "Este kit completo é a solução definitiva para quem precisa de máxima segurança e praticidade no transporte de cargas.",
    fichaTecnica: { "Marca": "Malaysia Collection", "Comprimento x Largura": "4,5 m x 2,5 cm", "Capacidade": "800kg" },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_617932-MLB107663266165_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_638137-MLB107663266167_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_770390-MLA107665638253_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_855801-MLA107666647643_022026-F.webp"
    ],
    variacoes: { Cores: ["Laranja"], Tamanhos: ["Único"] },
    linkWhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/kit-4-cinta-catraca-amarracao-carga-800kg-46-metros/up/MLBU3816813410",
    disponivel: true
  },
  {
    id: 22,
    nome: "Óculos 100% Strata 2 Motocross Azul Escuro Lente Vermelho Espelhado",
    categoria: "Acessórios",
    preco: "R$ 299,99",
    descricao: "Os óculos compartilham muitas das características de desempenho encontradas em óculos mais caros, mas por uma fração do custo.",
    fichaTecnica: { "Marca": "100%", "Modelo": "Strata" },
    imagens: ["https://http2.mlstatic.com/D_NQ_NP_2X_994966-MLA99906617273_112025-F-oculos-100-strata-2-motocross-lente.webp"],
    variacoes: { Cores: ["Azul Escuro", "Ciano", "Verde Limão", "Vermelho"], Lente: ["Vermelha Espelhada", "Cinza Espelhada", "Lilás Espelhada", "Vermelha Espelhada"] },
    lentesPorCor: {
      "Azul Escuro": ["Vermelha Espelhada"],
      "Ciano": ["Cinza Espelhada"],
      "Verde Limão": ["Lilás Espelhada"],
      "Vermelho": ["Vermelha Espelhada"]
    },
    imagensPorCor: {
      "Azul Escuro": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_994966-MLA99906617273_112025-F-oculos-100-strata-2-motocross-lente.webp",
        "https://images.tcdn.com.br/img/img_prod/340177/oculos_motocross_100_strata_2_navy_com_lente_espelhada_72864_2_542fb35ea5983940f68bd68ee93d048b_20250707123815.jpg",
        "https://http2.mlstatic.com/D_NQ_NP_2X_814183-MLA107595146219_022026-F-oculos-100-strata-2-motocross-lente.webp"
      ],
      "Ciano": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_630374-MLB106912952894_022026-F-oculos-100-strata-2-motocross-lente.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_795463-MLB107594728441_022026-F-oculos-100-strata-2-motocross-lente.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_668769-MLA106914093390_022026-F-oculos-100-strata-2-motocross-lente.webp"
      ],
      "Verde Limão": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_951139-MLB106914439164_022026-F-oculos-100-strata-2-motocross-lente-espelhada.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_905568-MLB89825301108_082025-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_973493-MLB106914649670_022026-F-oculos-100-strata-2-motocross-lente-espelhada.webp"
      ],
      "Vermelho": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_877164-MLB106912954276_022026-F-oculos-100-strata-2-motocross-lente-espelhada.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_985270-MLB106912924080_022026-F-oculos-100-strata-2-motocross-lente-espelhada.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_875247-MLB106914650676_022026-F-oculos-100-strata-2-motocross-lente-espelhada.webp"
      ]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-6294047044-oculos-100-strata-2-motocross-lente-espelhada-_JM?attributes=FRAME_COLOR%3AVmVyZGUtbGltw6Nv&quantity=1&picker=true",
    disponivel: true
  },
  {
    id: 23,
    nome: "Óculos 100% Armatic Espelhado",
    categoria: "Acessórios",
    preco: "R$ 620,00",
    descricao: "Domine as pistas e trilhas com a tecnologia de quem é líder mundial em proteção visual.",
    fichaTecnica: { "Marca": "100%", "Modelo": "Armatic" },
    imagens: ["https://http2.mlstatic.com/D_NQ_NP_2X_994966-MLA99906617273_112025-F-oculos-100-strata-2-motocross-lente.webp"],
    variacoes: { Cores: ["Branca", "Verde Limão"], Lente: ["Azul Espelhada", "Dourada Espelhada"] },
    lentesPorCor: {
      "Branca": ["Azul Espelhada"],
      "Verde Limão": ["Dourada Espelhada"],
    },
    imagensPorCor: {
      "Branca": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_820044-MLB106910254388_022026-F-oculos-100-armatic-espelhado.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_965547-MLB107590036057_022026-F-oculos-100-armatic-espelhado.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_677472-MLA106911800202_022026-F-oculos-100-armatic-espelhado.webp"
      ],
      "Verde Limão": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_970161-MLB107592655831_022026-F-oculos-100-armatic-espelhado.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_731036-MLB107590039003_022026-F-oculos-100-armatic-espelhado.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_834840-MLB106912070308_022026-F-oculos-100-armatic-espelhado.webp"
      ],
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://produto.mercadolivre.com.br/MLB-4484724593-oculos-100-armatic-espelhado-_JM?attributes=FRAME_COLOR%3AVmVyZGUtbGltw6Nv&quantity=1&picker=true",
    disponivel: true
  },
  {
    id: 24,
    nome: "Suporte Porta Copo Vara Linq Sea Doo Gti Gtr Wake Fishpro",
    categoria: "Acessórios",
    preco: "R$ 219,99",
    descricao: "O Suporte Porta-Copos e Vara Sea-Doo para plataforma GTI é um acessório original essencial para otimizar sua navegação, agora disponível na Usina do Jet.\n\nATENÇÃO\nNão acompanha porta varas e porta-copos, as imagens são ilustrativas. APENAS O SUPORTE.\n\nEscolha o LADO DIREITO ou ESQUERDO antes de finalizar a sua compra.\n\nEste componente serve como a base de montagem para o sistema de fixação rápida LinQ, permitindo que você instale porta-copos ou porta-varas com total segurança e agilidade durante o uso. É extremamente importante destacar que este anúncio contempla apenas o suporte de fixação, não acompanhando o porta-copos ou o porta-varas, itens que devem ser adquiridos de forma independente para completar o conjunto.\n\nAo escolher a Usina do Jet, você garante um produto original BRP de alta qualidade, fabricado em material resistente à exposição solar e ao ambiente salino. Este suporte foi projetado especificamente para modelos com o casco da linha GTI, sendo compatível com o Sea-Doo GTI, GTI SE, GTR e Wake 170 a partir do ano de 2020, além do Fish Pro Scout também de 2020 em diante.",
    fichaTecnica: { 
      "Marca": "Sea-Doo / BRP", 
      "Modelo": "LinQ GTI / GTR / Wake / Fishpro",
      "Compatibilidade": "Modelos 2020 em diante (Casco GTI)",
      "Código Esquerdo": "295101039",
      "Código Direito": "295101040"
    },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_600188-MLB110308048874_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_924339-MLB111238181607_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_786001-MLB110307962582_052026-F.webp"
    ],
    variacoes: { 
      "Cores": ["Direito", "Esquerdo"] 
    },
    imagensPorCor: {
      "Direito": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_600188-MLB110308048874_052026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_924339-MLB111238181607_052026-F.webp"
      ],
      "Esquerdo": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_859834-MLB111237704539_052026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_619137-MLB111237824231_052026-F.webp"
      ]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/suporte-porta-copo-vara-linq-sea-doo-gti-gtr-wake-fishpro/up/MLBU3948817958",
    disponivel: true
  },
  {
    id: 25,
    nome: "Suporte Porta Copo Vara Linq Sea Doo Gtx Rxtx Wake Fish Pro",
    categoria: "Acessórios",
    preco: "R$ 151,90",
    descricao: "O Suporte Porta-Copos e Vara Sea-Doo para casco ST3 é um acessório original projetado para oferecer máxima conveniência durante a sua navegação, disponível agora na Usina do Jet.\n\nATENÇÃO\nNão acompanha porta varas e porta-copos, as imagens são ilustrativas. APENAS O SUPORTE.\n\nEscolha o LADO DIREITO ou ESQUERDO antes de finalizar a sua compra.\n\nEste item é a base essencial para quem deseja utilizar os acessórios de fixação rápida LinQ, permitindo que você acople porta-copos ou porta-varas de forma segura e prática. É fundamental ressaltar que este anúncio se refere estritamente ao suporte de fixação, portanto, o porta-copos e o porta-varas não estão incluídos e devem ser adquiridos separadamente caso você ainda não os possua. Na Usina do Jet, priorizamos a qualidade e a procedência, oferecendo apenas componentes originais BRP fabricados em polímero de alta resistência contra raios UV e corrosão marinha.\n\nEm relação à compatibilidade técnica, este suporte foi desenvolvido exclusivamente para embarcações com plataforma de casco ST3, o que inclui os modelos Sea-Doo GTX, GTX Limited, RXT e RXT-X a partir do ano de 2018, além do Wake Pro 2018 em diante e o Fish Pro dos anos 2019 e 2020. Para garantir o encaixe perfeito em seu jet ski.",
    fichaTecnica: { 
      "Marca": "Sea-Doo / BRP", 
      "Modelo": "LinQ ST3",
      "Compatibilidade": "Casco ST3: GTX, RXT, RXT-X (2018+), Wake Pro (2018+), Fish Pro (2019-2020)"
    },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_888104-MLB110307962144_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_938927-MLB111237828347_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_897868-MLB111239429175_052026-F.webp"
    ],
    variacoes: { 
      "Cores": ["Direito", "Esquerdo"] 
    },
    imagensPorCor: {
      "Direito": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_888104-MLB110307962144_052026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_938927-MLB111237828347_052026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_897868-MLB111239429175_052026-F.webp"
      ],
      "Esquerdo": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_938927-MLB111237828347_052026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_746820-MLB110307903044_052026-F.webp"
      ]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/suporte-porta-copo-vara-linq-sea-doo-gtx-rxtx-wake-fish-pro/up/MLBU3948832600",
    disponivel: true
  },
  {
    id: 30,
    nome: "Óculos Casual 100% Hakan Soft Tact Black White Fade",
    categoria: ["Acessórios"],
    preco: "R$ 549,99",
    descricao: "Apresentando a tecnologia de lentes 100% para uma visão intransigente, os Óculos Casual 100% Hakan Soft Tact Black White Fade são o que você precisa para enfrentar os desafios diários com estilo e alto desempenho.\n\nPossui uma armação progressiva projetada para atender às suas necessidades em qualquer situação. Além de garantir a elegância, o modelo foca na segurança dos seus olhos através da tecnologia das lentes Ultra HD de policarbonato e do tratamento hidrofóbico e oleofóbico, que repele água e sujeira.\n\nO design conta ainda com nosepads emborrachados que garantem uma fixação precisa, impedindo que os óculos deslizem do rosto mesmo em movimento.",
    fichaTecnica: {
      "Marca": "100%",
      "Modelo": "Hakan Soft Tact",
      "Cor da Armação": "Black White Fade",
      "Lentes": "Hiper Blue Multilayer Mirror Lens",
      "Tratamento": "Hidrofóbico e Oleofóbico",
      "Peso Bruto": "0,150 Kg"
    },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_807053-MLA93874307162_102025-F.webp",
    ],
    variacoes: {
      "Cores": ["Black White Fade"]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/oculos-casual-100-hakan-soft-tact-black-white-fade/p/MLB27624872?pdp_filters=item_id%3AMLB6297567078",
    disponivel: true
  },
  {
    id: 31,
    nome: "Óculos Ciclismo 100% S3 Matte White",
    categoria: ["Acessórios"],
    preco: "R$ 729,00",
    descricao: "Apresentando nossa tecnologia de lentes 100% para visão intransigente, os Óculos Ciclismo 100% S3 Matte White são o que você precisa para enfrentar os desafios que um ciclista de alto nível encontra diariamente. Possui armação progressiva projetada para atender às suas necessidades de estilo e desempenho em qualquer situação.\n\nAlém de garantir o estilo e a elegância, o modelo S3 garante a segurança dos seus olhos, graças à tecnologia empregada nas lentes Ultra HD de policarbonato e ao tratamento hidrofóbico e oleofóbico (que repele água e sujeira). Por último, mas não menos importante, o nosepad garante que os óculos não caiam do seu rosto durante o pedal.\n\nItens Inclusos:\n- 1x Óculos 100% S3 Matte White\n- 1x Estojo Rígido\n- 1x Saco de Limpeza Microfibra\n- 1x Nosepad extra\n- 1x Lente de Substituição",
    fichaTecnica: {
      "Marca": "100%",
      "Modelo": "S3",
      "Cor da Armação": "Matte White",
      "Lentes": "Hiper Blue Multilayer Mirror Lens",
      "Tratamento": "Hidrofóbico e Oleofóbico",
      "Peso Bruto": "0,300 Kg"
    },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_745474-MLA95531619952_102025-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_600694-MLU74728735788_032024-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_621867-MLU74728735796_032024-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_887102-MLA109988615294_042026-F.webp"
    ],
    variacoes: {
      "Cores": ["Matte White"]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/oculos-ciclismo-100-s3-matte-white/p/MLB27780039?pdp_filters=item_id%3AMLB4493029827",
    disponivel: true
  },
{
    id: 32,
    nome: "Luva Motocross 100% Airmatic Amarela",
    categoria: ["Acessórios"],
    preco: "R$ 335,00",
    descricao: "O equilíbrio perfeito entre durabilidade, ventilação e ajuste. A luva 100% Airmatic foi projetada para oferecer o máximo conforto em todos os tipos de pilotagem. Com um design focado na ergonomia e no fluxo de ar, ela garante que você mantenha o controle total da sua moto ou bike, protegendo as mãos contra impactos e abrasão sem causar superaquecimento.\n\nConstruída com palma de camada dupla em Clarino® perfurado, ela oferece durabilidade extrema e reduz a formação de bolhas. O punho em Neoprene moldado garante um ajuste firme e seguro, enquanto os detalhes em TPR (borracha termoplástica) oferecem proteção extra contra impactos.\n\nEsta unidade específica possui acabamento em Amarelo com detalhes em preto, ideal para quem busca visibilidade e um estilo agressivo nas pistas.\n\nDestaques:\n- **Touchscreen Compatível:** Use celular ou GPS sem tirar as luvas.\n- **Reforço no Polegar:** Camada adicional para aumentar a vida útil.\n- **Microfibra de Alta Absorção:** Painéis Trek-Dry que absorvem suor.\n- **Fechamento Ajustável:** Velcro de alta qualidade.",
    fichaTecnica: {
      "Marca": "100%",
      "Modelo": "Airmatic",
      "Cor": "Amarela/Preta",
      "Tamanho": "G (Large)",
      "Uso": "Motocross, Enduro, MTB, Downhill e Trilhas",
      "Material": "Poliéster, Nylon, Elastano e Clarino®",
      "Proteção": "Borracha termoplástica (TPR)",
      "Recurso Extra": "Compatível com Touchscreen"
    },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_932890-MLA99422751710_112025-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_907368-MLB107052560936_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_823674-MLU71708768570_092023-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_616768-MLB109991193004_042026-F.webp"
    ],
    variacoes: {
      "Cores": ["Amarela"],
      "Tamanhos": ["G"]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/luva-motocross-100-airmatic-neoprene-tamanho-g/up/MLBU3818790238",
    disponivel: true
  },
 {
    id: 33,
    nome: "Poncho Atoalhado John Brava – Cinza Mescla",
    categoria: ["Roupas", "Acessórios"],
    preco: "R$ 359,99",
    descricao: "O Poncho Atoalhado John Brava é o acessório definitivo para quem vive dentro d'água. Seja após um dia intenso de Jet Ski, uma sessão de surf ou um mergulho na piscina, este poncho foi projetado para oferecer o máximo de praticidade, servindo como uma cabine de troca privativa e uma toalha de alta absorção em uma única peça.\n\nCom sua modelagem ampla e oversized, ele permite que você troque de roupa ou retire o traje de neoprene com total discrição em locais públicos. Além disso, o tecido atoalhado de alta qualidade protege contra o vento e mantém o corpo aquecido logo após a saída da água, contando ainda com um capuz anatômico para auxiliar na secagem do cabelo.\n\nPrincipais diferenciais:\n- **Privacidade Total:** Troque de roupa em qualquer lugar com discrição.\n- **Conforto Térmico:** Protege contra o vento pós-navegação.\n- **Tamanho Único Versátil:** Projetado para vestir do P ao G3 (Plus Size).\n- **Estilo Premium:** Acabamento exclusivo com a marca John Brava.",
    fichaTecnica: {
      "Marca": "Johnn Brava",
      "Modelo": "Poncho Surf/Praia Atoalhado",
      "Idade": "Adultos",
      "Gênero": "Sem gênero",
      "Cor": "Cinza",
      "Desenho do tecido": "Lisa",
      "Temporada de lançamento": "Primavera/Verão"
    },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_723561-MLB107744057983_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_997726-MLB107053899390_022026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_694642-MLA107746115439_022026-F.webp"
    ],
    variacoes: {
      "Cores": ["Cinza Mescla"],
      "Tamanhos": ["Único"]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/poncho-surfpraia-atoalhado-unissex/up/MLBU3809201337",
    disponivel: true
  },
  {
    id: 35,
    nome: "Colete Salva-Vidas Prolife Hydro",
    categoria: ["Coletes"],
    preco: "R$ 529,00",
    descricao: "O Colete Salva-Vidas Hydro Citrus Prolife foi desenvolvido especialmente para a prática de atividades aquáticas e náuticas através do seu design tecnológico totalmente anatômico e focado no desempenho. É tão confortável que nem parece um colete!\n\nComo se não bastasse, ao contrário de outros modelos de coletes slim, o Hydro é Homologado pela Marinha do Brasil (Classe V), garantindo a segurança e resistência habituais dos produtos Prolife.\n\nNo fim das contas, qual o sentido de abrir mão de diversão ou segurança se você pode ter os dois? Garanta ambos em uma única escolha.\n\n**USINA DO JET**\nSomos especializados em oferecer produtos de qualidade, com total compromisso com a segurança, a procedência e a satisfação dos nossos clientes. Nossa equipe está sempre pronta para auxiliar, esclarecer dúvidas e garantir uma experiência de compra tranquila e confiável. Agradecemos a sua preferência e confiança. É um prazer atender você!",
    fichaTecnica: {
      "Marca": "Prolife",
      "Modelo": "Hydro",
      "Certificação": "Homologado pela Marinha do Brasil (Classe V)",
      "Material Principal": "Neoprene Premium",
      "Indicação": "Jet Ski, Wakeboard, Stand-up, Caiaque e Lazer Náutico",
      "Design": "Anatômico / Slim com Zipper YKK e Trava Rápida"
    },
    imagens: [],
    imagensPorCor: {
      "Deepline": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_624339-MLB110120421772_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_805738-MLB111038668291_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_831020-MLB111037455419_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_807575-MLB111037989371_042026-F.webp"
      ],
      "Ice": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_741276-MLB110120522100_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_798688-MLB111038768275_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_815142-MLB110121466084_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_962985-MLB111038678731_042026-F.webp"
      ],
      "Purple": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_856641-MLB111038708473_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_714325-MLB111038411033_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_942118-MLB111037613881_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_636242-MLB110119603254_042026-F.webp"
      ],
      "Sand Blue": [
        "https://http2.mlstatic.com/D_NQ_NP_2X_781698-MLB110119721566_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_823628-MLB111038410199_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_663259-MLB111038707547_042026-F.webp",
        "https://http2.mlstatic.com/D_NQ_NP_2X_822654-MLB110119602402_042026-F.webp" 
      ]
    },
    tamanhosPorCor: {
      "Deepline": ["G1", "G2", "M"],
      "Ice": ["G1", "G2", "M"],
      "Purple": ["G1", "G2", "M"],
      "Sand Blue": ["G1", "G2", "M"],
    },
    variacoes: {
      "Cor": ["Deepline", "Ice", "Purple", "Sand Blue"],
      "Tamanho": ["G1", "G2", "M"],
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/colete-salva-vidas-prolife-hydro-citrus/up/MLBU3936274546",
    disponivel: true
  },
  {
    id: 36,
    nome: "Calça Neoprene John Brava Slim 1.0mm Neo Masculina",
    categoria: ["Roupas"],
    preco: "R$ 618,00",
    descricao: "Maximize sua performance e conforto na água com a Calça Neoprene John Brava Slim 1.0mm Neo, agora disponível na Usina do Jet. Este modelo foi desenvolvido para atletas e entusiastas do mundo náutico que buscam uma peça de alta tecnologia, oferecendo a proteção térmica ideal para dias de sol e ventos constantes sem comprometer a agilidade.\n\nA tecnologia Neo 1.0mm utiliza neoprene de última geração com alta capacidade de elasticidade, garantindo um ajuste anatômico perfeito ao corpo. Isso evita o \"arrasto\" na água e proporciona uma sensação de segunda pele, sendo ideal para pilotagem de jet ski, surf ou qualquer esporte que exija mobilidade total.\n\nNa Usina do Jet, priorizamos marcas que entregam durabilidade extrema, e a John Brava se destaca com suas costuras Flatlock reforçadas. Esse acabamento evita irritações na pele mesmo em usos prolongados, enquanto a proteção UV integrada garante que sua pele esteja segura contra a radiação solar durante todo o dia de lazer.\n\nCompre com a confiança de quem é especialista no setor náutico: a equipe da Usina do Jet garante a procedência original de todos os nossos itens John Brava. Oferecemos suporte técnico completo para ajudar você a escolher o tamanho ideal e garantir que seu equipamento chegue rápido e pronto para a próxima aventura.",
    fichaTecnica: {
      "Marca": "John Brava",
      "Modelo": "Slim 1.0mm Neo",
      "Espessura": "1.0mm",
      "Gênero": "Masculino",
      "Material": "Neoprene de última geração",
      "Costura": "Flatlock reforçada",
      "Proteção": "UV integrada",
      "Indicação": "Jet Ski, Surf e Esportes Aquáticos"
    },
    imagens: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_745584-MLB111282901917_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_637216-MLB110349929306_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_657627-MLB110349898568_052026-F.webp"
    ],
    variacoes: {
      "Cor": ["Preta"],
      "Tamanho": ["M", "G", "EG"]
    },
    linkwhatsapp: "https://wa.me/5511964467000",
    linkMercadoLivre: "https://www.mercadolivre.com.br/calca-neoprene-john-brava-slim-10mm-neo-masculina-original/up/MLBU3950226240",
    disponivel: true
  }
];