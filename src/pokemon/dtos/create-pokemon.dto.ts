import { IsInt, IsNotEmpty, IsPositive, Min, MinLength } from 'class-validator';

export class CreatePokemonDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Min(1)
  no: number;

  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
