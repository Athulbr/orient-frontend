import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../components/FullScreenLoader';
import AuthLayoutComponent from '../../modules/auth/AuthLayout';
// import SignUpPage from '../../modules/auth/SignUpPage';
// import LoginPage from '../../modules/auth/LoginPage';

const LoginPage = lazy(() => import('../../modules/auth/LoginPage'));
const SignUpPage = lazy(() => import('../../modules/auth/SignUpPage'));

const AuthRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <AuthLayoutComponent>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </AuthLayoutComponent>
    </Suspense>
  );
};

export default AuthRoutes;
