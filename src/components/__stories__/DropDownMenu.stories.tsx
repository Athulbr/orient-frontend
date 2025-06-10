import { useState } from 'react';

export default {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  argTypes: {
    options: { control: 'array' },
  },
};
import { StoryFn } from '@storybook/react';
import { DropdownMenu } from '../DropdownMenu';

const optionsList = ['Option 1', 'Option 2', 'Option 3'];

const Template: StoryFn = args => {
  const [selected, setSelected] = useState('');
  return (
    <div style={{ minHeight: 200 }}>
      <DropdownMenu options={[]} {...args} onChange={setSelected}>
        <button type="button" className="rounded bg-blue-500 px-4 py-2 text-white">
          {selected ? `Selected: ${selected}` : 'Open Menu'}
        </button>
      </DropdownMenu>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  options: optionsList,
};

export const WithManyOptions = Template.bind({});
WithManyOptions.args = {
  options: Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`),
};
