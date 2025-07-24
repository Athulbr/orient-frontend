import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, Search, Users, FileText, Settings, Package, AlertCircle } from 'lucide-react';
import { useRoleState } from './hooks/roleContext';
import { useRolesApi } from './hooks/useRoleApi';

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

// Utility function to get module icon
const getModuleIcon = (moduleKey: string) => {
  const iconMap: Record<string, React.ComponentType> = {
    user: Users,
    docsnap: FileText,
    promate: Settings,
  };
  return iconMap[moduleKey] || Package;
};

// Feature Card Component
const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <div className="mb-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-slate-800">{feature.name}</h3>
        <p className="mt-1 text-xs text-slate-600">{feature.description}</p>
      </div>
      {feature.isBeta && <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">Beta</span>}
    </div>
  </div>
);

// Module Accordion Component
const ModuleAccordion: React.FC<{ module: Module; features: Feature[] }> = ({ module, features }) => {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = getModuleIcon(module.key);

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between p-4 hover:bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
            <Icon />
          </div>
          <span className="text-sm font-medium">{module.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 p-4">
          {features.map(feature => (
            <FeatureCard key={feature._id} feature={feature} />
          ))}
        </div>
      )}
    </div>
  );
};

// Search Input Component
const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <div className="relative mb-4">
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <Search className="h-4 w-4 text-slate-400" />
    </div>
    <input
      type="text"
      className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// Right Container with Features
const RightContainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - In a real app, this would come from your API/context
  const modules: Module[] = [
    { _id: '1', key: 'user', name: 'User Management', order: 1 },
    { _id: '2', key: 'docsnap', name: 'Document Management', order: 2 },
    { _id: '3', key: 'promate', name: 'Settings', order: 3 },
  ];

  const features: Feature[] = [
    {
      _id: 'f1',
      key: 'user_create',
      name: 'Create Users',
      description: 'Allows creating new user accounts',
      isActive: true,
      isBeta: false,
      moduleId: '1',
      deleted: false,
    },
    {
      _id: 'f2',
      key: 'user_edit',
      name: 'Edit Users',
      description: 'Allows editing existing user accounts',
      isActive: true,
      isBeta: false,
      moduleId: '1',
      deleted: false,
    },
    {
      _id: 'f3',
      key: 'docsnap_view',
      name: 'View Documents',
      description: 'Allows viewing documents',
      isActive: true,
      isBeta: true,
      moduleId: '2',
      deleted: false,
    },
  ];

  const filteredFeatures = searchTerm
    ? features.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.description.toLowerCase().includes(searchTerm.toLowerCase()))
    : features;

  const featuresByModule = modules.reduce<Record<string, Feature[]>>((acc, module) => {
    const moduleFeatures = filteredFeatures.filter(f => f.moduleId === module._id);
    if (moduleFeatures.length > 0) {
      acc[module._id] = moduleFeatures;
    }
    return acc;
  }, {});

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Available Features</h2>
        <p className="text-sm text-slate-500">Features available for this role based on subscription</p>
      </div>

      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search features..." />

      <div className="space-y-4">
        {Object.keys(featuresByModule).length > 0 ? (
          modules
            .filter(module => featuresByModule[module._id]?.length > 0)
            .map(module => <ModuleAccordion key={module._id} module={module} features={featuresByModule[module._id]} />)
        ) : (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-slate-500">No features found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Left Container with Role Details
const LeftContainer: React.FC = () => {
  const { state } = useRoleState();
  const { role } = state;

  if (!role) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Select a role to view details</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto border-r border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">{role.name}</h2>
        <p className="text-sm text-slate-500">Role Details</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">Description</h3>
          <p className="text-sm text-slate-600">{role.description || 'No description provided'}</p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">Permissions</h3>
          <div className="space-y-2">
            {Array.isArray(role.permissions) && role.permissions.length > 0 ? (
              role.permissions.map((permission: string) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-slate-600">{permission}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No permissions assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ViewRoleComponent: React.FC = () => {
  const { state } = useRoleState();
  const { getRoleByIdApi } = useRolesApi();

  useEffect(() => {
    if (state.id) {
      getRoleByIdApi(state.id);
    }
  }, [state.id]);

  return (
    <div className="flex h-[calc(100vh-200px)] bg-slate-50">
      <div className="w-1/3">
        <LeftContainer />
      </div>
      <div className="w-2/3">
        <RightContainer />
      </div>
    </div>
  );
};

export default ViewRoleComponent;
