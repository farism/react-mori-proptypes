# react-mori-proptypes [![npm version](https://badge.fury.io/js/react-mori-proptypes.svg)](https://badge.fury.io/js/react-mori-proptypes) [![Circle CI](https://circleci.com/gh/farism/react-mori-proptypes/tree/master.svg?style=svg)](https://circleci.com/gh/farism/react-mori-proptypes/tree/master)

PropType validators that work with [Mori.js](http://swannodette.github.io/mori/).

## About
This package was inspired by [react-immutable-proptypes](https://github.com/HurricaneJames/react-immutable-proptypes), which I had used often. Striving to become more FRP, I have switched to using [mori.js](http://swannodette.github.io/mori/) for my immutable needs. I could not find a similar package for validating propTypes with mori data structures, so created this package and used `react-immutable-proptypes` as a base.

## Getting Started
### Install
`npm install react-mori-proptypes --save`

### Usage

Usage is simple, they work with and like any React.PropType.* validator.

```js
import MoriPropTypes from 'react-mori-proptypes';
import { vector } from 'mori';

const MyComponent extends React.Component {

  static propTypes = {
    someMap: MoriPropTypes.map.isRequired,
    someVec: MoriPropTypes.vec,
  };

  static defaultProps = {
    someVec: vector(1, 2, 3, 4),
  };

  render() {
    ...
  }

}
```

### API

React-Mori-PropTypes has:

#### Primitive Types

```
MoriPropTypes.list         // mori.isList
MoriPropTypes.map          // mori.isMap
MoriPropTypes.queue        // isQueue
MoriPropTypes.range        // isRange
MoriPropTypes.set          // mori.isSet
MoriPropTypes.sortedMap    // isSortedMap
MoriPropTypes.sortedSet    // isSortedSet
MoriPropTypes.vec          // mori.isVec
```

#### Collection Types

```
MoriPropTypes.listOf         // based on React.PropTypes.arrayOf
MoriPropTypes.mapOf          // similar to MoriPropTypes.vecOf, but specific to maps
MoriPropTypes.queueOf        // similar to MoriPropTypes.vecOf, but specific to queues
MoriPropTypes.setOf          // similar to MoriPropTypes.vecOf, but specific to sets
MoriPropTypes.sortedMap      // similar to MoriPropTypes.vecOf, but specific to sortedMaps
MoriPropTypes.sortedSet      // similar to MoriPropTypes.vecOf, but specific to sortedSets
MoriPropTypes.vecOf          // based on React.PropTypes.arrayOf
```
#### Contains Types

React-Mori-PropTypes also supports a `contains` type, which is analogous to `React.PropTypes.shape` type. This propType validator supports defining the shape of a hashMap, I.E. the keys/value types. You should only use a `mori.map` or `mori.sortedMap` with `contains`.

It is used the same way as `shape`:

```
static propTypes = {
  person: MoriPropTypes.contains({
    firstName: React.PropTypes.string.isRequired,
    lastName: React.PropTypes.string.isRequired,
    age: React.PropTypes.number,
  })
};

static defaultProps = {
  person: mori.hashMap('firstName', 'John', 'lastName', 'Smith')
}
```

#### Contributing

Issues, feedback, and PR's welcome. Please follow the linter rules.
