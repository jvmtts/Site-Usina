export interface Patrocinador {
  id: string | number
  nome: string
  logo?: string
  link: string
  ativo: boolean
}

const BRAND_ASSET_PATH = '/images/marcas'

export const patrocinadores: Patrocinador[] = [
  {
    id: 1,
    nome: 'Casarini',
    logo: `${BRAND_ASSET_PATH}/1.png`,
    link: '',
    ativo: true,
  },
  {
    id: 2,
    nome: 'BicaJet.com',
    logo: `${BRAND_ASSET_PATH}/2.png`,
    link: '#',
    ativo: true,
  },
  {
    id: 3,
    nome: 'Pro Life',
    logo: `${BRAND_ASSET_PATH}/3.png`,
    link: '#',
    ativo: true,
  },
  {
    id: 4,
    nome: 'SAC Seguros Corretora',
    logo: `${BRAND_ASSET_PATH}/4.png`,
    link: '#',
    ativo: true,
  },
  {
    id: 5,
    nome: 'RSAT Car',
    logo: `${BRAND_ASSET_PATH}/5.png`,
    link: '#',
    ativo: true,
  },
]
