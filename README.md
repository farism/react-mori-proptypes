# react-mori-proptypes [![npm version](https://badge.fury.io/js/react-mori-proptypes.svg)](https://badge.fury.io/js/react-mori-proptypes) [![Circle CI](https://circleci.com/gh/farism/react-mori-proptypes/tree/master.svg?style=svg)](https://circleci.com/gh/farism/react-mori-proptypes/tree/master)

PropType validators that work with [Mori.js](http://swannodette.github.io/mori/).

## Getting Started
### Install
`npm install react-mori-proptypes --save`

### Usage

```js
import React, { PropTypes } from 'react';
import MoriPropTypes from 'react-mori-proptypes';
import { vector, sum, reduce } from 'mori';

const MyComponent extends React.Component {

  static propTypes = {
    someList: MoriPropTypes.vec,
    someMap: MoriPropTypes.map.isRequired,
  };

  static defaultProps = {
    someList: vector(1, 2, 3, 4),
  };

  render() {
    ...
  }

}
```
