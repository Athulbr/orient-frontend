import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';

interface UserPreferencePageIF {
  test?: string;
}

const UserPreferencePage: React.FC<UserPreferencePageIF> = () => {
  return (
    <div className="h-full w-full">
      <p className="text-xl">User Preference</p>
      <UseFormbuilder
        renderFormClassName="bg-red-200"
        showInDialog={false}
        title="User Preference"
        name="User Preference Form"
        isOpen={true}
        closeDialog={() => {}}
        onSubmit={() => {}}
      />
    </div>
  );
};

export default UserPreferencePage;
