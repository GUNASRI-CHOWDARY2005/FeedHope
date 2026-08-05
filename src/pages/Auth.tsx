import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from
  '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
const ADMIN_EMAIL = 'gunasrichowdary86@gmail.com';
const ADMIN_PASSWORD = '12345678';

type Step = 'form' | 'otp';


export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const proceedAfterAuth = (appRole?: string) => {
    if (!appRole) navigate('/onboarding/role');
    else navigate('/');
  };
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const result = await FirebaseAuthentication.signInWithGoogle({
      });
      if (!result.user?.email) {
        toast.error("Google Sign-In failed.");
        return;
      }

      const user = await login({
        email: result.user.email,
        fullName: result.user.displayName ?? result.user.email,
      });

      toast.success("Signed in with Google!");
      proceedAfterAuth(user.app_role);

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);

      toast.error(
        error?.message ||
        error?.code ||
        JSON.stringify(error)
      );
    } finally {
      setLoading(false);
    }
  };
  const completeLogin = async () => {
    const user = await login({ email, password });
    proceedAfterAuth(user.app_role);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter an email');
    if (!password) return toast.error('Please enter a password');
    setLoading(true);
    try {
      // Special admin credentials open the Admin dashboard directly (no OTP).
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'admin-gunasri',
            full_name: 'Gunasri',
            email: ADMIN_EMAIL,
            app_role: 'admin'
          })
        });
        await completeLogin();
        toast.success('Welcome back, Admin!');
        return;
      }
      // Fetch current users list to verify registration status
      const checkRes = await fetch(`${API_BASE_URL}/api/users`);
      const users = await checkRes.json();
      const exists = users.some((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase().trim());

      if (isLogin) {
        if (!exists) {
          setLoading(false);
          return toast.error('Account does not exist. Please sign up first.');
        }
        await completeLogin();
        toast.success('Welcome back!');
      } else {
        if (exists) {
          setLoading(false);
          return toast.error('Account already exists. Please sign in instead.');
        }
        // Directly complete registration without OTP!
        await completeLogin();
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center text-primary">
        <HeartHandshake className="w-12 h-12 mb-2" />
        <h1 className="text-2xl font-bold">FeedHope</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required />

            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                  required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center w-full mt-2">
            <Button
              type="button"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGoogleSignIn();
              }}
            >
              Sign in with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => {
              setIsLogin(!isLogin);
              setStep('form');
            }}>

            {isLogin ?
              "Don't have an account? Sign up" :
              'Already have an account? Sign in'}
          </Button>
        </CardFooter>
      </Card>
    </div>);

}