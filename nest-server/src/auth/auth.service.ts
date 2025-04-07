import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from 'src/mongodb/schemas/user/user.service';
import { google } from 'googleapis';
import { CreateUserDto } from 'src/mongodb/schemas/user/dto/create-user.dto';
import { EncryptionUtil } from 'common/utils/encryption.util';

@Injectable()
export class AuthService {

    private oAuth2Client: OAuth2Client;

    constructor(
        private readonly userService: UserService
    ) {
        this.oAuth2Client = new OAuth2Client({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.CALLBACK_URL
        });
    }

    async generateURL() {

        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];

        const authorizationUrl = await this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true,
            state: "state"
        });

        return authorizationUrl;

    }

    async validateGoogleUser(code: string) {
        try {

            const { tokens } = await this.oAuth2Client.getToken(code);
            this.oAuth2Client.setCredentials(tokens);

            const oauth2 = google.oauth2({
                auth: this.oAuth2Client,
                version: 'v2'
            });
            
            const userInfo = await oauth2.userinfo.get();

            const newUser = await this.createOrUpdateGoogleUser(userInfo, tokens);

            return newUser;

        } catch (error) {
            return error;
        }
    }

    async createOrUpdateGoogleUser(userInfo: any, tokens: any) {

        try {
            
            const user = await this.userService.findOneUser(userInfo.data.email);

            if (!user) {
                const newUser = new CreateUserDto();
                newUser.email = userInfo.data.email,
                newUser.displayName = userInfo.data.name,
                newUser.googleAvatarUrl = userInfo.data.picture,
                newUser.googleAccessToken = tokens.access_token,
                newUser.googleRefreshToken = tokens.refresh_token
                return await this.userService.create(newUser);
            } else {

                const user = await this.userService.findOneUser(userInfo.data.email);
                const updatedUser = await this.userService.update(
                    user?.id,
                    {
                        displayName: userInfo.data.name,
                        googleAvatarUrl: userInfo.data.picture,
                        googleAccessToken: tokens.access_token,
                        googleRefreshToken: tokens.refresh_token
                    }
                )

                return updatedUser;
            }

        } catch (error) {
            return error;
        }

    }

    async isUserAuthenticated(token: string): Promise<boolean | any> {
        try {

            const decrypt = EncryptionUtil.decrypt(token)

            this.oAuth2Client.setCredentials({
                access_token: decrypt
            })
            
            const userInfoClient = await google.oauth2({
                auth: this.oAuth2Client,
                version: 'v2'
            });

            const userInfo = await userInfoClient.userinfo.get();

            if (userInfo.data && userInfo.data.id) {
                // Find the user in the database to make sure they exist
                const user = await this.userService.findOneUser(userInfo.data.email);
                
                const finalUser = {
                    "userId": user?._id,
                    "email": user?.email,
                    "avatarUrl": user?.googleAvatarUrl,
                    "displayName": user?.displayName
                }

                return finalUser;
            }
              
            return false;

        } catch (error) {
            console.error(`Authentication verification failed: ${error.message}`, error.stack);
            return false;
        }
      }


}
