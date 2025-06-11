import { FC, useState } from 'react';
import { WelComeText } from './components/WelComeText';
import { AuthErrorComponent } from './components/AuthErrorComponent';
import { Divider } from './components/Divider';
import { OAuthButtons } from './components/OAuthButtons';
import { LoginRedirectText } from '../signup/components/LoginRedirectText';
import { SignupPageStateProvider } from './hooks/SignupPageStateProvider';
import { SignupInputs } from './components/SignupInputs';

export interface SignupPageStateIF {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  authError: string;
  fieldError: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  isSubmitClicked: boolean;
}
const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  loading: false,
  authError: '',
  fieldError: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  isSubmitClicked: false,
};
const SignupPage: FC = () => {
  const [state, setState] = useState<SignupPageStateIF>(initialState);

  return (
    <SignupPageStateProvider value={{ state, setState }}>
      <div className="h-auto w-3/5 max-w-90 min-w-82">
        <WelComeText />
        <AuthErrorComponent />
        <SignupInputs />
        <Divider />
        <OAuthButtons />
        <LoginRedirectText />
      </div>
    </SignupPageStateProvider>
  );
};

export default SignupPage;
