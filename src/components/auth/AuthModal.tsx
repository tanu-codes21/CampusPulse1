'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  KeyRound,
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';
import { NeoInput } from '../common/NeoInput';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { sendOtp, verifyOtp, isSupabaseLive } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Rate limiting & cooldown
  const [cooldown, setCooldown] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [previewTestOtp, setPreviewTestOtp] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (attemptsCount >= 5) {
      setErrorMessage('Too many OTP requests. Please wait a few minutes before trying again (Rate limited).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / college email address.');
      return;
    }

    setIsLoading(true);
    setAttemptsCount((prev) => prev + 1);

    const res = await sendOtp(email);
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
      setCooldown(60); // 60s resend cooldown
      setSuccessNotice(res.message);
      if (res.simulatedOtp) {
        setPreviewTestOtp(res.simulatedOtp);
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpToken.length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    const res = await verifyOtp(email, otpToken);
    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setErrorMessage(null);

    const res = await sendOtp(email);
    setIsLoading(false);

    if (res.success) {
      setCooldown(60);
      setSuccessNotice('A new 6-digit verification code has been dispatched.');
      if (res.simulatedOtp) {
        setPreviewTestOtp(res.simulatedOtp);
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 sm:p-8 border border-neo-border dark:border-neo-darkBorder shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-neo-secondary hover:text-neo-primary"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-neo-bg dark:bg-neo-darkBg flex items-center justify-center mx-auto shadow-neo-inset border border-neo-border text-accent-cyan">
            <Zap className="w-6 h-6 fill-accent-cyan" />
          </div>
          <h2 className="text-xl font-extrabold text-neo-primary dark:text-white">
            {step === 'email' ? 'Sign In to CampusPulse' : 'Verify 6-Digit OTP'}
          </h2>
          <p className="text-xs text-neo-secondary">
            {step === 'email'
              ? 'Password-free Gmail email OTP verification for students'
              : `Enter the six-digit code sent to ${email}`}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-50 text-accent-cyan border border-cyan-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Development / Testing Quick OTP Preview Banner */}
        {previewTestOtp && step === 'otp' && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Instant OTP Preview (Testing Mode)
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              Your 6-digit code is: <span className="font-mono font-black text-sm tracking-widest">{previewTestOtp}</span>
            </p>
            <button
              type="button"
              onClick={() => setOtpToken(previewTestOtp)}
              className="text-[11px] font-bold text-accent-cyan underline block mt-0.5"
            >
              Click to autofill OTP
            </button>
          </div>
        )}

        {/* STEP 1: ENTER EMAIL */}
        {step === 'email' ? (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <NeoInput
              label="Student Email Address"
              type="email"
              placeholder="e.g. yourname@gmail.com or roll@college.edu"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <NeoButton
              variant="accent-cyan"
              size="lg"
              type="submit"
              disabled={isLoading}
              className="w-full justify-center shadow-lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  Send Six-Digit OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </NeoButton>

            <p className="text-[11px] text-center text-neo-secondary">
              No password needed. An authentication code with a 10-minute validity will be sent to your inbox.
            </p>
          </form>
        ) : (
          /* STEP 2: VERIFY OTP */
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <NeoInput
                label="Six-Digit Verification Code"
                placeholder="123456"
                icon={<KeyRound className="w-4 h-4" />}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength={6}
                required
                className="text-center font-mono text-lg tracking-widest"
              />
              <div className="flex items-center justify-between text-[11px] text-neo-secondary mt-1.5 px-1">
                <span>Code expires in 10 minutes</span>
                {cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-accent-cyan font-bold hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>

            <NeoButton
              variant="accent-cyan"
              size="lg"
              type="submit"
              disabled={isLoading || otpToken.length !== 6}
              className="w-full justify-center shadow-lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Enter CampusPulse
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </NeoButton>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtpToken('');
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs text-neo-secondary hover:text-neo-primary font-semibold"
            >
              ← Change email address
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

