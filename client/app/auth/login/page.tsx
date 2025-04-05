'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconBrandGoogle } from '@tabler/icons-react';
import LogoSVG from '@/components/logo_svg';
import { motion } from "framer-motion";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request
    setTimeout(() => setLoading(false), 1000);
    // Add your login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href='/'>
            <div className="h-16 w-16 rounded-full bg-white/10 p-3.5 text-white backdrop-blur-lg shadow-lg">
              <LogoSVG />
            </div>
          </Link>
        </div>

        <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white shadow-xl">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-white/70">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-6">
            <Link href="http://localhost:3000/api/v1/auth/google/login" className="block">
              <Button 
                variant="outline" 
                className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all h-11"
                disabled={loading}
              >
                <IconBrandGoogle className="mr-2 h-5 w-5" />
                {loading ? 'Connecting...' : 'Continue with Google'}
              </Button>
            </Link>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2 pt-0 border-t border-white/10 mt-2">
            <div className="text-center text-xs text-white/60 px-2">
              By continuing, you agree to our{' '}
              <Link href="/" className="text-white/70 hover:text-white underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/" className="text-white/70 hover:text-white underline underline-offset-2">
                Privacy Policy
              </Link>
            </div>
            <div className="text-center">
              <Link href="/">
                <Button variant="link" size="sm" className="text-xs text-white/70 hover:text-white">
                  Learn more
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        {/* Decorative elements */}
        <div className="absolute left-1/4 bottom-1/4 h-32 w-32 rounded-full bg-purple-600/20 blur-3xl -z-10" />
        <div className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-purple-600/20 blur-3xl -z-10" />
      </motion.div>
    </div>
  );
};

export default LoginPage;