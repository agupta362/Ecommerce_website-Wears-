import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // User should have a session after clicking the reset link
      if (session) {
        setIsValidSession(true);
      } else {
        // Listen for auth state change (recovery token from URL)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
              setIsValidSession(true);
            }
          }
        );
        
        // Cleanup after a short delay if no session
        setTimeout(() => {
          subscription.unsubscribe();
          setIsChecking(false);
        }, 2000);
        
        return () => subscription.unsubscribe();
      }
      setIsChecking(false);
    };

    checkSession();
  }, []);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setIsSuccess(true);
      toast({
        title: 'Password updated!',
        description: 'Your password has been successfully changed.',
      });
      
      // Sign out and redirect to login after 2 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 2000);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 lg:py-20">
        <div className="container-tight">
          <div className="max-w-md mx-auto">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <div className="bg-card border rounded-lg p-8">
              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 mx-auto text-primary mb-4" />
                  <h1 className="font-display text-2xl uppercase tracking-wider mb-2">
                    Password Updated!
                  </h1>
                  <p className="text-muted-foreground">
                    Redirecting you to login...
                  </p>
                </div>
              ) : !isValidSession ? (
                <div className="text-center py-8">
                  <KeyRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h1 className="font-display text-2xl uppercase tracking-wider mb-2">
                    Invalid or Expired Link
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                  <Button asChild>
                    <Link to="/auth">Go to Login</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <KeyRound className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h1 className="font-display text-2xl uppercase tracking-wider mb-2">
                      Set New Password
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Enter your new password below
                    </p>
                  </div>

                  <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...form.register('password')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10"
                          {...form.register('confirmPassword')}
                        />
                      </div>
                      {form.formState.errors.confirmPassword && (
                        <p className="text-destructive text-sm">{form.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
