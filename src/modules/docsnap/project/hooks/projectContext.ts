import { createContext, useContext } from 'react';
import { ProjectStateIF } from '..';

const projectStateContext = createContext<ProjectContextIF | undefined>(undefined);
export const ProjectStateProvider = projectStateContext.Provider;

export const useProjectState = () => {
  const context = useContext(projectStateContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface ProjectContextIF {
  state: ProjectStateIF;
  setState: React.Dispatch<React.SetStateAction<ProjectStateIF>>;
}
