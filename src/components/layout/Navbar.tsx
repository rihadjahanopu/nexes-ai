'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Sparkles, LayoutDashboard, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="fixed inset-x-0 top-0 flex justify-center px-4 pt-4 pb-2 z-50">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`w-full max-w-[1200px] rounded-full border transition-all duration-300 ease-out shadow-lg relative
          ${isScrolled
            ? 'bg-background/70 backdrop-blur-xl border-primary/20 py-2'
            : 'bg-background/40 backdrop-blur-md border-border/50 py-3'
          }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 tracking-tight">
              Nexus
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex gap-5 items-center absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it Works</Link>
            <Link href="/#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Testimonials</Link>
            <Link href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
            
            {user && (
              <>
                <div className="w-px h-4 bg-border/50 hidden xl:block mx-1" />
                <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-blue-500 transition-colors">Dashboard</Link>
                <Link href="/projects" className="text-sm font-medium text-primary hover:text-blue-500 transition-colors">Projects</Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full h-9 w-9 bg-background/50 hover:bg-primary/10 shrink-0"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 bg-background/50 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="h-7 w-7 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/30 shrink-0">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.name} width={28} height={28} className="object-cover w-full h-full" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-60 rounded-2xl border border-border/50 bg-background/90 backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border/50 bg-primary/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-primary/30 shrink-0">
                            {user.avatar ? (
                              <Image src={user.avatar} alt={user.name} width={40} height={40} className="object-cover w-full h-full" />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2 px-1">
                        <DropdownItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" onClick={() => setDropdownOpen(false)} />
                        <DropdownItem href="/profile" icon={<Settings className="h-4 w-4" />} label="Profile Settings" onClick={() => setDropdownOpen(false)} />
                      </div>

                      <div className="py-2 px-1 border-t border-border/50">
                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden lg:block">
                  <Button variant="ghost" className="rounded-full h-9 px-4 hover:bg-primary/10">Login</Button>
                </Link>
                <Link href="/register" className="hidden lg:block">
                  <Button className="rounded-full h-9 px-5 shadow-primary/20 shadow-md text-sm">Get Started</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 rounded-full shrink-0 hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-full left-0 right-0 mt-3 p-4 bg-background/95 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl flex flex-col gap-2 origin-top"
            >
              <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary/10 text-sm font-medium transition-colors">Features</Link>
              <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary/10 text-sm font-medium transition-colors">How it Works</Link>
              <Link href="/#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary/10 text-sm font-medium transition-colors">Testimonials</Link>
              <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary/10 text-sm font-medium transition-colors">FAQ</Link>
              
              {user && (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary/10 text-sm font-medium transition-colors text-primary">Dashboard</Link>
                  <Link href="/projects" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary/10 text-sm font-medium transition-colors text-primary">Projects</Link>
                </>
              )}

              {!user && (
                <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-border/50">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl h-11 border-primary/20 hover:bg-primary/5">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl h-11 shadow-primary/20 shadow-md">Get Started</Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-primary/10 hover:text-primary transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
