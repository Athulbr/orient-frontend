import { useEffect } from 'react';
import { useRoleState } from './hooks/roleContext';
import { useRolesApi } from './hooks/useRoleApi';

const LeftContainer: React.FC = () => {
  return <div>LeftContainer</div>;
};

const RightContainer: React.FC = () => {
  return <div>RightContainer</div>;
};

const ViewRoleComponent: React.FC = () => {
  const { state } = useRoleState();
  const { getRoleByIdApi } = useRolesApi();

  useEffect(() => {
    if (state.id) {
      getRoleByIdApi(state.id);
    }
  }, [state.id]);

  return (
    <div className="flex h-[calc(100vh-200px)]">
      <div className="w-1/2">
        <LeftContainer />
      </div>
      <div className="w-1/2">
        <RightContainer />
      </div>
    </div>
  );
};

export default ViewRoleComponent;
