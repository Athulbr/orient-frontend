import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import FullScreenLoader from '../../components/FullScreenLoader';
import AuthLayoutComponent from '../../modules/auth/AuthLayout';
import ForgotPasswordPage from '../../modules/auth/forgot-password';
import ConfirmForgotPasswordPage from '../../modules/auth/confirm-forgot-password';

const LoginPage = lazy(() => import('../../modules/auth/login'));
const SignUpPage = lazy(() => import('../../modules/auth/signup'));
const ConfirmSignUpPage = lazy(() => import('../../modules/auth/confirm-signup'));

const AuthRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <AuthLayoutComponent>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/verify/:email/:token" element={<ConfirmForgotPasswordPage />} />
          <Route path="/signup/verify/:email/:token" element={<ConfirmSignUpPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </AuthLayoutComponent>
    </Suspense>
  );
};

export default AuthRoutes;
