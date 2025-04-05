import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('api/v1/auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Get('google/login')
    async googleLogin(@Res() res: Response) {
        const authorizationUrl = await this.authService.generateURL();
        res.redirect(authorizationUrl);
    }

    @Get('google/callback')
    async googleCallback(
        @Query('code') code: string, 
        @Query('state') state: string,
        @Res() res: Response
    ) {
        try {

            if (state !== 'state') {
                throw new Error('Invalid state parameter');
            }

            await this.authService.validateGoogleUser(code);

            return res.redirect("http://localhost:3001/");

            
        } catch (error) {
            console.error('Google OAuth Callback Error:', error);
            res.redirect("http://localhost:3001/google/fail")
        }
    }

    // @Post('google/user')
    // async getValidation(@Req() req: Request) {
    //     return await this.authService.isUserAuthenticated()
    // }

}
