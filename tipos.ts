// tipos.ts
export interface UrlEncurtada {
  id: number;
  codigo: string; // ex.: "aB3xK9"
  urlOriginal: string; // URL completa
  acessos: number;
  criadoEm: string; // ISO datetime
  expiraEm: string | null; // Desafio C - data de expiração
}

export interface RespostaErro {
  erro: string;
}

export interface RequisicaoEncurtar {
  urlOriginal: string;
  codigo?: string; // Desafio A - código personalizado
  expiraEm?: string; // Desafio C - data de expiração
}
