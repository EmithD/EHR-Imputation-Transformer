'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconBrandGoogle } from '@tabler/icons-react';
import LogoSVG from '@/components/logo_svg';

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
      <div className="w-full max-w-md space-y-4">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm">
            <LogoSVG />
          </div>
        </div>

        <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-white/60">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>

            <div className="flex flex-col space-y-2">

              <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <IconBrandGoogle className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-xs text-white/60">
              By continuing, you agree to our
              <Link href='/'><Button variant="link" className="px-1 text-xs text-white/70 hover:text-white">Terms of Service</Button></Link>
              and
              <Link href='/'><Button variant="link" className="px-1 text-xs text-white/70 hover:text-white">Privacy Policy</Button></Link>
              <br />
              <Link href='/'><Button variant="link" className="px-1 text-xs text-white/70 hover:text-white">Learn more</Button></Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
