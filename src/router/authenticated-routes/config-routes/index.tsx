import { Suspense } from 'react';
import { Book, BookText, Component, ListOrdered, MessageSquareText, Sheet, SquareTerminal, Star, UserRoundCheck, Users } from 'lucide-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import TablebuilderRoutes from './TablebuilderRoutes';
import FullScreenLoader from '../../../components/FullScreenLoader';
import UpdatedFieldsListPage from '../../../modules/docsnap/prompt-tuning';
import { NotFoundPage } from '../../not-found-routes/GlobalNotFoundPage';
import FormbuilderRoutes from './FormbuilderRoutes';
import UserRoutes from '../UserRoutes';
import ListCommentPage from '../../../modules/config/comment/ListCommentPage';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import ListRolePage from '../../../modules/config/role';
import ListPermissionPage from '../../../modules/config/permission/ListPermissionPage';
import ListProjectPage from '../../../modules/docsnap/project';
import ListModulePage from '../../../modules/config/module';
import ListFeaturePage from '../../../modules/config/feature';

const ConfigRoutes = () => {
  const navigate = useNavigate();
  return (
    <PageContainer className="py-6">
      <PageNameComponent className="p-4 pt-0" customGoBackFunction={() => navigate('/')} name="Settings" showBackButton />
      <div className="mt-2 flex w-full flex-1 overflow-hidden">
        <div className="w-64 border">
          {utils.map(item => (
            <div
              key={item.key}
              className={`flex cursor-pointer items-center gap-3 border-b py-5 pl-6 text-sm text-gray-600 transition-colors duration-200 hover:bg-sky-50 hover:text-sky-500 ${window.location.pathname.split('/')[2] === item.key ? 'bg-sky-50 text-sky-500' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon strokeWidth={1.5} className="" size={18} />
              {item.name}
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-6 pl-4">
          <Suspense fallback={<FullScreenLoader />}>
            <Routes>
              <Route path="/role/list" element={<ListRolePage />} />
              <Route path="/feature/list" element={<ListFeaturePage />} />
              <Route path="/module/list" element={<ListModulePage />} />
              <Route path="/permission/list" element={<ListPermissionPage />} />
              <Route path="/formbuilder/*" element={<FormbuilderRoutes />} />
              <Route path="/tablebuilder/*" element={<TablebuilderRoutes />} />
              <Route path="/project/list" element={<ListProjectPage />} />
              <Route path="/prompt-tuning" element={<UpdatedFieldsListPage />} />
              <Route path="/user/*" element={<UserRoutes />} />
              <Route path="/comment/*" element={<ListCommentPage />} />
              {/* <Route path="/" element={<AppConfigMenuPage />} /> */}
              <Route path="/*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
};

export default ConfigRoutes;

const utils = [
  {
    name: 'Users',
    icon: Users,
    path: '/config/user/list',
    key: 'user',
  },
  {
    name: 'Projects',
    icon: ListOrdered,
    path: '/config/project/list',
    key: 'project',
  },
  {
    name: 'Modules',
    icon: Book,
    path: '/config/module/list',
    key: 'module',
  },
  {
    name: 'Features',
    icon: Star,
    path: '/config/feature/list',
    key: 'feature',
  },
  {
    name: 'Roles',
    icon: UserRoundCheck,
    path: '/config/role/list',
    key: 'role',
  },
  {
    name: 'Formbuilder',
    icon: BookText,
    path: '/config/formbuilder/list',
    key: 'formbuilder',
  },
  {
    name: 'Tablebuilder',
    icon: Sheet,
    path: '/config/tablebuilder/list',
    key: 'tablebuilder',
  },
  {
    name: 'Prompt Tuning',
    icon: SquareTerminal,
    path: '/config/prompt-tuning',
    key: 'promptTuning',
  },
  {
    name: 'Comments',
    icon: MessageSquareText,
    path: '/config/comment',
    key: 'comment',
  },
];
