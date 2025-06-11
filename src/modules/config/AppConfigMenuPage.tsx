import { BookText, ChartArea, Cog, Component, FormInput, ListOrdered, MessageSquareText, Sheet, UserRoundCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageNameComponent from '../../components/PageName';
import PageContainer from '../../components/PageContainer';

interface AppConfigMenuPageIF {
  test?: string;
}

const AppConfigMenuPage: React.FC<AppConfigMenuPageIF> = () => {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <PageNameComponent name="App Configuration" />
      <section className="mt-5 flex flex-col gap-4 p-2">
        <span className="pl-2 text-sm">Utils</span>
        <div className="flex flex-wrap gap-6">
          {utils.map(item => (
            <div
              key={item.key}
              onClick={() => navigate(item.path)}
              className="flex h-28 w-30 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-300 hover:border-sky-400 hover:bg-sky-50"
            >
              {item.icon}
              <span className="text-sm text-gray-600 peer-hover:text-red-200">{item.name}</span>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
};

export default AppConfigMenuPage;

const utils = [
  {
    name: 'Users',
    icon: <Users strokeWidth={1} className="text-gray-400" size={60} />,
    path: '/config/user/list',
    key: 'user',
  },
  {
    name: 'Projects',
    icon: <ListOrdered strokeWidth={1} className="text-gray-400" size={60} />,
    path: '/docsnap/project/list',
    key: 'project',
  },
  {
    name: 'Roles',
    icon: <UserRoundCheck strokeWidth={1} className="text-gray-400" size={60} />,
    path: '/config/role/list',
    key: 'role',
  },
  {
    name: 'Permissions',
    icon: <Component strokeWidth={1} className="text-gray-400" size={60} />,
    path: '/config/permission/list',
    key: 'permission',
  },
  {
    name: 'Formbuilder',
    icon: <BookText strokeWidth={1} className="text-gray-400" size={60} />,
    path: '/config/formbuilder/list',
    key: 'formbuilder',
  },
  {
    name: 'Tablebuilder',
    icon: <Sheet strokeWidth={1} className="text-gray-400" size={60} />,
    path: '/config/tablebuilder/list',
    key: 'tablebuilder',
  },
  {
    name: 'Prompt Tuning',
    icon: <Cog strokeWidth={1} className="text-gray-400" size={60} />,
    path: '/config/prompt-tuning',
    key: 'promptTuning',
  },
  {
    name: 'Comments',
    icon: <MessageSquareText strokeWidth={1} className="text-gray-400" size={60} />,
    path: '/config/comment',
    key: 'comment',
  },
];
