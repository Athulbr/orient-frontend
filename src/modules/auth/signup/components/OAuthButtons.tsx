import { FC } from 'react';
import GoogleIcon from '../../../../assets/svg-icons/GoogleIcon';
import { useSignupPageApi } from '../hooks/useSignupPageApi';

export const OAuthButtons: FC = () => {
  const { signupWithGoogle } = useSignupPageApi();

  return (
    <section className="mt-8 w-full">
      <button
        onClick={() => signupWithGoogle()}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-1 p-2 text-sm text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon /> Google
      </button>
    </section>
  );
};
