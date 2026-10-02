import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import * as authService from '../api/authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Code & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validateStep1() {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2() {
    const next = {};
    if (!token.trim()) next.token = 'Reset code or token is required';
    if (!newPassword || newPassword.length < 8) next.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRequestReset(e) {
    e.preventDefault();
    if (!validateStep1()) return;
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword({ email });
      toast.success('Reset token generated!');
      if (res?.resetToken) {
        setToken(res.resetToken);
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not process request');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!validateStep2()) return;
    setSubmitting(true);
    try {
      await authService.resetPassword({ email, token, newPassword });
      toast.success('Password reset successfully!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8.5rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Card className="p-6 sm:p-8">
        {step === 1 && (
          <>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forgot password?</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter your account email address and we&apos;ll send you a password reset code.
            </p>

            <form onSubmit={handleRequestReset} className="mt-6 flex flex-col gap-4" noValidate>
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="name@company.com"
              />
              <Button type="submit" loading={submitting} className="mt-2">
                Continue
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reset your password</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter the reset token sent to <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span> and choose a new password.
            </p>

            <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-4" noValidate>
              <Input
                label="Reset code / token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                error={errors.token}
                placeholder="Paste token or code"
              />
              <Input
                label="New password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
                placeholder="At least 8 characters"
              />
              <Input
                label="Confirm new password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                placeholder="Re-enter new password"
              />
              <Button type="submit" loading={submitting} className="mt-2">
                Reset password
              </Button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Password reset complete</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
            <Button onClick={() => navigate('/login')} className="mt-6 w-full">
              Back to log in
            </Button>
          </div>
        )}

        {step !== 3 && (
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:underline dark:text-slate-300">
              <ArrowLeft className="h-4 w-4" /> Back to log in
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
