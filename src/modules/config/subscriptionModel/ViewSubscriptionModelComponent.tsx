import React, { useState } from 'react';
import { ChevronDown, Search, Package, Users, FileText, Settings, AlertCircle } from 'lucide-react';

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

interface SubscriptionModel {
  _id: string;
  name: string;
  description: string;
  price: number;
  cycle: string;
  features: string[];
}

// Sample data
const sampleModuleList: Module[] = [
  {
    _id: '6871d67d81d2eac5128fb0c3',
    key: 'user',
    name: 'User',
    order: 1,
  },
  {
    _id: '6871d6dd81d2eac5128fb0c8',
    key: 'docsnap',
    name: 'Docsnap',
    order: 2,
  },
  {
    _id: '68739ef4d64c7dd15a1ef07f',
    key: 'promate',
    name: 'Promate',
    order: 3,
  },
];

const sampleFeatureList: Feature[] = [
  {
    _id: '6871d7bc81d2eac5128fb0d5',
    key: 'create:user',
    name: 'Create User',
    description: 'This role can create new user',
    isActive: true,
    isBeta: false,
    moduleId: '6871d67d81d2eac5128fb0c3',
    deleted: false,
  },
  {
    _id: '68739fead64c7dd15a1ef0b0',
    key: 'get:user',
    name: 'Get User',
    description: 'View user details and information',
    isActive: true,
    isBeta: false,
    moduleId: '6871d67d81d2eac5128fb0c3',
    deleted: false,
  },
  {
    _id: '6873a00ad64c7dd15a1ef0b9',
    key: 'delete:user',
    name: 'Delete User',
    description: 'Remove user from the system',
    isActive: true,
    isBeta: false,
    moduleId: '6871d67d81d2eac5128fb0c3',
    deleted: false,
  },
  {
    _id: '6873a026d64c7dd15a1ef0c2',
    key: 'update:user',
    name: 'Update User',
    description: 'Modify user details and permissions',
    isActive: true,
    isBeta: false,
    moduleId: '6871d67d81d2eac5128fb0c3',
    deleted: false,
  },
  {
    _id: '6873a027d64c7dd15a1ef0c3',
    key: 'create:document',
    name: 'Create Document',
    description: 'Create new documents in Docsnap',
    isActive: true,
    isBeta: false,
    moduleId: '6871d6dd81d2eac5128fb0c8',
    deleted: false,
  },
  {
    _id: '6873a028d64c7dd15a1ef0c4',
    key: 'edit:document',
    name: 'Edit Document',
    description: 'Edit existing documents',
    isActive: true,
    isBeta: false,
    moduleId: '6871d6dd81d2eac5128fb0c8',
    deleted: false,
  },
  {
    _id: '6873a029d64c7dd15a1ef0c5',
    key: 'manage:projects',
    name: 'Manage Projects',
    description: 'Create and manage Promate projects',
    isActive: true,
    isBeta: true,
    moduleId: '68739ef4d64c7dd15a1ef07f',
    deleted: false,
  },
];

const sampleSubscriptionModel: SubscriptionModel = {
  _id: '686deeaadce3739db2bee37a',
  name: 'Enterprise',
  description: 'Enterprise plan for 365 days',
  price: 10,
  cycle: 'yearly',
  features: ['6871d7bc81d2eac5128fb0d5', '68739fead64c7dd15a1ef0b0'],
};

// Helper function to get module icon
const getModuleIcon = (moduleKey: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    user: Users,
    docsnap: FileText,
    promate: Settings,
  };
  return iconMap[moduleKey] || Package;
};

// Reusable FeatureCard component
interface FeatureCardProps {
  feature: Feature;
  isAssigned: boolean;
  onAssign: (featureId: string) => void;
  onUnassign?: (featureId: string) => void;
  showActionButton?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, isAssigned, onAssign, onUnassign, showActionButton = true }) => {
  const handleClick = () => {
    if (isAssigned && onUnassign) {
      onUnassign(feature._id);
    } else if (!isAssigned) {
      onAssign(feature._id);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
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
      <p className="text-xs leading-relaxed text-slate-600">{feature.description}</p>
    </div>
  );
};

// Accordion component
interface AccordionProps {
  module: Module;
  features: Feature[];
  assignedFeatureIds: string[];
  onAssign: (featureId: string) => void;
  onUnassign?: (featureId: string) => void;
  showActionButtons?: boolean;
}

const ModuleAccordion: React.FC<AccordionProps> = ({ module, features, assignedFeatureIds, onAssign, onUnassign, showActionButtons = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const IconComponent = getModuleIcon(module.key);

  if (features.length === 0) return null;

  const assignedCount = features.filter(f => assignedFeatureIds.includes(f._id)).length;

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors duration-200 hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
            <IconComponent className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-800">{module.name}</h3>
            <p className="text-xs text-slate-500">{showActionButtons ? `${assignedCount}/${features.length} assigned` : `${features.length} features`}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transform text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="space-y-2 border-t border-slate-100 px-4 pb-4">
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

// Left container component
interface LeftContainerProps {
  subscription: SubscriptionModel;
  modules: Module[];
  features: Feature[];
  onUnassign: (featureId: string) => void;
}

const LeftContainer: React.FC<LeftContainerProps> = ({ subscription, modules, features, onUnassign }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const assignedFeatures = features.filter(feature => subscription.features.includes(feature._id));

  const filteredFeatures = assignedFeatures.filter(
    feature => feature.name.toLowerCase().includes(searchTerm.toLowerCase()) || feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Fixed Header - Same height as right container */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg">
            <span className="text-lg font-bold text-white">{subscription.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{subscription.name} Plan</h1>
            <p className="text-sm text-slate-600">{subscription.description}</p>
          </div>
        </div>
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 font-semibold text-white">
            ${subscription.price} / {subscription.cycle}
          </div>
          <div className="text-slate-600">
            <span className="font-semibold text-slate-800">{assignedFeatures.length}</span> features assigned
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search assigned features..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 pl-10 text-slate-800 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute top-1/2 left-3 -translate-y-1/2 transform text-slate-400">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredFeatures.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500">{searchTerm ? 'No features match your search' : 'No features assigned to this plan'}</p>
            <p className="mt-1 text-sm text-slate-400">{searchTerm ? 'Try adjusting your search terms' : 'Add features from the available features panel'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedModules.map(module => {
              const moduleFeatures = filteredFeatures.filter(feature => feature.moduleId === module._id);
              return (
                <ModuleAccordion
                  key={module._id}
                  module={module}
                  features={moduleFeatures}
                  assignedFeatureIds={subscription.features}
                  onAssign={() => {}}
                  onUnassign={onUnassign}
                  showActionButtons={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Right container component
interface RightContainerProps {
  features: Feature[];
  assignedFeatureIds: string[];
  modules: Module[];
  onAssign: (featureId: string) => void;
}

const RightContainer: React.FC<RightContainerProps> = ({ features, assignedFeatureIds, modules, onAssign }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeatures = features.filter(
    feature => feature.name.toLowerCase().includes(searchTerm.toLowerCase()) || feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Fixed Header - Same height as left container */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Available Features</h2>
            <p className="text-sm text-slate-600">
              {features.length} features across {modules.length} modules
            </p>
          </div>
        </div>

        {/* Spacer div to match left container height */}
        <div className="mb-4 h-6"></div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 pl-10 text-slate-800 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute top-1/2 left-3 -translate-y-1/2 transform text-slate-400">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {sortedModules.map(module => {
            const moduleFeatures = filteredFeatures.filter(feature => feature.moduleId === module._id);
            return (
              <ModuleAccordion
                key={module._id}
                module={module}
                features={moduleFeatures}
                assignedFeatureIds={assignedFeatureIds}
                onAssign={onAssign}
                showActionButtons={true}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Main component
export const ViewSubscriptionModelComponent: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionModel>(sampleSubscriptionModel);

  const handleAssignFeature = (featureId: string) => {
    setSubscription(prev => ({
      ...prev,
      features: [...prev.features, featureId],
    }));
  };

  const handleUnassignFeature = (featureId: string) => {
    setSubscription(prev => ({
      ...prev,
      features: prev.features.filter(id => id !== featureId),
    }));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="flex h-full overflow-hidden rounded-xl shadow-2xl">
        <div className="w-1/2 border-r border-slate-300">
          <LeftContainer subscription={subscription} modules={sampleModuleList} features={sampleFeatureList} onUnassign={handleUnassignFeature} />
        </div>
        <div className="w-1/2">
          <RightContainer features={sampleFeatureList} assignedFeatureIds={subscription.features} modules={sampleModuleList} onAssign={handleAssignFeature} />
        </div>
      </div>
    </div>
  );
};

export default ViewSubscriptionModelComponent;
