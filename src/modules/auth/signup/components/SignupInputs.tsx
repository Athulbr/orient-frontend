import { error } from 'console';
import { Button } from '../../../../components/Button';
import { MuiPasswordTextField } from '../../../../components/MuiPasswordTextField';
import { MuiTextField } from '../../../../components/MuiTextField';
import Spinner from '../../../../components/Spinner';
import { useSignupPageState } from '../hooks/SignupPageStateProvider';
import { useNavigate } from 'react-router-dom';
import { useSignupPageApi } from '../hooks/useSignupPageApi';

interface SignupInputsIF {
  test?: string;
}

export const SignupInputs: React.FC<SignupInputsIF> = () => {
  const { state, setState } = useSignupPageState();
  const navigate = useNavigate();
  const { signupWithEmailAndPassword } = useSignupPageApi();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      signupWithEmailAndPassword();
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <MuiTextField
          errorMessage={state.fieldError.firstName}
          label="First Name"
          value={state.firstName}
          onChange={e => setState(prev => ({ ...prev, firstName: e.target.value }))}
          className="-webkit-text-fill-color: #fff"
          onKeyDown={handleKeyDown}
        />
        <MuiTextField
          errorMessage={state.fieldError.lastName}
          label="Last Name"
          value={state.lastName}
          onChange={e => setState(prev => ({ ...prev, lastName: e.target.value }))}
          className="-webkit-text-fill-color: #fff"
          onKeyDown={handleKeyDown}
        />
      </div>
      <MuiTextField
        errorMessage={state.fieldError.email}
        label="Email"
        value={state.email}
        onChange={e => setState(prev => ({ ...prev, email: e.target.value }))}
        className="-webkit-text-fill-color: #fff"
        onKeyDown={handleKeyDown}
      />
      <MuiPasswordTextField
        errorMessage={state.fieldError.password}
        label="Password"
        value={state.password}
        onChange={e => setState(prev => ({ ...prev, password: e.target.value }))}
        onKeyDown={handleKeyDown}
      />
      <MuiPasswordTextField
        errorMessage={state.fieldError.confirmPassword}
        label="ConfirmPassword"
        value={state.confirmPassword}
        onChange={e => setState(prev => ({ ...prev, confirmPassword: e.target.value }))}
        onKeyDown={handleKeyDown}
      />
      <p
        tabIndex={0}
        // onClick={() => navigate('/auth/forgot-password')}
        className="flex w-fit items-center gap-2 p-2 text-[12px] text-gray-400 hover:text-gray-700 active:border-gray-400 active:outline-gray-400"
      >
        <input
          checked={state.termsOfService}
          onChange={e => setState(prev => ({ ...prev, termsOfService: e.target.checked }))}
          type="checkbox"
          id="checkbox"
          className="cursor-pointer"
        />
        <label htmlFor="checkbox" className="cursor-pointer text-gray-400">
          I agree to the
        </label>
        <span className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline">Terms of Service</span> and
        <span className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline">Privacy Policy</span>
      </p>
      <Button disabled={!state.termsOfService || state.loading} onClick={signupWithEmailAndPassword} className="bg-foreground-800 mt-2">
        {state.loading && <Spinner size={16} />} {state.loading ? 'SIGNING UP...' : 'SIGN UP'}
      </Button>
    </div>
  );
};
