import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../../components/Button';

// Types
interface Module {
  name: string;
  features: string[];
}

interface Role {
  name: string;
  permissions: string[];
}

// Dummy data (can be replaced with props or API data)
const initialRole: Role = {
  name: 'validator',
  permissions: [],
};

const initialModules: Module[] = [
  {
    name: 'user',
    features: [
      'create:user:own',
      'create:user:all',
      'read:user:own',
      'read:user:all',
      'update:user:own',
      'update:user:all',
      'delete:user:own',
      'delete:user:all',
      'update:password:own',
    ],
  },
  {
    name: 'project',
    features: [
      'create:project:own',
      'create:project:all',
      'read:project:own',
      'read:project:all',
      'update:project:own',
      'update:project:all',
      'delete:project:own',
      'delete:project:all',
    ],
  },
  {
    name: 'document',
    features: [
      'create:document:own',
      'create:document:all',
      'read:document:own',
      'read:document:all',
      'update:document:own',
      'update:document:all',
      'delete:document:own',
      'delete:document:all',
    ],
  },
  {
    name: 'record',
    features: [
      'create:record:own',
      'create:record:all',
      'read:record:own',
      'read:record:all',
      'update:record:own',
      'update:record:all',
      'delete:record:own',
      'delete:record:all',
    ],
  },
  {
    name: 'comment',
    features: [
      'create:comment:own',
      'create:comment:all',
      'read:comment:own',
      'read:comment:all',
      'update:comment:own',
      'update:comment:all',
      'delete:comment:own',
      'delete:comment:all',
    ],
  },
];

function getPermissionType(permission: string): 'all' | 'own' | 'custom' | 'other' {
  if (permission.endsWith(':all')) return 'all';
  if (permission.endsWith(':own')) return 'own';
  if (permission.endsWith(':null')) return 'custom';
  return 'other';
}

const badgeColors: Record<string, string> = {
  all: 'bg-blue-600',
  own: 'bg-green-600',
  custom: 'bg-yellow-500',
  other: 'bg-gray-500',
};

export const ViewRoleComponent: React.FC = () => {
  const [role, setRole] = useState<Role>(initialRole);
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [searchAssigned, setSearchAssigned] = useState<string>('');
  const [searchAvailable, setSearchAvailable] = useState<string>('');
  const [openAssigned, setOpenAssigned] = useState<number[]>(Array.from({ length: modules.length }, (_, i) => i));
  const [openAvailable, setOpenAvailable] = useState<number[]>(Array.from({ length: modules.length }, (_, i) => i));
  const [addFeatureIdx, setAddFeatureIdx] = useState<number | null>(null);
  const [newFeature, setNewFeature] = useState<string>('');

  // Drag and drop state
  const [dragInfo, setDragInfo] = useState<{
    moduleIdx: number | null;
    featureIdx: number | null;
    overIdx: number | null;
    type: 'assigned' | 'available' | null;
  }>({ moduleIdx: null, featureIdx: null, overIdx: null, type: null });

  // Assigned permissions by module
  const assignedByModule: Module[] = modules.map(mod => ({
    ...mod,
    features: mod.features.filter(f => role.permissions.includes(f)),
  }));

  // Available features by module (now just all features, not filtered)
  const availableByModule: Module[] = modules;

  // Accordion toggle
  const toggleAccordion = (section: 'assigned' | 'available', idx: number) => {
    if (section === 'assigned') {
      setOpenAssigned((prev: number[]) => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
    } else {
      setOpenAvailable((prev: number[]) => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
    }
  };

  // Remove permission
  const handleRemove = (feature: string) => {
    setRole(r => ({ ...r, permissions: r.permissions.filter(p => p !== feature) }));
  };

  // Add feature directly (for Add button)
  const handleAdd = (feature: string) => {
    if (!role.permissions.includes(feature)) {
      setRole(r => ({ ...r, permissions: [...r.permissions, feature] }));
    }
  };

  // Add new feature to module
  const handleAddFeatureToModule = (idx: number) => {
    if (!newFeature.trim()) return;
    setModules(prev =>
      prev.map((mod, i) => (i === idx && !mod.features.includes(newFeature.trim()) ? { ...mod, features: [...mod.features, newFeature.trim()] } : mod))
    );
    setNewFeature('');
    setAddFeatureIdx(null);
  };

  // Filter helpers
  const filterFeatures = (features: string[], search: string) => features.filter(f => f.toLowerCase().includes(search.toLowerCase()));

  // Delete feature from module (and from role.permissions if assigned)
  const handleDeleteFeature = (moduleIdx: number, feature: string) => {
    setModules(prev => prev.map((mod, i) => (i === moduleIdx ? { ...mod, features: mod.features.filter(f => f !== feature) } : mod)));
    setRole(r => ({ ...r, permissions: r.permissions.filter(p => p !== feature) }));
  };

  // Drag and drop handlers
  const handleDragStart = (moduleIdx: number, featureIdx: number, type: 'assigned' | 'available') => {
    setDragInfo({ moduleIdx, featureIdx, overIdx: featureIdx, type });
  };

  const handleDragEnter = (moduleIdx: number, featureIdx: number, type: 'assigned' | 'available') => {
    // Only allow drag within the same module and type
    if (dragInfo.moduleIdx === moduleIdx && dragInfo.type === type) {
      setDragInfo(info => ({ ...info, overIdx: featureIdx }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (moduleIdx: number, type: 'assigned' | 'available') => {
    if (dragInfo.moduleIdx === moduleIdx && dragInfo.featureIdx !== null && dragInfo.overIdx !== null && dragInfo.type === type) {
      if (type === 'assigned') {
        // Assigned list: reorder only assigned features in this module
        setRole(r => {
          const mod = assignedByModule[moduleIdx];
          const features = filterFeatures(mod.features, searchAssigned);
          const featureList = [...features];
          const [dragged] = featureList.splice(dragInfo.featureIdx!, 1);
          featureList.splice(dragInfo.overIdx!, 0, dragged);
          // Update role.permissions order for these features
          const newPermissions = [...r.permissions];
          // Remove all these features from permissions
          mod.features.forEach(f => {
            const idx = newPermissions.indexOf(f);
            if (idx !== -1) newPermissions.splice(idx, 1);
          });
          // Insert reordered features at the start of this module's block
          const insertAt = Math.max(...mod.features.map(f => r.permissions.indexOf(f)).filter(i => i !== -1), 0);
          newPermissions.splice(insertAt, 0, ...featureList);
          return { ...r, permissions: newPermissions };
        });
      } else if (type === 'available') {
        // Available list: reorder features in the module
        setModules(prev =>
          prev.map((mod, i) => {
            if (i !== moduleIdx) return mod;
            const features = filterFeatures(mod.features, searchAvailable);
            const featureList = [...features];
            const [dragged] = featureList.splice(dragInfo.featureIdx!, 1);
            featureList.splice(dragInfo.overIdx!, 0, dragged);
            // Now, merge reordered features back into mod.features
            // Only reorder the filtered subset, keep others in place
            const newFeatures: string[] = [];
            let fIdx = 0;
            for (const f of mod.features) {
              if (features.includes(f)) {
                newFeatures.push(featureList[fIdx++]);
              } else {
                newFeatures.push(f);
              }
            }
            return { ...mod, features: newFeatures };
          })
        );
      }
    }
    setDragInfo({ moduleIdx: null, featureIdx: null, overIdx: null, type: null });
  };

  const handleDragEnd = () => {
    setDragInfo({ moduleIdx: null, featureIdx: null, overIdx: null, type: null });
  };

  return (
    <div className="flex h-[80vh] w-full flex-1 gap-10 overflow-hidden p-4">
      {/* Left: Role Permissions */}
      <section className="flex flex-1 flex-col rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-2 text-2xl font-bold text-blue-700">
          <span className="mr-2 inline-block h-6 w-2 rounded-full bg-blue-600"></span>
          {role.name}
        </div>
        <input
          className="mb-4 rounded-lg border border-gray-300 px-3 py-2 transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="Search permissions..."
          value={searchAssigned}
          onChange={e => setSearchAssigned(e.target.value)}
        />
        <div className="space-y-2 overflow-y-auto">
          {assignedByModule.map((mod, idx) => (
            <div className="rounded-lg border border-gray-200 bg-gray-100" key={mod.name}>
              <div
                className="flex cursor-pointer items-center justify-between px-4 py-3 transition select-none hover:bg-blue-50"
                onClick={() => toggleAccordion('assigned', idx)}
              >
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700 capitalize">{mod.name} Module</span>
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">{mod.features.length}</span>
                </div>
              </div>
              <div className={`px-4 transition-all duration-300 ${openAssigned.includes(idx) ? 'h-auto py-2' : 'max-h-0 overflow-hidden py-0'}`}>
                {filterFeatures(mod.features, searchAssigned).length === 0 && <div className="py-2 text-gray-400 italic">No permissions</div>}
                {filterFeatures(mod.features, searchAssigned).map((feature, fIdx) => (
                  <div
                    className={`urp-draggable mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition ${dragInfo.moduleIdx === idx && dragInfo.type === 'assigned' && dragInfo.overIdx === fIdx ? 'ring-2 ring-blue-400' : ''}`}
                    key={feature}
                    draggable
                    onDragStart={() => handleDragStart(idx, fIdx, 'assigned')}
                    onDragEnter={() => handleDragEnter(idx, fIdx, 'assigned')}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx, 'assigned')}
                    onDragEnd={handleDragEnd}
                  >
                    <span className={`rounded px-2 py-1 text-xs font-bold ${badgeColors[getPermissionType(feature)]} text-white`}>
                      {getPermissionType(feature)}
                    </span>
                    <span className="flex-1 text-sm text-gray-700">{feature}</span>
                    <Button outlined small color="red" className="ml-2 px-2 py-1 text-lg font-bold" title="Remove" onClick={() => handleRemove(feature)}>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Right: Available Features */}
      <section className="flex flex-1 flex-col rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-2 text-2xl font-bold text-green-700">
          <span className="mr-2 inline-block h-6 w-2 rounded-full bg-green-600"></span>
          Available Features
        </div>
        <input
          className="mb-4 rounded-lg border border-gray-300 px-3 py-2 transition focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="Search features..."
          value={searchAvailable}
          onChange={e => setSearchAvailable(e.target.value)}
        />
        <div className="space-y-2 overflow-y-auto">
          {availableByModule.map((mod, idx) => (
            <div className="rounded-lg border border-gray-200 bg-gray-100" key={mod.name}>
              <div
                className="flex cursor-pointer items-center justify-between px-4 py-3 transition select-none hover:bg-green-50"
                onClick={() => toggleAccordion('available', idx)}
              >
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700 capitalize">{mod.name} Module</span>
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">{mod.features.length}</span>
                </div>
                <Button
                  small
                  outlined
                  onClick={e => {
                    e.stopPropagation();
                    setAddFeatureIdx(idx);
                  }}
                >
                  + Add Feature
                </Button>
              </div>
              {/* Add Feature Input */}
              {addFeatureIdx === idx && (
                <div className="flex items-center gap-2 rounded-b-lg bg-green-50 px-4 py-2">
                  <input
                    className="flex-1 rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="New feature name (e.g. approveComent:own)"
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddFeatureToModule(idx);
                      if (e.key === 'Escape') {
                        setAddFeatureIdx(null);
                        setNewFeature('');
                      }
                    }}
                    autoFocus
                  />
                  <Button outlined small color="green" className="px-2 py-1 text-xs font-semibold" onClick={() => handleAddFeatureToModule(idx)}>
                    Add
                  </Button>
                  <Button
                    small
                    outlined
                    className="px-2 py-1 text-xs font-semibold"
                    onClick={() => {
                      setAddFeatureIdx(null);
                      setNewFeature('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <div className={`px-4 transition-all duration-300 ${openAvailable.includes(idx) ? 'h-auto py-2' : 'max-h-0 overflow-hidden py-0'}`}>
                {filterFeatures(mod.features, searchAvailable).length === 0 && <div className="py-2 text-gray-400 italic">No features</div>}
                {filterFeatures(mod.features, searchAvailable).map((feature, fIdx) => {
                  const isAssigned = role.permissions.includes(feature);
                  return (
                    <div
                      className={`urp-draggable mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition ${dragInfo.moduleIdx === idx && dragInfo.type === 'available' && dragInfo.overIdx === fIdx ? 'ring-2 ring-green-400' : ''}`}
                      key={feature}
                      draggable
                      onDragStart={() => handleDragStart(idx, fIdx, 'available')}
                      onDragEnter={() => handleDragEnter(idx, fIdx, 'available')}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx, 'available')}
                      onDragEnd={handleDragEnd}
                    >
                      <span className={`rounded px-2 py-1 text-xs font-bold ${badgeColors[getPermissionType(feature)]} text-white`}>
                        {getPermissionType(feature)}
                      </span>
                      <span className="flex-1 text-sm text-gray-700">{feature}</span>
                      {isAssigned ? (
                        <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">Assigned</span>
                      ) : (
                        <Button
                          outlined
                          small
                          color="green"
                          className="ml-2 px-2 py-1 text-xs font-semibold"
                          title="Add to permissions"
                          onClick={() => handleAdd(feature)}
                        >
                          + Add
                        </Button>
                      )}
                      <Button
                        outlined
                        small
                        color="red"
                        className="ml-1 flex items-center justify-center px-2 py-1"
                        title="Delete feature"
                        onClick={() => handleDeleteFeature(idx, feature)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const allFeatures = [
  'create:user:own',
  'create:user:all',
  'read:user:own',
  'read:user:all',
  'update:user:own',
  'update:user:all',
  'delete:user:own',
  'delete:user:all',
  'docsnap',
];

const subscriptionLevel1 = [
  'create:user',
  'read:user:own',
  'delete:user:own',
  'delete:user:all',
  'delete:user:all',
  'export',
  'read:user:own',
  'delete:user:own',
  'delete:user:all',
];

const subscriptionLevel2 = [
  'create:user:own',
  'create:user:all',
  'read:user:own',
  'delete:user:all',
  'export',
  'read:user:own',
  'delete:user:own',
  'delete:user:all',
  'read:user:own',
  'delete:user:own',
  'delete:user:all',
];

const subscriptionLevel3 = [
  'create:user:own',
  'create:user:all',
  'read:user:own',
  'delete:user:own',
  'read:user:own',
  'delete:user:own',
  'delete:user:all',
  'delete:user:all',
  'delete:user:all',
  'create:user:own',
  'create:user:all',
  'read:user:own',
  'delete:user:own',
  'delete:user:all',
  'delete:user:all',
  'delete:user:all',
  'export',
];
