import { useNavigate } from 'react-router-dom';

interface BreadcrumbsIF {
  page: string;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsIF> = ({ page, className }) => {
  const navigate = useNavigate();
  const breadcrumbs: any = {
    listUser: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Users' }],
    listRole: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Roles' }],
    listPermission: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Permissions' }],
    listComment: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Comments' }],
    listProject: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Projects' }],
    listFormbuilder: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Formbuilders' }],
    listTablebuilder: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Tablebuilders' }],
    listUpdatedField: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Updated Fields' }],
    viewRecord: [{ text: 'Docsnap', path: '/docsnap/record/list' }, { text: '/' }, { text: 'View Record' }],
  };
  // Config&nbsp;&nbsp;/&nbsp;&nbsp;Users
  return (
    <div className={`flex gap-2 pt-1 text-xs text-gray-500 ${className}`}>
      {breadcrumbs[page].map((item: any, i: number) => {
        return (
          <div
            onClick={item.path ? () => navigate(item.path) : () => {}}
            key={i}
            className={`${item.path ? 'cursor-pointer hover:text-blue-400' : 'cursor-default'}`}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
