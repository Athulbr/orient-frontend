import { useNavigate } from 'react-router-dom';
import { cn } from '../global-utils/twMerge';

interface BreadcrumbsIF {
  page: string;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsIF> = ({ page, className }) => {
  const navigate = useNavigate();
  let breadcrumbs: any = {};
  try {
    breadcrumbs = {
      listUser: [{ text: 'Settings' }, { text: '/' }, { text: 'Users' }],
      listRole: [{ text: 'Settings' }, { text: '/' }, { text: 'Roles' }],
      listPermission: [{ text: 'Settings' }, { text: '/' }, { text: 'Permission' }],
      listComment: [{ text: 'Settings' }, { text: '/' }, { text: 'Comments' }],
      listProject: [{ text: 'Settings' }, { text: '/' }, { text: 'Projects' }],
      listFormbuilder: [{ text: 'Settings' }, { text: '/' }, { text: 'Formbuilders' }],
      listTablebuilder: [{ text: 'Settings' }, { text: '/' }, { text: 'Tablebuilders' }],
      listUpdatedField: [{ text: 'Settings' }, { text: '/' }, { text: 'Updated Fields' }],
      listModule: [{ text: 'Settings' }, { text: '/' }, { text: 'Modules' }],
      listFeature: [{ text: 'Settings' }, { text: '/' }, { text: 'Features' }],
      listTenant: [{ text: 'Settings' }, { text: '/' }, { text: 'Tenants' }],
      listTemplate: [{ text: 'Settings' }, { text: '/' }, { text: 'Templates' }],
      listSubscriptionModel: [{ text: 'Settings' }, { text: '/' }, { text: 'Subscription Models' }],
      viewRecord: [{ text: 'Docsnap', path: '/docsnap/record/list' }, { text: '/' }, { text: 'View Record' }],
    };
  } catch (error) {
    console.error('error:===========', error);
  }

  return (
    <div className={cn('flex gap-2 pt-1 text-xs text-gray-500', className)}>
      {breadcrumbs[page].map((item: any, i: number) => {
        return (
          <div
            onClick={item.path ? () => navigate(item.path) : () => {}}
            key={i}
            className={cn(item.path ? 'cursor-pointer hover:text-blue-400' : 'cursor-default')}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
