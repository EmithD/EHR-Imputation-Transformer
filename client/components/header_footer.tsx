import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem,  NavigationMenuList } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import LogoSVG from './logo_svg';

const HeaderFooter = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header with glass morphism */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between py-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center space-x-2">
            
              <div className="h-8 w-8 rounded-full text-white">
                <LogoSVG />
              </div>
              <span className="font-bold text-xl text-white">Full-EHR</span>
            </a>
          </div>
          
          <NavigationMenu className="hidden md:flex mx-auto">
            <NavigationMenuList className="flex space-x-4">
              <NavigationMenuItem>
                <Link href="/" className="font-medium text-white hover:text-white/80">
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" className="font-medium text-white hover:text-white/80">
                  The Dataset
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/impute" className="font-medium text-white hover:text-white/80">
                  Start Imputing
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto">
        {children}
      </main>

      {/* Footer with glass morphism */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg text-white">
        <div className="container mx-auto py-10 md:py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="space-y-3 flex flex-col items-center md:items-start">
              <h3 className="text-lg font-semibold text-white">Full-EHR</h3>
              <p className="text-sm text-white/60">Impute your PhysioNet Datasets.</p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="text-white/60 hover:text-white">
                  Twitter
                </a>
                <a href="#" className="text-white/60 hover:text-white">
                  GitHub
                </a>
                <a href="#" className="text-white/60 hover:text-white">
                  LinkedIn
                </a>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Products</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-white/60 hover:text-white">Product A</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">Product B</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">Product C</a>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-white/60 hover:text-white">Documentation</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">Tutorials</a>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-white/60 hover:text-white">About</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">Careers</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">Contact</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-white/60">
              &copy; {new Date().getFullYear()} Full-EHR, Developed as a final year project demonstration.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-xs text-white/60 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-white/60 hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-xs text-white/60 hover:text-white">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeaderFooter;