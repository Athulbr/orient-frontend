import { ChevronDown, ChevronUp, Edit, Eye, EyeOff, GripVertical, Plus, Settings, Trash2 } from 'lucide-react';
import { DragAndDropContainer } from '../../../../components/DragAndDropContainer';
import { LightIconButton } from './components/ImageViewer';
import { ClassAttributes, InputHTMLAttributes, useEffect, useState } from 'react';
import { JSX } from 'react/jsx-runtime';
import { dataTypesOption } from './components/temp';
import { SingleSelect } from '../../../../components/SingleSelect';
import { useUpdateTemplateState } from './hooks/updateTemplateContext';
import { Button } from '../../../../components/Button';
import Tooltip from '../../../../components/Tooltip';
import { UseFormbuilder } from '../../../../builders/formbuilder/use-formbuilder';
import { useParams } from 'react-router-dom';
import { useUpdateTemplatePageApi } from './hooks/useUpdateTemplateApi';
import { capitalizeFirstLetter } from '../../../../builders/formbuilder/utils/functions/capitalizeFirstLetter';

export const FieldsContainer: React.FC = () => {
  const { state, setState } = useUpdateTemplateState();

  const { getTemplateApi } = useUpdateTemplatePageApi();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    // getTemplateApi(id);
  }, [id]);
  const addNewSection = () => {
    const sectionList = [...state.sectionList];
    sectionList.push({
      name: 'New Section',
      dataType: 'object',
      jsonKey: 'new_section',
      subFields: [
        {
          name: '',
          jsonKey: '',
          dataType: 'str',
        },
      ],
    });
    setState({ sectionList });
  };
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-[64px] w-full items-center border border-l-0 bg-gray-50 pl-5 text-lg text-gray-800">Template Fields</div>
      <section className="flex h-full flex-col gap-4 overflow-y-auto border-r border-b p-2 pt-3 pb-50">
        {state.sectionList.map((section, mainIndex) => (
          <SectionComponent key={mainIndex} section={section} mainIndex={mainIndex} />
        ))}
        <div className="flex w-full items-center gap-4 px-2">
          <Button disableRipple className="min-h-10 w-full" startIcon={<Plus size={16} />} onClick={addNewSection} outlined>
            Add Section
          </Button>
          <Button disableRipple className="min-h-10 w-full" startIcon={<Plus size={16} />} onClick={addNewSection} outlined>
            Add Table
          </Button>
        </div>
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
  const [editSectionDialog, setEditSectionDialog] = useState(false);

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
    sectionList[mainIndex].subFields.push({
      name: '',
      jsonKey: '',
      dataType: 'str',
    });
    setState({ sectionList });
  };

  const editSectionDialogHandler = (e: any) => {
    e.stopPropagation();
    setEditSectionDialog(true);
  };

  return (
    <div className="flex w-full cursor-pointer flex-col gap-0.5 rounded border p-1">
      <div onClick={() => setOpened(!opened)} className={`flex w-full items-center justify-between rounded bg-gray-50 p-3`}>
        <div className="flex items-center gap-3 pl-2">
          {opened ? <ChevronDown size={16} /> : <ChevronUp size={16} />}

          <span className="flex items-center gap-2">
            {section?.name}
            <LightIconButton Icon={Edit} onClick={editSectionDialogHandler} title="Edit Section" />
          </span>
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
            items={section?.subFields || []}
            onDragEnd={reorderedFields => {
              const sectionList = [...state.sectionList];
              sectionList[mainIndex].subFields = reorderedFields;
              setState({ sectionList });
            }}
            className="flex flex-col gap-4 p-2"
          >
            {(field: any, index: number) => <FieldComponent key={index} field={field} index={index} mainIndex={mainIndex} />}
          </DragAndDropContainer>
          <Button disableRipple className="ml-4 w-fit border-none" startIcon={<Plus size={16} />} onClick={addNewField} outlined>
            New Field
          </Button>
        </div>
      )}
      {editSectionDialog && (
        <UseFormbuilder
          className="w-130"
          title="Field Configuration"
          name="Template Section Config Form"
          closeDialog={() => setEditSectionDialog(false)}
          existingData={state.sectionList[mainIndex]}
          onSubmit={() => {}}
        />
      )}
    </div>
  );
};

const FieldComponent = ({ field, index, mainIndex }: { field: any; index: number; mainIndex: number }) => {
  const { state, setState } = useUpdateTemplateState();
  const [showConfigForm, setShowConfigForm] = useState(false);

  const updateName = (e: any) => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].subFields[index].name = capitalizeFirstLetter(e.target.value as string);
      sectionList[mainIndex].subFields[index].jsonKey = (e.target.value as string).toLowerCase().replace(/\s/g, '_');
      return { sectionList };
    });
  };
  const updateJsonKey = (e: any) => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].subFields[index].jsonKey = e.target.value;
      return { sectionList };
    });
  };
  const updateDataType = (value: string) => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].subFields[index].dataType = value;
      return { sectionList };
    });
  };
  const deleteField = () => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].subFields.splice(index, 1);
      return { sectionList };
    });
  };
  const updateHidden = (value: boolean) => {
    setState(prev => {
      const sectionList = [...prev.sectionList];
      sectionList[mainIndex].subFields[index].hidden = value;
      return { sectionList };
    });
  };
  return (
    <div className="mt-1 flex items-center gap-2 rounded border bg-white p-2">
      <LightIconButton Icon={GripVertical} onClick={() => {}} title="Drag" />
      <Tooltip text="Field Name" containerClassName="w-full">
        <InputField placeholder="Field Name" value={field?.name} onChange={updateName} />
      </Tooltip>
      <Tooltip text="Json Key" containerClassName="w-full">
        <InputField placeholder="Json Key" value={field?.jsonKey} onChange={updateJsonKey} />
      </Tooltip>
      <Tooltip text="Data Type" containerClassName="w-fit">
        <SingleSelect options={dataTypesOption} value={field?.dataType} onValueChange={updateDataType} />
      </Tooltip>
      {field?.hidden ? (
        <LightIconButton Icon={EyeOff} onClick={() => updateHidden(false)} title="Hidden" />
      ) : (
        <LightIconButton Icon={Eye} onClick={() => updateHidden(true)} title="Visible" />
      )}
      <LightIconButton Icon={Settings} onClick={() => setShowConfigForm(true)} title="Config" />
      <LightIconButton Icon={Trash2} onClick={deleteField} title="Delete" />
      {showConfigForm && (
        <UseFormbuilder
          className="w-130"
          title="Field Configuration"
          name="Template Field Config Form"
          closeDialog={() => setShowConfigForm(false)}
          existingData={state.sectionList[mainIndex].subFields[index] || {}}
          onSubmit={() => {}}
        />
      )}
    </div>
  );
};
