import { FC, useState } from 'react';
import GoogleIcon from '../../assets/svg-icons/GoogleIcon';
import { MakezLogoAuth } from '../../assets/svg-icons/MakezLogoAuth';
import { MuiPasswordTextField } from '../../components/MuiPasswordTextField';
import { MuiTextField } from '../../components/MuiTextField';
import { useGoogleLogin } from '@react-oauth/google';
import httpRequest from '../../utils/httpRequest';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import { useToastStore } from '../../components/toast/ToastStore';
import { Button } from '../../components/Button';

interface LoginPageIF {
  test?: string;
}

const LoginPage: React.FC<LoginPageIF> = () => {
  const toast = useToastStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [error, setError] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) return 'Password is required';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (touched.email) {
      setError(prev => ({ ...prev, email: validateEmail(newEmail) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (touched.password) {
      setError(prev => ({ ...prev, password: validatePassword(newPassword) }));
    }
  };

  const loginWithEmailAndPassword = async () => {
    // Set all fields as touched to trigger validation
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setError({
      email: emailError,
      password: passwordError,
    });

    // If there are any validation errors, don't proceed
    if (emailError || passwordError) {
      return;
    }

    try {
      setIsLoading(true);
      // setAuthError('');
      const res = await httpRequest('POST', `${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      if (res?.data?.accessToken) {
        window?.sessionStorage?.setItem('accessToken', JSON.stringify(res?.data?.accessToken));
        window?.sessionStorage?.setItem('firstName', JSON.stringify(res?.data?.user?.firstName));
        toast.success('Logged in successfully');
        setTimeout(() => {
          window?.location?.replace('/');
        }, 1000);
      } else {
        setAuthError('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onBlurHandler = (type: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [type]: true }));

    if (type === 'email') {
      setError(prev => ({ ...prev, email: validateEmail(email) }));
    } else if (type === 'password') {
      setError(prev => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleForgotPassword = () => {
    // Implement forgot password functionality or navigate to forgot password page
    navigate('/auth/forgot-password');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      loginWithEmailAndPassword();
    }
  };

  return (
    <div className="h-auto w-3/5 max-w-90 min-w-82">
      <WelComeText />
      <AuthErrorComponent authError={authError} />
      <section className="mt-8 flex flex-col gap-2">
        <MuiTextField
          errorMessage={touched.email ? error.email : ''}
          label="Email"
          value={email}
          onChange={handleEmailChange}
          className="-webkit-text-fill-color: #fff"
          onBlur={() => onBlurHandler('email')}
          onKeyDown={handleKeyDown}
        />
        <MuiPasswordTextField
          errorMessage={touched.password ? error.password : ''}
          label="Password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => onBlurHandler('password')}
          onKeyDown={handleKeyDown}
        />
        <p
          tabIndex={0}
          onClick={handleForgotPassword}
          className="w-fit cursor-pointer pl-1 text-[12px] text-gray-400 hover:text-gray-700 active:border-gray-400 active:outline-gray-400"
        >
          Forgot Password?
        </p>
        <Button onClick={loginWithEmailAndPassword} className="mt-2" disabled={isLoading}>
          {isLoading && <Spinner size={16} />} {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
        </Button>
      </section>

      <Divider />

      <OAuthButtons setIsLoading={setIsLoading} setAuthError={setAuthError} />

      <SignUpRedirectText />
    </div>
  );
};

export default LoginPage;

interface AuthErrorComponentIF {
  authError: string;
}

const AuthErrorComponent: FC<AuthErrorComponentIF> = ({ authError }) => {
  if (!authError) return null;
  return <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{authError}</div>;
};
const WelComeText = () => {
  return (
    <section className="mt-8 flex flex-col gap-1">
      <h1 className="text-[32px] font-bold">Welcome!</h1>
      <p className="text-sm text-gray-500">Please enter your email and password to login</p>
    </section>
  );
};
const Divider = () => {
  return (
    <section className="mt-3 flex flex-col items-center">
      <p className="relative top-2 cursor-default bg-white px-1 text-sm text-gray-600">or continue with</p>
      <div className="w-full border-b"></div>
    </section>
  );
};

const SignUpRedirectText = () => {
  const navigate = useNavigate();
  return (
    <section className="mt-6 flex w-full justify-center gap-2">
      <p className="text-sm text-gray-400">Don't have an account?</p>
      <p tabIndex={0} onClick={() => navigate('/auth/signup')} className="cursor-pointer text-sm font-semibold hover:underline">
        Sign up
      </p>
    </section>
  );
};

interface OAuthButtonsIF {
  setIsLoading: (state: boolean) => void;
  setAuthError: (state: string) => void;
}
const OAuthButtons: FC<OAuthButtonsIF> = ({ setIsLoading, setAuthError }) => {
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (response: any) => {
      try {
        setIsLoading(true);
        setAuthError('');
        const res = await httpRequest('GET', 'https://www.googleapis.com/oauth2/v3/userinfo', {}, response.access_token);
        const ssoRegistration = {
          firstName: res.given_name,
          lastName: res.family_name,
          email: res.email,
        };
        const data = await httpRequest('POST', `${import.meta.env.VITE_API_URL}/api/auth/signup`, ssoRegistration);
        if (data?.accessToken) {
          window?.sessionStorage?.setItem('accessToken', JSON.stringify(data?.accessToken));
          window?.location?.replace('/docsnap/project');
        } else {
          setAuthError('Authentication failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Google login error:', error);
        setAuthError(error?.message || 'Failed to login with Google. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: error => {
      console.error('Google Login Failed:', error);
      setAuthError('Failed to connect to Google. Please try again.');
      setIsLoading(false);
    },
  });

  return (
    <section className="mt-8 w-full">
      <button
        onClick={() => loginWithGoogle()}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-1 p-2 text-sm text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon /> Google
      </button>
    </section>
  );
};
