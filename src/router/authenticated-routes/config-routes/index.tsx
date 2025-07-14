import { FC, Suspense, useState } from 'react';
import {
  Book,
  BookText,
  Component,
  ListOrdered,
  MessageSquareText,
  Sheet,
  SquareTerminal,
  Star,
  UserRoundCheck,
  Users,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Package,
  Receipt,
  CalendarCheck,
} from 'lucide-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import FullScreenLoader from '../../../components/FullScreenLoader';
import UpdatedFieldsListPage from '../../../modules/docsnap/prompt-tuning';
import { NotFoundPage } from '../../not-found-routes/GlobalNotFoundPage';
import FormbuilderRoutes from './FormbuilderRoutes';
import UserRoutes from '../UserRoutes';
import ListCommentPage from '../../../modules/config/comment/ListCommentPage';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import ListRolePage from '../../../modules/config/role';
import ListProjectPage from '../../../modules/docsnap/project';
import ListModulePage from '../../../modules/config/module';
import ListFeaturePage from '../../../modules/config/feature';
import ListSubscriptionModelPage from '../../../modules/config/subscriptionModel';
import ListTablebuilderPage from '../../../modules/config/tablebuilder';
import ListTenantPage from '../../../modules/config/tenant';

const ConfigRoutes = () => {
  const navigate = useNavigate();
  return (
    <PageContainer className="py-6">
      <PageNameComponent className="p-4 pt-0" customGoBackFunction={() => navigate('/')} name="Settings" showBackButton />
      <div className="flex w-full flex-1 overflow-hidden">
        <NavigationComponent />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto border-t pt-2 pr-6 pl-4">
          <Suspense fallback={<FullScreenLoader />}>
            <Routes>
              <Route path="/role/list" element={<ListRolePage />} />
              <Route path="/subscription-model/list" element={<ListSubscriptionModelPage />} />
              <Route path="/feature/list" element={<ListFeaturePage />} />
              <Route path="/tenant/list" element={<ListTenantPage />} />
              <Route path="/module/list" element={<ListModulePage />} />
              <Route path="/formbuilder/*" element={<FormbuilderRoutes />} />
              <Route path="/tablebuilder/list" element={<ListTablebuilderPage />} />
              <Route path="/project/list" element={<ListProjectPage />} />
              <Route path="/prompt-tuning" element={<UpdatedFieldsListPage />} />
              <Route path="/user/*" element={<UserRoutes />} />
              <Route path="/comment/*" element={<ListCommentPage />} />
              <Route path="/*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
};

export default ConfigRoutes;

const NavigationComponent: FC = () => {
  const navigate = useNavigate();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <div className="w-64 overflow-y-auto border">
      {settings.map(group => (
        <div key={group.name}>
          <div
            className="flex cursor-pointer items-center justify-between border-b bg-gray-100 py-5 pr-4 pl-6 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
            onClick={() => toggleGroup(group.name)}
          >
            <div className="flex items-center gap-3">
              <group.icon strokeWidth={1.5} className="" size={18} />
              {group.name}
            </div>
            {collapsedGroups[group.name] ? <ChevronRight strokeWidth={1.5} size={16} /> : <ChevronDown strokeWidth={1.5} size={16} />}
          </div>
          {!collapsedGroups[group.name] &&
            group.items.map(item => {
              return (
                <div
                  key={item.key}
                  className={`flex cursor-pointer items-center gap-3 border-b py-5 pl-12 text-sm text-gray-600 transition-colors duration-200 hover:bg-sky-50 hover:text-sky-500 ${window.location.pathname.split('/')[2] === item.key ? 'bg-sky-50 text-sky-500' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon strokeWidth={1.5} fill={window.location.pathname.split('/')[2] === item.key ? 'white' : 'none'} className="" size={18} />
                  {item.name}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
};

const settings = [
  {
    name: 'User Management',
    icon: Users,
    items: [
      {
        name: 'Users',
        icon: Users,
        path: '/config/user/list',
        key: 'user',
      },
    ],
  },
  {
    name: 'Role & Permissions',
    icon: ShieldCheck,
    items: [
      {
        name: 'Modules',
        icon: Package,
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
    ],
  },
  {
    name: 'Billing & Subscriptions',
    icon: Receipt,
    items: [
      {
        name: 'Tenants',
        icon: CalendarCheck,
        path: '/config/tenant/list',
        key: 'tenant',
      },
      {
        name: 'Subscription Models',
        icon: CalendarCheck,
        path: '/config/subscription-model/list',
        key: 'subscription-model',
      },
    ],
  },

  {
    name: 'Builder Tools',
    icon: Component,
    items: [
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
    ],
  },
  {
    name: 'Docsnap',
    icon: Book,
    items: [
      {
        name: 'Projects',
        icon: ListOrdered,
        path: '/config/project/list',
        key: 'project',
      },

      {
        name: 'Comments',
        icon: MessageSquareText,
        path: '/config/comment',
        key: 'comment',
      },
      {
        name: 'Prompt Tuning',
        icon: SquareTerminal,
        path: '/config/prompt-tuning',
        key: 'promptTuning',
      },
    ],
  },
];
