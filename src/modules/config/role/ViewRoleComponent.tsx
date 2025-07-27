import React, { useEffect, useState } from 'react';
import { ChevronDown, Search, Package, Users, FileText, Settings, AlertCircle } from 'lucide-react';
import { useRoleState } from './hooks/roleContext';
import { useRolesApi } from './hooks/useRoleApi';
import { useToastStore } from '../../../components/toast/ToastStore';
import { Button } from '../../../components/Button';

// Type definitions
interface Module {
  _id: string;
  key: string;
  name: string;
  order: number;
}

interface Feature {
  _id: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
  isBeta: boolean;
  moduleId: string;
  deleted: boolean;
}

// Utility functions
const getModuleIcon = (moduleKey: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    user: Users,
    docsnap: FileText,
    promate: Settings,
  };
  return iconMap[moduleKey] || Package;
};

// Components
interface FeatureCardProps {
  feature: Feature;
  isAssigned: boolean;
  onAssign: (featureId: string) => void;
  onUnassign: (featureId: string) => void;
  showActionButton?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, isAssigned, onAssign, onUnassign, showActionButton = true }) => {
  const handleClick = () => {
    if (isAssigned) {
      onUnassign(feature._id);
    } else {
      onAssign(feature._id);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="mb-1 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">{feature.name}</h3>
          {feature.isBeta && <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 text-xs font-medium text-white">Beta</span>}
        </div>
        {showActionButton && (
          <button
            onClick={handleClick}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 ${
              isAssigned ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isAssigned ? 'Remove' : 'Assign'}
          </button>
        )}
      </div>
      {feature.description && <p className="mt-1 text-xs text-slate-500">{feature.description}</p>}
    </div>
  );
};

interface ModuleAccordionProps {
  module: Module;
  features: Feature[];
  assignedFeatureIds: string[];
  onAssign: (featureId: string) => void;
  onUnassign: (featureId: string) => void;
  showActionButtons?: boolean;
}

const ModuleAccordion: React.FC<ModuleAccordionProps> = ({ module, features, assignedFeatureIds, onAssign, onUnassign, showActionButtons = true }) => {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = getModuleIcon(module.key);

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon size={16} />
          </div>
          <h2 className="font-medium text-slate-800">{module.name}</h2>
          <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {features.length} {features.length === 1 ? 'feature' : 'features'}
          </span>
        </div>
        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="space-y-3 p-4 pt-0">
          {features.map(feature => (
            <FeatureCard
              key={feature._id}
              feature={feature}
              isAssigned={assignedFeatureIds.includes(feature._id)}
              onAssign={onAssign}
              onUnassign={onUnassign}
              showActionButton={showActionButtons}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SearchInput: React.FC<{ value: string; onChange: (value: string) => void; placeholder: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative mb-4">
    <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
    />
  </div>
);

const EmptyState: React.FC<{ searchTerm: string; type: 'assigned' | 'available' }> = ({ searchTerm, type }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
    <AlertCircle size={40} className="mb-2 text-slate-300" />
    <h3 className="mb-1 text-sm font-medium text-slate-700">{searchTerm ? `No ${type} features match "${searchTerm}"` : `No ${type} features`}</h3>
    <p className="text-xs text-slate-500">
      {searchTerm
        ? "Try adjusting your search or filter to find what you're looking for."
        : type === 'assigned'
          ? 'Assign features from the available features list.'
          : 'All available features have been assigned.'}
    </p>
  </div>
);

const LeftContainer: React.FC = () => {
  const { state, setState } = useRoleState();
  const [searchTerm, setSearchTerm] = useState('');
  const { updateRoleApi } = useRolesApi();

  const assignedFeatures = state.role?.features || [];
  const allFeatures = state.features || [];
  const modules = state.modules || [];

  const filteredAssignedFeatures = allFeatures.filter((feature: Feature) => {
    const matchesSearch =
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) || feature.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return assignedFeatures.includes(feature._id) && matchesSearch;
  });

  const featuresByModule = modules
    .map((module: Module) => ({
      module,
      features: filteredAssignedFeatures.filter((f: Feature) => f.moduleId === module._id),
    }))
    .filter((group: { module: Module; features: Feature[] }) => group.features.length > 0);

  const unassignFeature = (featureId: string) => {
    setState(prev => ({
      ...prev,
      role: {
        ...prev.role,
        features: prev.role.features.filter((id: string) => id !== featureId),
      },
    }));
  };

  const noResults = searchTerm && filteredAssignedFeatures.length === 0;

  const handleUpdateRole = () => {
    setState(prev => ({ ...prev, loading: true }));
    updateRoleApi(state.role);
  };

  return (
    <div className="h-full overflow-y-auto pr-4">
      <div className="mb-6 flex w-full items-center justify-between">
        <div className="">
          <h2 className="mb-2 text-lg font-semibold text-slate-800">Assigned Features of {state.role?.name}</h2>
          <p className="text-sm text-slate-500">These features are currently assigned to the role</p>
        </div>
        <Button onClick={handleUpdateRole}>Update</Button>
      </div>

      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search assigned features..." />

      {noResults ? (
        <EmptyState searchTerm={searchTerm} type="assigned" />
      ) : filteredAssignedFeatures.length === 0 ? (
        <div className="mt-8 text-center text-sm text-slate-500">No features assigned yet. Assign features from the available features list.</div>
      ) : (
        <div className="space-y-4">
          {featuresByModule.map(({ module, features }: { module: Module; features: Feature[] }) => (
            <ModuleAccordion
              key={module._id}
              module={module}
              features={features}
              assignedFeatureIds={assignedFeatures}
              onAssign={() => {}}
              onUnassign={unassignFeature}
              showActionButtons={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RightContainer: React.FC = () => {
  const { state, setState } = useRoleState();
  const [searchTerm, setSearchTerm] = useState('');

  const subscriptionModelFeatures = state.subscriptionModel?.features || [];
  const allFeatures = state.features || [];
  const modules = state.modules || [];
  const roleFeatures = state.role?.features || [];

  // Get all features that are in the subscription model
  const availableFeatures = allFeatures.filter((feature: Feature) => subscriptionModelFeatures.includes(feature._id));

  const filteredAvailableFeatures = availableFeatures.filter((feature: Feature) => {
    const matchesSearch =
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) || feature.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const featuresByModule = modules
    .map((module: Module) => ({
      module,
      features: filteredAvailableFeatures.filter((f: Feature) => f.moduleId === module._id),
    }))
    .filter((group: { module: Module; features: Feature[] }) => group.features.length > 0);

  const assignFeature = (featureId: string) => {
    if (!roleFeatures.includes(featureId)) {
      setState(prev => ({
        ...prev,
        role: {
          ...prev.role,
          features: [...prev.role.features, featureId],
        },
      }));
    }
  };

  const unassignFeature = (featureId: string) => {
    setState(prev => ({
      ...prev,
      role: {
        ...prev.role,
        features: prev.role.features.filter((id: string) => id !== featureId),
      },
    }));
  };

  const noResults = searchTerm && filteredAvailableFeatures.length === 0;

  return (
    <div className="h-full overflow-y-auto border-l border-slate-200 pl-4">
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Available Features in {state.subscriptionModel?.name} plan</h2>
        <p className="text-sm text-slate-500">Assign features from your subscription model</p>
      </div>

      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search available features..." />

      {noResults ? (
        <EmptyState searchTerm={searchTerm} type="available" />
      ) : filteredAvailableFeatures.length === 0 ? (
        <div className="mt-8 text-center text-sm text-slate-500">No features found matching your search.</div>
      ) : (
        <div className="space-y-4">
          {featuresByModule.map(({ module, features }: { module: Module; features: Feature[] }) => (
            <ModuleAccordion
              key={module._id}
              module={module}
              features={features}
              assignedFeatureIds={roleFeatures}
              onAssign={assignFeature}
              onUnassign={unassignFeature}
              showActionButtons={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ViewRoleComponent: React.FC = () => {
  const { state, setState } = useRoleState();
  const { updateRoleApi } = useRolesApi();
  const toast = useToastStore();

  const handleUpdateRole = async () => {
    if (!state.role) return;

    try {
      await updateRoleApi({
        ...state.role,
        // Ensure we only send the necessary fields to the API
        name: state.role.name,
        description: state.role.description,
        features: state.role.features,
      });

      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  if (!state.role) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-800">No role selected</h3>
          <p className="mt-1 text-sm text-slate-500">Select a role to view or edit its features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col">
      {/* <div className="mb-4 flex justify-end">
        <button
          onClick={handleUpdateRole}
          disabled={state.loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.loading ? 'Updating...' : 'Update Role'}
        </button>
      </div> */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 overflow-y-auto p-4">
          <LeftContainer />
        </div>
        <div className="w-1/2 overflow-y-auto border-l border-slate-200 p-4">
          <RightContainer />
        </div>
      </div>
    </div>
  );
};

export default ViewRoleComponent;
