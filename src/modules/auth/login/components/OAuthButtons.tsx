import { FC } from 'react';
import GoogleIcon from '../../../../assets/svg-icons/GoogleIcon';
import { useLoginPageApi } from '../hooks/useLoginPageApi';
import Spinner from '../../../../components/Spinner';
import { useLoginPageState } from '../hooks/LoginPageStateProvider';
import MSIcon from '../../../../assets/svg-icons/MSIcon';
import { Button } from '../../../../components/Button';

export const OAuthButtons: FC = () => {
  const { loginWithGoogle, loginWithMSAL } = useLoginPageApi();
  const { state } = useLoginPageState();
  // const isAuthenticated = useIsAuthenticated();

  return (
    <section className="mt-8 flex w-full gap-4">
      <Button className="w-full" outlined onClick={() => loginWithGoogle()} disabled={state.oAuthLoading}>
        <GoogleIcon /> Google {state.oAuthLoading && <Spinner size={16} />}
      </Button>
      <Button className="w-full" outlined onClick={() => loginWithMSAL()} disabled={state.oAuthLoading}>
        <MSIcon /> Microsoft {state.oAuthLoading && <Spinner size={16} />}
      </Button>
    </section>
  );
};
