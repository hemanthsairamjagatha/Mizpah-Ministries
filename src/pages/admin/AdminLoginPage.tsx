import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginFormSchema, type LoginFormValues } from '../../lib/validation';
import { useAuth } from '../../hooks/useAuth';
import Seo from '../../components/Seo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Church, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const AdminLoginPage: React.FC = () => {
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute clean redirect destination (prevent redirecting back to login page itself)
  const targetPath = (location.state as any)?.from?.pathname;
  const from = targetPath && targetPath !== '/admin/login' ? targetPath : '/admin';

  // Automatically redirect if already authenticated with active admin profile
  useEffect(() => {
    if (!loading && user && profile) {
      navigate(from, { replace: true });
    }
  }, [user, profile, loading, navigate, from]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    try {
      await signIn(data);
      toast.success('Welcome back, Administrator!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Invalid administrator email or password';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <Seo path="/admin/login" noindex />
      {/* Top back link */}
      <div className="p-2 sm:p-0 sm:absolute sm:top-6 sm:left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-sky-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Website</span>
        </Link>
      </div>

      <div className="w-full sm:mx-auto sm:max-w-md text-center px-4 pt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-sky-600 text-white shadow-card mb-4">
          <Church className="w-7 h-7" />
        </div>
        <h2 className="font-inter text-2xl sm:text-3xl font-bold tracking-tight text-navy-900">
          Administrator Portal
        </h2>
        <p className="mt-2 text-sm text-navy-600">
          Sign in to manage your church content, sermons, gallery & messages
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:max-w-md px-2 sm:px-4">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 rounded-2xl border border-slate-200/90 shadow-card space-y-5 sm:space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@church.org"
              required
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              {...register('password')}
              error={errors.password?.message}
            />

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full text-base font-semibold shadow-md"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
