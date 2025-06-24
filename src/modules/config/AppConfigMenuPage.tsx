import { BookText, Cog, Component, ListOrdered, MessageSquareText, Sheet, UserRoundCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageNameComponent from '../../components/PageName';
import PageContainer from '../../components/PageContainer';
import { useState } from 'react';

interface WorkspaceSettingsPageIF {
  test?: string;
}

const WorkspaceSettingsPage: React.FC<WorkspaceSettingsPageIF> = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('user');
  return (
    <PageContainer>
      <PageNameComponent name="Workspace Settings" showBackButton />
      <div className="mt-2 flex h-full w-full border-y border-r">
        <div className="h-full w-64 border-x border-b">
          {utils.map(item => (
            <div
              key={item.key}
              className={`flex cursor-pointer items-center gap-3 border-b py-5 pl-6 text-sm text-gray-600 transition-colors duration-200 hover:bg-sky-50 hover:text-sky-500 ${active === item.key ? 'bg-sky-50 text-sky-500' : ''}`}
              onClick={() => setActive(item.key)}
            >
              <item.icon strokeWidth={1.5} className="" size={18} />
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default WorkspaceSettingsPage;

{
  /* <section className="mt-5 flex flex-col gap-4 p-2">
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
      </section> */
}

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
    path: '/docsnap/project/list',
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
    icon: Cog,
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
