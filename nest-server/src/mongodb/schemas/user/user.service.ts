import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserDocument } from './entities/user.entity';
import { EncryptionUtil } from 'common/utils/encryption.util';

@Injectable()
export class UserService {

  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto) {
    
    if (createUserDto.googleAccessToken) createUserDto.googleAccessToken = EncryptionUtil.encrypt(createUserDto.googleAccessToken);
    if (createUserDto.googleRefreshToken) createUserDto.googleRefreshToken = EncryptionUtil.encrypt(createUserDto.googleRefreshToken);

    const newUser = new this.userModel(createUserDto);
    newUser.save()

    return newUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOneUser(emailP: string) {

    const user = await this.userModel.findOne({email: emailP});
    console.log("user:", user)

    return user;
  }

  async findOneDecrypted(identifier: string) {
    const query = mongoose.isValidObjectId(identifier) 
    ? { _id: identifier } 
    : { emailId: identifier };

    const user = await this.userModel.findOne(query).exec();

    const userObj = { ...user }

    if(userObj.email) userObj.email = EncryptionUtil.decrypt(userObj.email);
    if(userObj.googleAccessToken) userObj.googleAccessToken = EncryptionUtil.decrypt(userObj.googleAccessToken);
    if(userObj.googleRefreshToken) userObj.googleRefreshToken = EncryptionUtil.decrypt(userObj.googleRefreshToken);

    return userObj;
  }

  async update(identifier: string, updateUserDto: UpdateUserDto) {
    
    if (updateUserDto.googleAccessToken) { updateUserDto.googleAccessToken = EncryptionUtil.encrypt(updateUserDto.googleAccessToken) };
    if (updateUserDto.googleRefreshToken) { updateUserDto.googleRefreshToken = EncryptionUtil.encrypt(updateUserDto.googleRefreshToken) };
    
    const query = mongoose.isValidObjectId(identifier) 
    ? { _id: identifier } 
    : { email: identifier };

    const updatedUser = await this.userModel.findOneAndUpdate(
      query,
      { $set: updateUserDto },
      { new: true, runValidators: true }
    );

    return updatedUser;

  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
