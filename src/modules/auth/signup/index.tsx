import { FC, useState } from 'react';
import { WelComeText } from './components/WelComeText';
import { AuthErrorComponent } from './components/AuthErrorComponent';
import { Divider } from './components/Divider';
import { OAuthButtons } from './components/OAuthButtons';
import { LoginRedirectText } from '../signup/components/LoginRedirectText';
import { SignupPageStateProvider } from './hooks/SignupPageStateProvider';
import { SignupInputs } from './components/SignupInputs';
import OtpVerification from './components/OtpVerification';

export interface SignupPageStateIF {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  oAuthLoading: boolean;
  authError: string;
  fieldError: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  isSubmitClicked: boolean;
  showOtpVerificationDialog: boolean;
  termsOfService: boolean;
}
const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  loading: false,
  oAuthLoading: false,
  authError: '',
  fieldError: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  isSubmitClicked: false,
  showOtpVerificationDialog: false,
  termsOfService: false,
};
const SignupPage: FC = () => {
  const [state, setState] = useState<SignupPageStateIF>(initialState);

  return (
    <SignupPageStateProvider value={{ state, setState }}>
      <div className="h-auto w-3/5 max-w-90 min-w-90">
        <WelComeText />
        <AuthErrorComponent />
        <SignupInputs />
        <Divider />
        <OAuthButtons />
        <LoginRedirectText />
        {state.showOtpVerificationDialog && <OtpVerification />}
      </div>
    </SignupPageStateProvider>
  );
};

export default SignupPage;
