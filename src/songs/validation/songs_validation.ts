import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class SongValidator {
  @IsInt()
  @IsOptional()
  id;

  @IsString()
  name;

  @IsString()
  genre;

  @IsString()
  author;

  @IsNumber()
  price;

  @IsOptional()
  image;
}
