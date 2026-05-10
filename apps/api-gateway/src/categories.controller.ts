import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    @Inject('CATEGORY_SERVICE') private readonly categoryClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryClient.send('create_category', createCategoryDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryClient.send('get_categories', paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryClient.send('get_category_by_id', id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryClient.send('update_category', { id, updateCategoryDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryClient.send('delete_category', id);
  }
}
