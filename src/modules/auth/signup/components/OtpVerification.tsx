import React, { useState, useRef, useEffect } from 'react';
import { Mail, Shield, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/Button';
import { DialogComponent } from '../../../../components/DialogComponent';
import { useSignupPageState } from '../hooks/SignupPageStateProvider';
import { useSignupPageApi } from '../hooks/useSignupPageApi';

const OTPVerification: React.FC = ({}) => {
  const delayTime = 150;
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(''));
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(delayTime);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setState } = useSignupPageState();
  const { resendOtpApi, verifyOtpAPI } = useSignupPageApi();

  const closeDialog = () => {
    setState(prev => ({ ...prev, showOtpVerificationDialog: false }));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((digit, index) => {
      if (index < 4) newOtp[index] = digit;
    });
    setOtp(newOtp);

    // Focus the last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length - 1, 3);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length === 4) {
      verifyOtpAPI(otpString);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      setTimeLeft(delayTime);
      const res = await resendOtpApi();
      setIsExpired(false);
      setOtp(new Array(4).fill(''));
      setIsResending(false);
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  const isComplete = otp.every(digit => digit !== '');
  const canSubmit = isComplete && !isExpired;

  return (
    <DialogComponent isOpen={true} className="w-full max-w-md p-4">
      <div className="relative mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-800">OTP Verification</h2>
        <p className="flex items-center justify-center gap-2 text-gray-600">
          <Mail className="h-4 w-4" />
          Please enter the OTP sent to your email
        </p>
      </div>

      {/* Timer */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className={`text-sm font-medium ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
          {isExpired ? 'OTP has expired' : `Time remaining: ${formatTime(timeLeft)}`}
        </span>
      </div>

      {/* OTP Input */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">Enter OTP:</label>
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => {
                if (el) inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              className={`h-12 w-12 rounded-lg border-2 text-center text-lg font-semibold transition-all duration-200 ${
                digit ? 'border-blue-500 bg-blue-50 text-blue-600' : isExpired ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
              disabled={isExpired}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full gap-2 px-1">
        <Button onClick={closeDialog} className="flex-1">
          Close
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
          {isComplete ? 'Verify OTP' : 'Submit'}
        </Button>
      </div>

      {/* Resend link */}
      {isExpired && (
        <div className="mt-4 flex w-full px-1 text-center">
          <Button onClick={handleResend} disabled={isResending || !isExpired} className="flex-1">
            <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Resending...' : 'Resend OTP'}
          </Button>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="flex justify-center gap-1">
          {otp.map((digit, index) => (
            <div key={index} className={`h-2 w-2 rounded-full transition-all duration-200 ${digit ? 'bg-blue-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    </DialogComponent>
  );
};

export default OTPVerification;
