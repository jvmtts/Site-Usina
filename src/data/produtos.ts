export interface Produto {
  id: number | string;
  aliases?: string[];
  sku?: string;
  opcoesEstoque?: { id: string; label: string; price: number | null; color?: string; size?: string; images?: string[] }[];
  nome: string;
  categoria: string | string[];
  preco: string | number | null;
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
