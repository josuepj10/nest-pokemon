import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { query } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  
    private readonly configService: ConfigService,
  ) {
   this.defaultLimit = this.configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll( paginationDto: PaginationDto ) {

    const { limit = this.defaultLimit , offset = 0 } = paginationDto;  

    return this.pokemonModel.find()
    .limit( limit )
    .skip( offset )  
    .sort({ no: 1 })
    .select('-__v') //exclude the __v field
   
  }

  async findOne(term: string) {
    //term: is the search term and not the id
    let pokemon: Pokemon;

    //Find by term
    if (!isNaN(+term)) {
      //Will be true if term can be converted to a number
      pokemon = await this.pokemonModel.findOne({ no: term }); //Search a Pokemon in MongoDB whose number (no) is equal to term
    }

    //Find by MongoID
    if (!pokemon && isValidObjectId(term)) {
      //Will be true if term is a valid MongoID
      pokemon = await this.pokemonModel.findById(term); //Search a Pokemon in MongoDB whose _id is equal to term
    }

    //Else, find by name
    if (!pokemon) {
      //If pokemon is still null
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() }); //Search a Pokemon in MongoDB whose name is equal to term
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or number "${term}" not found`,
      );

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term); //call the findOne method to find the pokemon

    if (updatePokemonDto.name)
      //if updatePokemonDto.name is not null
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase(); //convert the name to lowercase and assign it to updatePokemonDto.name

    try {
      await pokemon.updateOne(updatePokemonDto); //update the pokemon with the new data //new: true returns the updated document
      return { ...pokemon.toJSON(), ...updatePokemonDto }; //return the updated pokemon
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }
    return;
  }

  private handleException(error: any) {
    if (error.code === 11000) {
      //MongoError: E11000 duplicate key error collection
      throw new BadRequestException(
        `Pokemon already exists ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException('Error creating pokemon');
  }
}
