import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import FullScreenLoader from '../../components/FullScreenLoader';
import AuthLayoutComponent from '../../modules/auth/AuthLayout';

const LoginPage = lazy(() => import('../../modules/auth/login'));
const SignUpPage = lazy(() => import('../../modules/auth/signup'));
const ConfirmSignUpPage = lazy(() => import('../../modules/auth/confirm-signup'));

const AuthRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <AuthLayoutComponent>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
