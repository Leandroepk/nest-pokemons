import { Injectable } from '@nestjs/common';
import { Pokeapi } from './interfaces/pokeapi.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name) private pokemonModel: Model<Pokemon>,
    private readonly axios: AxiosAdapter,
  ) {}
  async populateDB(limit: number) {
    await this.pokemonModel.deleteMany({});
    const pokemons = await this.findAll(limit);
    const parsedPokemons = pokemons.map((x) => ({ name: x.name, no: x.no }));
    const resp = this.pokemonModel.insertMany(parsedPokemons);
    return resp;
  }

  async findAll(limit: number) {
    const pokemons = await this.axios.get<Pokeapi>(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}`,
    );
    pokemons.results = pokemons.results.map((x) => {
      const splitedUrl = x.url.split('/');
      return {
        name: x.name,
        no: +splitedUrl[splitedUrl.length - 2],
        url: x.url,
      };
    });
    return pokemons.results;
  }
}
