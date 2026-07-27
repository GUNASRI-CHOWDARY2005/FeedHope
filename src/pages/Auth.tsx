import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter } from
'../components/ui';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
const ADMIN_EMAIL = 'gunasrichowdary86@gmail.com';
const ADMIN_PASSWORD = '12345678';
const GOOGLE_CLIENT_ID = '1008297948250-d0egg1lsq71uki4d1i75iurbq488t0pc.apps.googleusercontent.com'; // Replace with your Google Client ID

type Step = 'form' | 'otp';

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};
export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showDevOtp, setShowDevOtp] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const proceedAfterAuth = (appRole?: string) => {
    if (!appRole) navigate('/onboarding/role');
    else navigate('/');
  };

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    try {
      const decoded = parseJwt(response.credential);
      if (!decoded || !decoded.email) {
        throw new Error('Failed to parse Google profile from ID token');
      }
      
      const user = await login({ email: decoded.email, fullName: decoded.name });
      toast.success('Signed in with Google!');
      proceedAfterAuth(user.app_role);
    } catch (error: any) {
      console.error('Google sign in callback error details:', error);
      const errMsg = error?.message || 'Unknown error';
      toast.error(`Google sign in failed: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current GOOGLE_CLIENT_ID used in app:", GOOGLE_CLIENT_ID);
    const initGoogle = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });

        const btnEl = document.getElementById('google-signin-btn');
        if (btnEl) {
          (window as any).google.accounts.id.renderButton(
            btnEl,
            { theme: 'outline', size: 'large', width: '382' }
          );
        }
      }
    };
    
    // Initial attempt
    initGoogle();

    // Retry initialization in case script loads slowly
    const timer = setInterval(() => {
      if ((window as any).google) {
        initGoogle();
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isLogin, step]);
  const completeLogin = async () => {
    const user = await login({ email });
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
        await fetch('/api/users', {
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
      if (isLogin) {
        await completeLogin();
        toast.success('Welcome back!');
      } else {
        // Sign up flow: generate and send OTP to backend email service.
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);

        try {
          await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
          });
        } catch (err) {
          console.error('Failed to send OTP email:', err);
        }

        setStep('otp');
        toast.success(`Verification code sent to ${email}`);
      }
    } catch (error) {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() !== generatedOtp) {
      return toast.error('Incorrect verification code');
    }
    setLoading(true);
    try {
      await completeLogin();
      toast.success('Email verified — account created!');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };
  const resendOtp = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
    } catch (err) {
      console.error('Failed to resend OTP email:', err);
    }

    toast.success(`A new verification code has been sent to ${email}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center text-primary">
        <HeartHandshake className="w-12 h-12 mb-2" />
        <h1 className="text-2xl font-bold">FeedHope</h1>
      </div>

      <Card className="w-full max-w-md">
        {step === 'otp' ?
        <>
            <CardHeader>
              <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl text-center">
                Verify your email
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Enter the 6-digit code sent to{' '}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={otpInput}
                  onChange={(e) =>
                  setOtpInput(e.target.value.replace(/\D/g, ''))
                  }
                  className="text-center text-lg tracking-[0.5em] font-semibold"
                  required />
                
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button variant="link" onClick={resendOtp} disabled={loading}>
                Resend code
              </Button>
              {!showDevOtp ? (
                <button
                  type="button"
                  onClick={() => setShowDevOtp(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                >
                  Didn't receive email? (Click to reveal code for testing)
                </button>
              ) : (
                <div className="text-xs bg-slate-100 p-2 rounded text-center text-slate-700 font-mono">
                  Dev Test OTP: <span className="font-bold text-primary">{generatedOtp}</span>
                </div>
              )}
              <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                setStep('form');
                setOtpInput('');
                setShowDevOtp(false);
              }}>
              
                ← Back
              </Button>
            </CardFooter>
          </> :

        <>
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
                  <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required />
                
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

              <div className="flex justify-center w-full min-h-[40px] mt-2">
                <div id="google-signin-btn" className="w-full flex justify-center"></div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setStep('form');
                setOtpInput('');
              }}>
              
                {isLogin ?
              "Don't have an account? Sign up" :
              'Already have an account? Sign in'}
              </Button>
            </CardFooter>
          </>
        }
      </Card>
    </div>);

}