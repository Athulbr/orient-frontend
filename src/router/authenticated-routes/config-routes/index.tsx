import { FC, Suspense, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import FullScreenLoader from '../../../components/FullScreenLoader';
import UpdatedFieldsListPage from '../../../modules/docsnap/prompt-tuning';
import { NotFoundPage } from '../../not-found-routes/GlobalNotFoundPage';
import FormbuilderRoutes from './FormbuilderRoutes';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import ListRolePage from '../../../modules/config/role';
import ListProjectPage from '../../../modules/docsnap/project';
import ListModulePage from '../../../modules/config/module';
import ListFeaturePage from '../../../modules/config/feature';
import ListSubscriptionModelPage from '../../../modules/config/subscriptionModel';
import ListTablebuilderPage from '../../../modules/config/tablebuilder';
import ListTenantPage from '../../../modules/config/tenant';
import { cn } from '../../../global-utils/twMerge';
import ListCommentPage from '../../../modules/docsnap/comment/ListCommentPage';
import ListUserPage from '../../../modules/config/user/list-user';
import {
  Book,
  BookText,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  MessageSquareText,
  Package,
  Receipt,
  Sheet,
  ShieldCheck,
  SquareTerminal,
  Star,
  UserRoundCheck,
  Users,
  Component as ComponentIcon, // Rename to avoid conflict
} from 'lucide-react';
import { usePermissionStore } from '../../../zustand-store/PermissionStore';
import UserPreferencePage from '../../../modules/config/workspace-settings/UserPreferencePage';

const ConfigRoutes = () => {
  const navigate = useNavigate();
  return (
    <PageContainer className="py-4">
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
              <Route path="/user/list" element={<ListUserPage />} />
              <Route path="/user-preference" element={<UserPreferencePage />} />
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
  const { settings } = usePermissionStore();

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  if (settings.length === 0) return <FullScreenLoader />;

  return (
    <div className="w-64 overflow-y-auto border">
      {settings.map(group => {
        return (
          <div key={group.name}>
            <div
              className="flex cursor-pointer items-center justify-between border-b bg-gray-100 py-5 pr-4 pl-6 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
              onClick={() => toggleGroup(group.name)}
            >
              <div className="flex items-center gap-3">
                {getIcon(group.iconName)}
                {group.name}
              </div>
              {collapsedGroups[group.name] ? <ChevronRight strokeWidth={1.5} size={16} /> : <ChevronDown strokeWidth={1.5} size={16} />}
            </div>
            {!collapsedGroups[group.name] &&
              group.items.map(item => {
                return (
                  <div
                    key={item.key}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 border-b py-5 pl-12 text-sm text-gray-600 transition-colors duration-200 hover:bg-sky-50 hover:text-sky-500',
                      window.location.pathname.split('/')[2] === item.key ? 'bg-sky-50 text-sky-500' : ''
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    {getIcon(item.iconName)}
                    {item.name}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Users':
      return <Users strokeWidth={1.5} size={18} />;
    case 'ShieldCheck':
      return <ShieldCheck strokeWidth={1.5} size={18} />;
    case 'Package':
      return <Package strokeWidth={1.5} size={18} />;
    case 'Star':
      return <Star strokeWidth={1.5} size={18} />;
    case 'UserRoundCheck':
      return <UserRoundCheck strokeWidth={1.5} size={18} />;
    case 'Receipt':
      return <Receipt strokeWidth={1.5} size={18} />;
    case 'CalendarCheck':
      return <CalendarCheck strokeWidth={1.5} size={18} />;
    case 'Component':
      return <ComponentIcon strokeWidth={1.5} size={18} />; // Use renamed import
    case 'BookText':
      return <BookText strokeWidth={1.5} size={18} />;
    case 'Sheet':
      return <Sheet strokeWidth={1.5} size={18} />;
    case 'Book':
      return <Book strokeWidth={1.5} size={18} />;
    case 'MessageSquareText':
      return <MessageSquareText strokeWidth={1.5} size={18} />;
    case 'SquareTerminal':
      return <SquareTerminal strokeWidth={1.5} size={18} />;
    default:
      return null;
  }
};
