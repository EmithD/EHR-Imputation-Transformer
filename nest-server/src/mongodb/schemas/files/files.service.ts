import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileDocument } from './entities/file.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FilesService {

  constructor(@InjectModel('File') private fileModel: Model<FileDocument>) {}

  async create(createFileDto: CreateFileDto) {

    try {
      const newFile = await new this.fileModel(createFileDto);
      await newFile.save();
      return newFile;
    } catch (error) {
      return error;
    }

  }

  async findByUser() {

    try {

    } catch (error) {
      
    }

  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
