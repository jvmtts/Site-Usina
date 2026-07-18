// src/data/patrocinadores.ts

export interface Patrocinador {
  id: string | number;
  nome: string;
  logo?: string; // Opcional
  link: string;
  ativo: boolean;
}

// Aqui você pode colocar os dados reais dos seus parceiros depois
export const patrocinadores: Patrocinador[] = [
  { id: 1, nome: 'Marca 1', link: '', ativo: true },
  { id: 2, nome: 'Marca 2', link: '#', ativo: true },
  { id: 3, nome: 'Marca 3', link: '#', ativo: true },
  { id: 4, nome: 'Marca 4', link: '#', ativo: true },
  { id: 5, nome: 'Marca 5', link: '#', ativo: true },
];