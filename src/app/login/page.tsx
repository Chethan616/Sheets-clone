'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Table, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { CircularLoading } from '@/components/ui/LoadingIndicator';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInAnonymously } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<'choose' | 'anonymous'>('choose');

  useEffect(() => {
    if (user && !loading) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <CircularLoading size="lg" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* Left Side: Hero / Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-primary-container/30 p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.1),transparent)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(var(--tertiary),0.1),transparent)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-lg"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-primary-container text-on-primary-container shadow-elevation-3">
            <Table size={48} />
          </div>
          <h1 className="text-5xl font-medium text-on-surface mb-6 tracking-tight">
            Sheets <span className="text-primary">Clone</span>
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed">
            Experience real-time collaboration with a modern, expressive interface designed for speed and simplicity.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              "Real-time sync", "Expressive Design", 
              "Smart Formulas", "Dark Mode"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface/50 p-3 rounded-xl backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-medium text-on-surface">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
              <Table size={32} />
            </div>
            <h2 className="text-3xl font-medium text-on-surface">Welcome back</h2>
            <p className="mt-2 text-on-surface-variant">Sign in to continue to your documents</p>
          </div>

          <div className="space-y-6">
            {mode === 'choose' ? (
              <div className="space-y-4">
                <Button
                  variant="tonal"
                  onClick={signInWithGoogle}
                  className="w-full h-14 text-base justify-center relative overflow-hidden group"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-6 w-6 mr-2">
                       <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                       <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                       <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                       <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  }
                >
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/40" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface px-4 text-on-surface-variant font-medium tracking-wider">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outlined"
                  onClick={() => setMode('anonymous')}
                  className="w-full h-14 text-base justify-center border-outline-variant/60"
                  icon={<User className="mr-2" size={20} />}
                >
                  Guest Access
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <TextField
                  label="Display Name"
                  placeholder="e.g. Alex Smith"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoFocus
                  variant="outlined"
                  className="bg-transparent"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="text" 
                    onClick={() => setMode('choose')}
                    className="h-12"
                  >
                    Back
                  </Button>
                  <Button
                    variant="filled"
                    onClick={() => displayName.trim() && signInAnonymously(displayName.trim())}
                    disabled={!displayName.trim()}
                    className="h-12"
                    icon={<ArrowRight size={20} className="ml-2" />}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}
            
            <p className="text-center text-xs text-on-surface-variant/60 mt-8">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
