import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

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

            const newUser = await this.authService.validateGoogleUser(code);

            return res.redirect(`http://localhost:3001/admin/?user=${newUser.googleAccessToken}`);

            
        } catch (error) {
            console.error('Google OAuth Callback Error:', error);
            res.redirect("http://localhost:3001/auth/google/fail")
        }
    }

    @Post('google/user')
    async getValidation(@Body() body: any) {
        try {

            const { token } = body;
            
            if (!token) {
                return {
                    isAuthenticated: false,
                    message: 'No token provided'
                };
            }

            const user = await this.authService.isUserAuthenticated(token);
            
            // If authenticated, optionally get user data
            if (user) {
                return {
                    isAuthenticated: true,
                    user: user
                };
            }
            
            return {
                isAuthenticated: false,
                message: 'Invalid or expired token'
            };
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                isAuthenticated: false,
                message: 'Authentication error',
                error: error.message
            };
        }
    }
}
