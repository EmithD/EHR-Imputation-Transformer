'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconBrandGoogle } from '@tabler/icons-react';
import LogoSVG from '@/components/logo_svg';
import { motion } from "framer-motion";

const LoginPage = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href='/'>
            <div className="h-16 w-16 rounded-full bg-slate-800 p-3.5 text-white shadow-lg">
              <LogoSVG />
            </div>
          </Link>
        </div>

        <Card className="bg-white border-slate-200 text-slate-800 shadow-md">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-6">
            <Link href="http://localhost:3000/api/v1/auth/google/login" className="block">
              <Button 
                variant="outline" 
                className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all h-11"
              >
                <IconBrandGoogle className="mr-2 h-5 w-5" />
                {'Continue with Google'}
              </Button>
            </Link>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2 pt-0 border-t border-slate-200 mt-2">
            <div className="text-center text-xs text-slate-500 px-2">
              By continuing, you agree to our{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        {/* Decorative elements */}
        <div className="absolute left-1/4 bottom-1/4 h-32 w-32 rounded-full bg-blue-100 blur-3xl -z-10" />
        <div className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-blue-100 blur-3xl -z-10" />
      </motion.div>
    </div>
  );
};

export default LoginPage;