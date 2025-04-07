import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

  findAll() {
    return `This action returns all files`;
  }

  async findByUser(uId: string) {
    try {
      const files = await this.fileModel.find({ userId: uId }).exec();

      for (const file of files) {

        const statusResRaw = await fetch(`http://localhost:8000/api/v1/impute/${file.bEfileId}/status/`)
        const statusRes = await statusResRaw.json();
        if(file.status !== statusRes.status) {
          await this.update(file._id  as string, file.status = statusRes.status);
          file.status = statusRes.status;
        }

      }

      return files;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch files by userId');
    }
  }
  
  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  async update(id: string, updateFileDto: UpdateFileDto) {
    try {
      const updatedFile = await this.fileModel.findByIdAndUpdate(id, updateFileDto, {
        new: true,
        runValidators: true
      });

      if (!updatedFile) {
        throw new NotFoundException(`File with ID ${id} not found`);
      }

      return updatedFile;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update file with ID ${id}`);
    }
  }


  async remove(id: string) {
      const deleted = await this.fileModel.findByIdAndDelete(id);

      if (!deleted) {
        throw new NotFoundException(`File with ID ${id} not found`);
      }

      return { message: `File with ID ${id} has been successfully removed.` };
  }
}
