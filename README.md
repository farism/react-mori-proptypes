# react-mori-proptypes [![npm version]()]() [![Circle CI]()]()

## Getting Started
### Install
`npm install react-mori-proptypes --save`

### Usage

```js
import React, { PropTypes } from 'react';
import MoriPropTypes from 'react-mori-proptypes';
import { vector, sum, reduce } from 'mori';

export const MyComponent extends React.Component {

  static propTypes = {
    someList: MoriPropTypes.vec,
    someMap: MoriPropTypes.map.isRequired,
  };

  static defaultProps = {
    someList: vector(1, 2, 3, 4),
  };

  render() {
    {reduce(sum, this.props.someList)} // 10
  }

}
```
