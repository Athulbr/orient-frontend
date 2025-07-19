import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import httpRequest from '../../../global-utils/httpRequest';
import Spinner from '../../../components/Spinner';

interface ConfirmSignUpPageIF {
  test?: string;
}

const ConfirmSignUpPage: React.FC<ConfirmSignUpPageIF> = () => {
  const { email, otp } = useParams();

  const verifyOtp = () => {
    const res: any = httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/user/trial/verify`, { email, otp });
    if (res.success) {
      console.log('res:===========', res);
    }
  };

  useEffect(() => {
    if (!email || !otp) return;
    verifyOtp();
  }, [email, otp]);

  return (
    <div className="mt-10 w-full max-w-md space-y-6 rounded-xl bg-white p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
        <p className="mt-2 text-gray-600">We're verifying your email address</p>
      </div>

      <div className="space-y-4">
        {email && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">Email Address</p>
            <p className="mt-1 text-blue-700">{email}</p>
          </div>
        )}

        {otp && (
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">Verification Code</p>
            <p className="mt-1 font-mono tracking-wider text-green-700">{otp}</p>
          </div>
        )}

        <div className="pt-4">
          <div className="flex items-center justify-center">
            {/* <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div> */}
            <Spinner size={20} />
          </div>
          <p className="mt-3 text-center text-sm text-gray-500">Verifying your information...</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSignUpPage;
