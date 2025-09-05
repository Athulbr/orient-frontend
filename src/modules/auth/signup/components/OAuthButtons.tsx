import { FC } from 'react';
import GoogleIcon from '../../../../assets/svg-icons/GoogleIcon';
import Spinner from '../../../../components/Spinner';
import { Button } from '../../../../components/Button';
import { useSignupPageApi } from '../hooks/useSignupPageApi';
import { useSignupPageState } from '../hooks/SignupPageStateProvider';
import MicrosoftLogin from './msal';
import ProfileContent from './profileContent';

export const OAuthButtons: FC = () => {
    const { signupWithGoogle } = useSignupPageApi();
    const { state } = useSignupPageState();
    return (
        <section className="mt-8 flex w-full gap-4">
            <Button className="w-full" outlined onClick={() => signupWithGoogle()} disabled={state.oAuthLoading}>
                <GoogleIcon /> Google {state.oAuthLoading && <Spinner size={16} />}
            </Button>
            <MicrosoftLogin>
                <ProfileContent data="auth" />
            </MicrosoftLogin>
        </section>
    );
};
