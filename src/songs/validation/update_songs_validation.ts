import { IsOptional } from 'class-validator';

export class UpdateSongsValidation {
  @IsOptional()
  id;

  @IsOptional()
  name;

  @IsOptional()
  genre;

  @IsOptional()
  author;

  @IsOptional()
  price;

  @IsOptional()
  image;
}
