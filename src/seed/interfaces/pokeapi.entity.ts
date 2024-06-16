export interface Pokeapi {
  count: number;
  next: string;
  previous: null;
  results: PokeapiItem[];
}

export interface PokeapiItem {
  name: string;
  no?: number;
  url: string;
}
