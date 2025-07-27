import { useRoleState } from './hooks/roleContext';

const LeftContainer: React.FC = () => {
  const { state } = useRoleState();

  return <div>LeftContainer</div>;
};

const RightContainer: React.FC = () => {
  const { state } = useRoleState();

  const subscriptionModelFeatures = state.subscriptionModel?.features.map((featureId: any) => {
    return state.features.find((feature: any) => feature._id === featureId);
  });

  console.log('subscriptionModelFeatures:===========', subscriptionModelFeatures);

  if (!subscriptionModelFeatures) return null;

  return (
    <div>
      <div className="">
        {subscriptionModelFeatures.map((feature: any) => {
          return <div key={feature._id}>{feature.name}</div>;
        })}
      </div>
    </div>
  );
};

const ViewRoleComponent: React.FC = () => {
  const { state } = useRoleState();

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
