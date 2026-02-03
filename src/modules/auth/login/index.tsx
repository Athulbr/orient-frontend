import { FC, useEffect, useState } from 'react';
import { WelComeText } from './components/WelComeText';
import { LoginPageStateProvider } from './hooks/LoginPageStateProvider';
import { AuthErrorComponent } from './components/AuthErrorComponent';
import { Divider } from './components/Divider';
import { OAuthButtons } from './components/OAuthButtons';
import { SignUpRedirectText } from './components/SignUpRedirectText';
import { LoginInputs } from './components/LoginInputs';

export interface LoginPageStateIF {
    email: string;
    password: string;
    loading: boolean;
    oAuthLoading: boolean;
    authError: string;
    fieldError: {
        email: string;
        password: string;
    };
    isSubmitClicked: boolean;
}
const initialState = {
    email: '',
    password: '',
    loading: false,
    oAuthLoading: false,
    authError: '',
    fieldError: {
        email: '',
        password: ''
    },
    isSubmitClicked: false
};
const LoginPage: FC = () => {
    const [state, setState] = useState<LoginPageStateIF>(initialState);

    return (
        <LoginPageStateProvider value={{ state, setState }}>
            <div className="h-auto w-3/5 max-w-90 min-w-82">
                <WelComeText />
                <AuthErrorComponent />
                <LoginInputs />
                <Divider />
                <OAuthButtons />
                <SignUpRedirectText />
            </div>
        </LoginPageStateProvider>
    );
};

export default LoginPage;
