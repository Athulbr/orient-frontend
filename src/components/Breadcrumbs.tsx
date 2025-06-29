import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/twMerge';

interface BreadcrumbsIF {
  page: string;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsIF> = ({ page, className }) => {
  const navigate = useNavigate();
  let breadcrumbs: any = {};
  try {
    breadcrumbs = {
      listUser: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Users' }],
      listRole: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Roles' }],
      listPermission: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Permission' }],
      listComment: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Comments' }],
      listProject: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Projects' }],
      listFormbuilder: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Formbuilders' }],
      listTablebuilder: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Tablebuilders' }],
      listUpdatedField: [{ text: 'Config', path: '/config' }, { text: '/' }, { text: 'Updated Fields' }],
      viewRecord: [{ text: 'Docsnap', path: '/docsnap/record/list' }, { text: '/' }, { text: 'View Record' }],
      listTemplate: [{ text: 'Docsnap', path: '/docsnap/template/list' }, { text: '/' }, { text: 'Templates' }],
    };
  } catch (error) {
    console.error('error:===========', error);
  }

  // Config&nbsp;&nbsp;/&nbsp;&nbsp;Users
  return (
    <div className={cn('flex gap-2 pt-1 text-xs text-gray-500', className)}>
      {breadcrumbs[page].map((item: any, i: number) => {
        return (
          <div
            onClick={item.path ? () => navigate(item.path) : () => {}}
            key={i}
            className={cn(item.path ? 'cursor-pointer hover:text-blue-400' : 'cursor-default', className)}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
