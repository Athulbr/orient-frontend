import { ChevronDown, ChevronUp, Eye, EyeClosed, EyeOff, GripVertical, Plus, Settings, Trash2 } from 'lucide-react';
import { DragAndDropContainer } from '../../../../../components/DragAndDropContainer';
import { LightIconButton } from './ImageViewer';
import { ClassAttributes, InputHTMLAttributes, useState } from 'react';
import { JSX } from 'react/jsx-runtime';
import { dataTypesOption, templateFields } from './temp';
import { SingleSelect } from '../../../../../components/SingleSelect';
import { useUpdateTemplateState } from '../hooks/updateTemplateContext';
import { Button } from '../../../../../components/Button';
import Tooltip from '../../../../../components/Tooltip';

interface FieldsContainerIF {
  test?: string;
}

export const FieldsContainer: React.FC<FieldsContainerIF> = () => {
  const { state } = useUpdateTemplateState();
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-[62px] w-full items-center border border-l-0 bg-gray-50 pl-5 text-lg text-gray-800">Template Fields</div>
      <section className="flex h-full flex-col gap-4 overflow-y-auto border-r border-b p-2 pb-50">
        {state.sectionList.map((section, mainIndex) => (
          <SectionComponent key={mainIndex} section={section} mainIndex={mainIndex} />
        ))}
      </section>
    </div>
  );
};

const InputField = (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement> & { className?: string }) => {
  const { className = '', ...rest } = props;
  return <input {...rest} className={`h-10 w-full rounded border pr-2 pl-3 text-sm outline-none hover:border-gray-400 focus:border-blue-400 ${className}`} />;
};

const SectionComponent = ({ section, mainIndex }: { section: any; mainIndex: number }) => {
  const { state, setState } = useUpdateTemplateState();
  const [opened, setOpened] = useState(true);

  const moveUpSection = (e: any) => {
    e.stopPropagation();
    if (mainIndex === 0) return;
    const sectionList = [...state.sectionList];
    const section = sectionList[mainIndex];
    sectionList[mainIndex] = sectionList[mainIndex - 1];
    sectionList[mainIndex - 1] = section;
    setState({ sectionList });
  };

  const moveDownSection = (e: any) => {
    e.stopPropagation();
    if (mainIndex === state.sectionList.length - 1) return;
    const sectionList = [...state.sectionList];
    const section = sectionList[mainIndex];
    sectionList[mainIndex] = sectionList[mainIndex + 1];
    sectionList[mainIndex + 1] = section;
    setState({ sectionList });
  };

  const addNewField = () => {
    const sectionList = [...state.sectionList];
    sectionList[mainIndex].fields.push({
      label: '',
      jsonKey: '',
      dataType: 'str',
    });
    setState({ sectionList });
  };

  return (
    <div className="flex w-full cursor-pointer flex-col gap-0.5 rounded border p-1">
      <div onClick={() => setOpened(!opened)} className="flex w-full items-center justify-between bg-gray-50 p-3">
        <div className="flex items-center gap-3 pl-2">
          {opened ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          <span>{section?.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <LightIconButton Icon={ChevronUp} onClick={moveUpSection} title="Move Up" />
          <LightIconButton Icon={ChevronDown} onClick={moveDownSection} title="Move Down" />
          <LightIconButton Icon={Trash2} onClick={() => {}} title="Delete" />
        </div>
      </div>
      {opened && (
        <div className="flex flex-col gap-4 p-2">
          <DragAndDropContainer
            items={section?.fields || []}
            onDragEnd={reorderedFields => {
              const sectionList = [...state.sectionList];
              sectionList[mainIndex].fields = reorderedFields;
              setState({ sectionList });
            }}
            className="flex flex-col gap-4 p-2"
          >
            {(field: any, index: number) => <FieldComponent key={index} field={field} index={index} mainIndex={mainIndex} />}
          </DragAndDropContainer>
          <Button disableRipple className="" startIcon={<Plus size={16} />} onClick={addNewField} outlined>
            New Field
          </Button>
        </div>
      )}
    </div>
  );
};

const FieldComponent = ({ field, index, mainIndex }: { field: any; index: number; mainIndex: number }) => {
  const { state, setState } = useUpdateTemplateState();
  const [isDragging, setIsDragging] = useState(false);

  const updateLabel = (e: any) => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].fields[index].label = e.target.value;
      sectionList[mainIndex].fields[index].jsonKey = (e.target.value as string).toLowerCase().replace(/\s/g, '_');
      return { sectionList };
    });
  };
  const updateJsonKey = (e: any) => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].fields[index].jsonKey = e.target.value;
      return { sectionList };
    });
  };
  const updateDataType = (value: string) => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].fields[index].dataType = value;
      return { sectionList };
    });
  };
  const deleteField = () => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].fields.splice(index, 1);
      return { sectionList };
    });
  };
  const updateHidden = (value: boolean) => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].fields[index].hidden = value;
      return { sectionList };
    });
  };
  return (
    <div className="mt-1 flex items-center gap-2 rounded border bg-white p-2">
      <LightIconButton Icon={GripVertical} onClick={() => {}} title="Drag" />
      <Tooltip text="Field Label" containerClassName="w-full">
        <InputField placeholder="Field Label" value={field?.label} onChange={updateLabel} />
      </Tooltip>
      <Tooltip text="Field Name" containerClassName="w-full">
        <InputField placeholder="Field Name" value={field?.jsonKey} onChange={updateJsonKey} />
      </Tooltip>
      <Tooltip text="Data Type" containerClassName="w-fit">
        <SingleSelect options={dataTypesOption} value={field?.dataType} onValueChange={updateDataType} />
      </Tooltip>
      {field?.hidden ? (
        <LightIconButton Icon={EyeOff} onClick={() => updateHidden(false)} title="Hidden" />
      ) : (
        <LightIconButton Icon={Eye} onClick={() => updateHidden(true)} title="Visible" />
      )}
      <LightIconButton Icon={Settings} onClick={() => {}} title="Config" />
      <LightIconButton Icon={Trash2} onClick={deleteField} title="Delete" />
    </div>
  );
};
