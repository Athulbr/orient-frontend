import { FC } from 'react';
import GoogleIcon from '../../../../assets/svg-icons/GoogleIcon';
import Spinner from '../../../../components/Spinner';
import { useLoginPageApi } from '../../login/hooks/useLoginPageApi';
import { useLoginPageState } from '../../login/hooks/LoginPageStateProvider';
import MicrosoftLogin from '../../login/components/msal';
import ProfileContent from '../../login/components/profileContent';
import { Button } from '../../../../components/Button';

export const OAuthButtons: FC = () => {
    const { loginWithGoogle, loginWithMSAL } = useLoginPageApi();
    const { state } = useLoginPageState();
    return (
        <section className="mt-8 w-full gap-4">
            <Button className="w-full" outlined onClick={() => loginWithGoogle()} disabled={state.oAuthLoading}>
                <GoogleIcon /> Google {state.oAuthLoading && <Spinner size={16} />}
            </Button>
            <MicrosoftLogin>
                <ProfileContent data="auth" />
            </MicrosoftLogin>
        </section>
    );
};
