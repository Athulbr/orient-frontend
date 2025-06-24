import { Suspense, lazy, useState } from 'react';
import { BookText, Cog, Component, ListOrdered, MessageSquareText, Sheet, SquareTerminal, UserRoundCheck, Users } from 'lucide-react';

import { Route, Routes, useNavigate } from 'react-router-dom';
import TablebuilderRoutes from './TablebuilderRoutes';
import RoleRoutes from './RoleRoutes';
import FullScreenLoader from '../../../components/FullScreenLoader';
import UpdatedFieldsListPage from '../../../modules/docsnap/prompt-tuning';
import { NotFoundPage } from '../../not-found-routes/GlobalNotFoundPage';
import FormbuilderRoutes from './FormbuilderRoutes';
import PermissionRoutes from './PermissionRoutes';
import UserRoutes from '../UserRoutes';
import ListCommentPage from '../../../modules/config/comment/ListCommentPage';
import AppConfigMenuPage from '../../../modules/config/AppConfigMenuPage';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import ListRolePage from '../../../modules/config/role';
import ListPermissionPage from '../../../modules/config/permission/ListPermissionPage';
import ListProjectPage from '../../../modules/docsnap/project';

const ConfigRoutes = () => {
  const navigate = useNavigate();
  console.log('window.location.pathname:===========', window.location.pathname.split('/')[2]);
  return (
    <PageContainer className="p-6">
      <PageNameComponent customGoBackFunction={() => navigate('/')} name="Workspace Settings" showBackButton />
      <div className="mt-2 flex w-full flex-1 overflow-hidden border-y border-r">
        <div className="w-64 border-x">
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
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/role/list" element={<ListRolePage />} />
            <Route path="/permission/list" element={<ListPermissionPage />} />
            <Route path="/formbuilder/*" element={<FormbuilderRoutes />} />
            <Route path="/tablebuilder/*" element={<TablebuilderRoutes />} />
            <Route path="/project/list" element={<ListProjectPage />} />
            <Route path="/prompt-tuning" element={<UpdatedFieldsListPage />} />
            <Route path="/user/*" element={<UserRoutes />} />
            <Route path="/comment/*" element={<ListCommentPage />} />
            <Route path="/" element={<AppConfigMenuPage />} />
            <Route path="/*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
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
    name: 'Roles',
    icon: UserRoundCheck,
    path: '/config/role/list',
    key: 'role',
  },
  {
    name: 'Permissions',
    icon: Component,
    path: '/config/permission/list',
    key: 'permission',
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
