import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePokemonDto, UpdatePokemonDto } from './dtos';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private pokemonModel: Model<Pokemon>,
  ) {}
  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(params: PaginationDto): Promise<Pokemon[]> {
    const { limit = 10, offset = 0 } = params;
    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }

  async findOne(term: string) {
    const pokemon = await this.pokemonModel.findOne({
      $or: [
        ...(!isNaN(+term) ? [{ no: term }] : []),
        ...(isValidObjectId(term) ? [{ _id: term }] : []),
        { name: term.toLowerCase().trim() },
      ],
    });
    if (!pokemon)
      throw new BadRequestException(
        `Pokemon with id, name or no "${term}" not found`,
      );
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      pokemon.name = updatePokemonDto.name.toLocaleLowerCase();
    if (updatePokemonDto.no) pokemon.no = updatePokemonDto.no;
    try {
      await pokemon.save();
      return this.findOne(term);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error.code, error);
    throw new InternalServerErrorException(
      `Can't use pokemon - check server logs`,
    );
  }
}
