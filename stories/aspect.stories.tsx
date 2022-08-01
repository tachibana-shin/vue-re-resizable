import Resizable from "../src/index.vue"

import { storiesOf } from '@storybook/vue';
import { style } from './style';

storiesOf('aspect', module).add('default', () => (
  <Resizable
    style={style}
    defaultSize={{
      width: 200,
      height: 300,
    }}
    lockAspectRatio
  >
    001
  </Resizable>
));
