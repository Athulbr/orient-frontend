import { FC } from 'react';
import GoogleIcon from '../../../../assets/svg-icons/GoogleIcon';
import { useLoginPageApi } from '../hooks/useLoginPageApi';
import Spinner from '../../../../components/Spinner';
import { useLoginPageState } from '../hooks/LoginPageStateProvider';
import MSIcon from '../../../../assets/svg-icons/MSIcon';
import ProfileContent from './profileContent';

export const OAuthButtons: FC = () => {
  const { loginWithGoogle, loginWithMSAL } = useLoginPageApi();
  const { state } = useLoginPageState();
  return (
    <section className="mt-8 w-full">
      <button
        onClick={() => loginWithGoogle()}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-1 p-2 text-sm text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon /> Google {state.oAuthLoading && <Spinner size={16} />}
      </button>

      <button
        onClick={() => loginWithMSAL()}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-1 p-2 text-sm text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MSIcon /> Microsoft {state.oAuthLoading && <Spinner size={16} />}
        {/* {<ProfileContent data="auth" />} */}
      </button>
    </section>
  );
};
