import { Bell, CircleUserRound, Edit, LogOut, ShieldCheck, User, UserCircle } from 'lucide-react';
import { Button } from '../../../../components/Button';
import { cn } from '../../../../global-utils/twMerge';
import { useEffect, useState } from 'react';
import { useUserAccountApi } from './hooks/useUserAccountApi';
import { useParams } from 'react-router-dom';
import { useUserAccountState } from './hooks/userAccountContext';
import { DialogComponent } from '../../../../components/DialogComponent';
import DragAndDropFileInput from '../../../../components/DragAndDropFileInput';
import { UseFormbuilder } from '../../../../builders/formbuilder/use-formbuilder';
import { FieldIF } from '../../../../builders/formbuilder/interface';
interface UserDetailsComponentIF {
  test?: string;
}

export const UserDetailsComponent: React.FC<UserDetailsComponentIF> = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const { id } = useParams();
  const { logout, getUserApi } = useUserAccountApi();

  useEffect(() => {
    if (!id) return;
    getUserApi(id);
  }, [id]);
  const onClickNavItem = (name: string, index: number) => {
    setActiveIndex(index);
    if (name === 'Logout') logout();
  };

  const handleUpload = () => {};
  return (
    <div className="h-full w-full p-6 pt-0">
      <div className="flex h-full w-full gap-4">
        {/* Left */}
        <div className="flex w-full max-w-100 flex-col items-center gap-4 overflow-hidden px-4">
          <div className="h-[20vh] min-h-50 w-[20vh] min-w-50 rounded-full bg-slate-200 p-[2vh]">
            <CircleUserRound strokeWidth={1.4} className="h-full w-full text-gray-400" />
          </div>
          <Button onClick={() => setOpenDialog(true)}>Update Profile Picture</Button>
          <nav className="flex w-full flex-1 flex-col overflow-hidden">
            <ul className="flex flex-col items-center overflow-y-auto border">
              {navItems.map((item, index) => (
                <li
                  key={index}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 border-b p-5 hover:bg-sky-50',
                    activeIndex === index && 'bg-sky-50 text-sky-500'
                  )}
                  onClick={() => onClickNavItem(item.name, index)}
                >
                  <item.icon size={16} /> {item.name}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Right */}
        <div className="flex w-full flex-col gap-4 rounded-lg p-4 shadow-lg">{navItems[activeIndex].component}</div>
      </div>
      <DialogComponent secondaryButtonText="Cancel" primaryButtonText="Save" isOpen={openDialog} closeDialog={() => setOpenDialog(false)}>
        <div className="flex h-[50vh] w-[50vw] flex-col gap-4 rounded-lg p-4 shadow-lg">
          <DragAndDropFileInput onFileDrop={handleUpload} />
        </div>
      </DialogComponent>
    </div>
  );
};

const BasicDetails = () => {
  const { state } = useUserAccountState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const onSubmit = (fields: FieldIF[]) => {
    console.log('fields:===========', fields);
  };
  return (
    <>
      <DetailsCard>
        <DetailsCardItem label="First Name" value={state.user?.firstName} />
        <DetailsCardItem label="Last Name" value={state.user?.lastName} />
        <Edit onClick={() => setDialogOpen(true)} className="absolute top-4 right-4 cursor-pointer hover:text-sky-500" size={18} />
      </DetailsCard>
      <DetailsCard>
        <DetailsCardItem label="Email" value={state.user?.email} />
        <DetailsCardItem label="Role" value={state.user?.role} />
        <DetailsCardItem label="Account Status" value={state.user?.active ? 'Active' : 'Inactive'} />
        <DetailsCardItem label="Email Verification" value={state.user?.verified ? 'Verified' : 'Not Verified'} />
        <DetailsCardItem label="Member Since" value={formatDateString(state.user?.createdAt)} />
        <DetailsCardItem label="Last Login" value={formatDateString(state.user?.lastLogin)} />
      </DetailsCard>
      <UseFormbuilder
        title="Edit Name"
        existingData={state.user || {}}
        className="w-100"
        name="Update User Name Form"
        isOpen={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
        onSubmit={onSubmit}
      />
    </>
  );
};
const Security = () => {
  const { state } = useUserAccountState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const onSubmit = (fields: FieldIF[]) => {
    console.log('fields:===========', fields);
  };
  return (
    <DetailsCard>
      <DetailsCardItem label="Password" value="********" />
      <Edit onClick={() => setDialogOpen(true)} className="absolute top-4 right-4 cursor-pointer hover:text-sky-500" size={18} />
      <UseFormbuilder
        title="Update Password"
        existingData={state.user || {}}
        className="w-100"
        name="Update Password Form"
        isOpen={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
        onSubmit={onSubmit}
      />
    </DetailsCard>
  );
};
const Subscription = () => {
  return (
    <DetailsCard>
      <DetailsCardItem label="Subscription" value="Free Plan" />
      <Edit className="absolute top-4 right-4 cursor-pointer hover:text-sky-500" size={18} />
    </DetailsCard>
  );
};
const Notifications = () => {
  return (
    <DetailsCard>
      <DetailsCardItem label="Notification" value="On" />
      <Edit className="absolute top-4 right-4 cursor-pointer hover:text-sky-500" size={18} />
    </DetailsCard>
  );
};

const DetailsCard = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative flex w-full flex-wrap items-center gap-8 rounded-lg border p-6">{children}</div>;
};
const DetailsCardItem = ({ label, value }: { label: string; value: string }) => {
  const { state } = useUserAccountState();
  return (
    <div className="flex w-[46%] flex-col gap-2">
      <span className="text-sm font-semibold text-gray-500">{label}</span>
      <span className={`relative text-gray-600`}>
        {state.loadingUser ? <span className="absolute top-0 left-0 h-6 w-30 animate-pulse rounded-sm bg-gray-200"></span> : value}
        &nbsp;
      </span>
    </div>
  );
};

const navItems = [
  {
    name: 'Basic Details',
    icon: Edit,
    component: <BasicDetails />,
  },
  {
    name: 'Security',
    icon: ShieldCheck,
    component: <Security />,
  },
  {
    name: 'Subscription',
    icon: ShieldCheck,
    component: <Subscription />,
  },
  {
    name: 'Notifications',
    icon: Bell,
    component: <Notifications />,
  },
  {
    name: 'Logout',
    icon: LogOut,
    component: <BasicDetails />,
  },
];

const formatDateString = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
