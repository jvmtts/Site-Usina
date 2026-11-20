export interface Produto {
  id: number | string;
  sku?: string;
  opcoesEstoque?: { id: string; label: string; price: number }[];
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

export { produtos } from './produtos-base.mjs'
