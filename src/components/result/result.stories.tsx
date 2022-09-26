import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Result } from './result';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Result',
  component: Result,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Result>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Result> = (args) => <Result {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  primary: true,
  label: 'Kiểm tra',
};

export const wrong = Template.bind({});
wrong.args = {
  size: 'small',
    label: 'Tiếp tục'
};
