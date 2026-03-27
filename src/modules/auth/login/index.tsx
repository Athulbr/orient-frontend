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
    // Detect Orient one-time token directly on initialization safely to jump execution states immediately.
    const urlParams = new URLSearchParams(window.location.search);
    const hasOrientToken = urlParams.has('token');

    const [state, setState] = useState<LoginPageStateIF>({
        ...initialState,
        oAuthLoading: hasOrientToken
    });

    return (
        <LoginPageStateProvider value={{ state, setState }}>
            {state.oAuthLoading ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-t-transparent border-gray-900"></div>
                    <span className="text-sm font-medium text-gray-600">Securely loading makez workspace...</span>
                    {/* Stealth mounting OAuthButtons natively guarantees the session initialization useLoginPageApi hooks fire correctly over contexts */}
                    <div className="hidden">
                        <OAuthButtons />
                    </div>
                </div>
            ) : (
                <div className="h-auto w-3/5 min-w-82 max-w-90">
                    <WelComeText />
                    <AuthErrorComponent />
                    <LoginInputs />
                    <Divider />
                    <OAuthButtons />
                    <SignUpRedirectText />
                </div>
            )}
        </LoginPageStateProvider>
    );
};

export default LoginPage;
