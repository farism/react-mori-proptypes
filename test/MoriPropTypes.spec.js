import { describe, it } from 'mocha'
import { expect } from 'chai'
import mori from 'mori'
import React from 'react'

import PropTypes from '../src/MoriPropTypes'

const REQUIRED = 'Required prop `testProp` was not specified in `testComponent`.'
const TEST_PROP = 'testProp'
const TEST_COMPONENT = 'testComponent'
const LOCATION = 'prop'
const TYPES = {
  array: [],
  object: {},
  string: '',
  boolean: false,
  number: 0,
  'Mori.map': mori.hashMap(),
  'Mori.list': mori.list(),
  'Mori.queue': mori.queue(),
  'Mori.range': mori.range(),
  'Mori.set': mori.set(),
  'Mori.sortedMap': mori.sortedMap(),
  'Mori.sortedSet': mori.sortedSet(),
}

const pass = (declaration, value) => {
  const props = { testProp: value }

  const error = declaration(
    props,
    TEST_PROP,
    TEST_COMPONENT,
    LOCATION,
  )

  return expect(error).to.not.be.ok
}

const fail = (declaration, value, message) => {
  const props = { testProp: value }

  const error = declaration(
    props,
    TEST_PROP,
    TEST_COMPONENT,
    LOCATION,
  )

  expect(error.message).to.equal(message)
  expect(error instanceof Error).to.be.true
}

const failAll = (declaration, typeCheck, exclude) => {
  Object.keys(TYPES).forEach(type => {
    if (exclude.indexOf(type) < 0) {
      fail(
        declaration,
        TYPES[type],
        `Invalid prop \`${TEST_PROP}\` of type \`${type}\` supplied to ` +
        `\`${TEST_COMPONENT}\`, expected a \`${typeCheck}\`.`
      )
    }
  })
}

describe('MoriPropTypes', () => {
  describe('PropTypes config', () => {
    it('should fail if typeChecker is not a function', () => {

    })
  })

  describe('Primitive Types', () => {
    it('should not warn for valid values', () => {
      pass(PropTypes.map, mori.hashMap())
      pass(PropTypes.list, mori.list())
      pass(PropTypes.queue, mori.queue())
      pass(PropTypes.range, mori.range())
      pass(PropTypes.queue, mori.queue())
      pass(PropTypes.range, mori.range())
      pass(PropTypes.set, mori.set())
      pass(PropTypes.sortedMap, mori.sortedMap())
      pass(PropTypes.sortedSet, mori.sortedSet())
      pass(PropTypes.vec, mori.vector())
    })
  })

  it('should warn for invalid hashMap', () => {
    failAll(PropTypes.map, 'Mori.map', ['Mori.map', 'Mori.sortedMap'])
  })

  it('should warn for invalid list', () => {
    failAll(PropTypes.list, 'Mori.list', ['Mori.list'])
  })

  it('should warn for invalid queue', () => {
    failAll(PropTypes.queue, 'Mori.queue', ['Mori.queue'])
  })

  it('should warn for invalid range', () => {
    failAll(PropTypes.range, 'Mori.range', ['Mori.range'])
  })

  it('should warn for invalid sortedMap', () => {
    failAll(PropTypes.sortedMap, 'Mori.sortedMap', ['Mori.sortedMap'])
  })

  it('should warn for invalid sortedSet', () => {
    failAll(PropTypes.sortedSet, 'Mori.sortedSet', ['Mori.sortedSet'])
  })

  it('should warn for invalid vector', () => {
    failAll(PropTypes.vec, 'Mori.vec', ['Mori.vec'])
  })

  describe('listOf Type', () => {
    it('should support the listOf propTypes', () => {
      pass(PropTypes.listOf(React.PropTypes.number), mori.list(1, 2, 3))
      pass(PropTypes.listOf(React.PropTypes.string), mori.list('a', 'b', 'c'))
      pass(PropTypes.listOf(React.PropTypes.oneOf(['a', 'b'])), mori.list('a', 'b'))
    })

    it('should support listOf with complex types', () => {
      pass(
        PropTypes.listOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.list({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.listOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.list({ a: 1 }, { a: 2 })
      )

      function Thing() {}
      pass(
        PropTypes.listOf(React.PropTypes.instanceOf(Thing)),
        mori.list(new Thing(), new Thing())
      )
    })

    it('should warn with invalid items in the list', () => {
      fail(
        PropTypes.listOf(React.PropTypes.number),
        mori.list(1, 2, 'b'),
        'Invalid prop `testProp[2]` of type `string` ' +
        'supplied to `testComponent`, expected `number`.'
      )
    })

    it('should warn with invalid complex types', () => {
      function Thing() {}
      const name = Thing.name || '<<anonymous>>'

      fail(
        PropTypes.listOf(React.PropTypes.instanceOf(Thing)),
        mori.list(new Thing(), 'xyz'),
        'Invalid prop `testProp[1]` of type `String` ' +
        'supplied to `testComponent`, expected instance of `' + name + '`.'
      )
    })

    it('should warn when passed something other than a Mori.list', () => {
      fail(
        PropTypes.listOf(React.PropTypes.number),
        { 0: 'maybe-array', length: 1 },
        'Invalid prop `testProp` of type `object` supplied to ' +
        '`testComponent`, expected a `Mori.list`.'
      )
      fail(
        PropTypes.listOf(React.PropTypes.number),
        123,
        'Invalid prop `testProp` of type `number` supplied to ' +
        '`testComponent`, expected a `Mori.list`.'
      )
      fail(
        PropTypes.listOf(React.PropTypes.number),
        'string',
        'Invalid prop `testProp` of type `string` supplied to ' +
        '`testComponent`, expected a `Mori.list`.'
      )
      fail(
        PropTypes.listOf(React.PropTypes.number),
        [1, 2, 3],
        'Invalid prop `testProp` of type `array` supplied to ' +
        '`testComponent`, expected a `Mori.list`.'
      )
    })

    it('should not warn when passing an empty list', () => {
      pass(PropTypes.listOf(React.PropTypes.number), mori.list())
    })

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.listOf(React.PropTypes.number), null)
      pass(PropTypes.listOf(React.PropTypes.number), undefined)
    })

    it('should warn for missing required values', () => {
      fail(
        PropTypes.listOf(React.PropTypes.number).isRequired,
        null,
        REQUIRED,
      )
      fail(
        PropTypes.listOf(React.PropTypes.number).isRequired,
        undefined,
        REQUIRED
      )
    })
  })
})


//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(PropTypes.list, null)
//       typeCheckPass(PropTypes.list, undefined)
//     })
//     it('should warn for missing required values', function() {
//       fail(PropTypes.list.isRequired, null, requiredMessage)
//       fail(PropTypes.list.isRequired, undefined, requiredMessage)
//     })
//   })
//
//   describe('listOf Type', function() {
//     it('should support the listOf propTypes', function() {
//       typeCheckPass(PropTypes.listOf(React.PropTypes.number), Immutable.list([1, 2, 3]))
//       typeCheckPass(PropTypes.listOf(React.PropTypes.string), Immutable.list(['a', 'b', 'c']))
//       typeCheckPass(PropTypes.listOf(React.PropTypes.oneOf(['a', 'b'])), Immutable.list(['a', 'b']))
//     })
//
//     it('should support listOf with complex types', function() {
//       typeCheckPass(
//         PropTypes.listOf(React.PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.list([{a: 1}, {a: 2}])
//       )
//
//       typeCheckPass(
//         PropTypes.listOf(PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.fromJS([{a: 1}, {a: 2}])
//       )
//
//       function Thing() {}
//       typeCheckPass(
//         PropTypes.listOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.list([new Thing(), new Thing()])
//       )
//     })
//
//     it('should warn with invalid items in the list', function() {
//       fail(
//         PropTypes.listOf(React.PropTypes.number),
//         Immutable.list([1, 2, 'b']),
//         'Invalid prop `testProp[2]` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should warn with invalid complex types', function() {
//       function Thing() {}
//       var name = Thing.name || '<<anonymous>>'
//
//       fail(
//         PropTypes.listOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.list([new Thing(), 'xyz']),
//         'Invalid prop `testProp[1]` of type `String` supplied to `testComponent`, expected instance of `' +
//         name + '`.'
//       )
//     })
//
//     it('should warn when passed something other than an Immutable.list', function() {
//       fail(
//         PropTypes.listOf(React.PropTypes.number),
//         {'0': 'maybe-array', length: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.list.'
//       )
//       fail(
//         PropTypes.listOf(React.PropTypes.number),
//         123,
//         'Invalid prop `testProp` of type `number` supplied to ' +
//         '`testComponent`, expected a Mori.list.'
//       )
//       fail(
//         PropTypes.listOf(React.PropTypes.number),
//         'string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.list.'
//       )
//       fail(
//         PropTypes.listOf(React.PropTypes.number),
//         [1, 2, 3],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.list.'
//       )
//     })
//
//     it('should not warn when passing an empty array', function() {
//       typeCheckPass(PropTypes.listOf(React.PropTypes.number), Immutable.list())
//       typeCheckPass(PropTypes.listOf(React.PropTypes.number), Immutable.list([]))
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(PropTypes.listOf(React.PropTypes.number), null)
//       typeCheckPass(PropTypes.listOf(React.PropTypes.number), undefined)
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.listOf(React.PropTypes.number).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.listOf(React.PropTypes.number).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//   })
//
//   describe('StackOf Type', function() {
//     it('should support the stackOf propTypes', function() {
//       typeCheckPass(PropTypes.stackOf(React.PropTypes.number), Immutable.Stack([1, 2, 3]))
//       typeCheckPass(PropTypes.stackOf(React.PropTypes.string), Immutable.Stack(['a', 'b', 'c']))
//       typeCheckPass(PropTypes.stackOf(React.PropTypes.oneOf(['a', 'b'])), Immutable.Stack(['a', 'b']))
//     })
//
//     it('should support stackOf with complex types', function() {
//       typeCheckPass(
//         PropTypes.stackOf(React.PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.Stack([{a: 1}, {a: 2}])
//       )
//
//       function Thing() {}
//       typeCheckPass(
//         PropTypes.stackOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.Stack([new Thing(), new Thing()])
//       )
//     })
//
//     it('should warn with invalid items in the list', function() {
//       fail(
//         PropTypes.stackOf(React.PropTypes.number),
//         Immutable.Stack([1, 2, 'b']),
//         'Invalid prop `testProp[2]` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should warn with invalid complex types', function() {
//       function Thing() {}
//       var name = Thing.name || '<<anonymous>>'
//
//       fail(
//         PropTypes.stackOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.Stack([new Thing(), 'xyz']),
//         'Invalid prop `testProp[1]` of type `String` supplied to `testComponent`, expected instance of `' +
//         name + '`.'
//       )
//     })
//
//     it('should warn when passed something other than an Immutable.Stack', function() {
//       fail(
//         PropTypes.stackOf(React.PropTypes.number),
//         {'0': 'maybe-array', length: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.Stack.'
//       )
//       fail(
//         PropTypes.stackOf(React.PropTypes.number),
//         123,
//         'Invalid prop `testProp` of type `number` supplied to ' +
//         '`testComponent`, expected a Mori.Stack.'
//       )
//       fail(
//         PropTypes.stackOf(React.PropTypes.number),
//         'string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.Stack.'
//       )
//       fail(
//         PropTypes.stackOf(React.PropTypes.number),
//         [1, 2, 3],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.Stack.'
//       )
//     })
//
//     it('should not warn when passing an empty array', function() {
//       typeCheckPass(PropTypes.stackOf(React.PropTypes.number), Immutable.Stack())
//       typeCheckPass(PropTypes.stackOf(React.PropTypes.number), Immutable.Stack([]))
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(PropTypes.stackOf(React.PropTypes.number), null)
//       typeCheckPass(PropTypes.stackOf(React.PropTypes.number), undefined)
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.stackOf(React.PropTypes.number).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.stackOf(React.PropTypes.number).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//   })
//
//   describe('MapOf Type', function() {
//     it('should support the mapOf propTypes', function() {
//       typeCheckPass(PropTypes.mapOf(React.PropTypes.number), Immutable.Map({1: 1, 2: 2, 3: 3}))
//       typeCheckPass(PropTypes.mapOf(React.PropTypes.string), Immutable.Map({1: 'a', 2: 'b', 3: 'c'}))
//       typeCheckPass(PropTypes.mapOf(React.PropTypes.oneOf(['a', 'b'])), Immutable.Map({1: 'a', 2: 'b'}))
//     })
//
//     it('should support mapOf with complex types', function() {
//       typeCheckPass(
//         PropTypes.mapOf(React.PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.Map({1: {a: 1}, 2: {a: 2}})
//       )
//
//       typeCheckPass(
//         PropTypes.mapOf(PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.fromJS({1: {a: 1}, 2: {a: 2}})
//       )
//
//       function Thing() {}
//       typeCheckPass(
//         PropTypes.mapOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.Map({ 1: new Thing(), 2: new Thing() })
//       )
//     })
//
//     it('should warn with invalid items in the map', function() {
//       fail(
//         PropTypes.mapOf(React.PropTypes.number),
//         Immutable.Map({ 1: 1, 2: 2, 3: 'b' }),
//         'Invalid prop `testProp[2]` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should warn with invalid complex types', function() {
//       function Thing() {}
//       var name = Thing.name || '<<anonymous>>'
//
//       fail(
//         PropTypes.mapOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.Map({ 1: new Thing(), 2: 'xyz' }),
//         'Invalid prop `testProp[1]` of type `String` supplied to `testComponent`, expected instance of `' +
//         name + '`.'
//       )
//     })
//
//     it('should warn when passed something other than an Immutable.Map', function() {
//       fail(
//         PropTypes.mapOf(React.PropTypes.number),
//         {'0': 'maybe-array', length: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.Map.'
//       )
//       fail(
//         PropTypes.mapOf(React.PropTypes.number),
//         123,
//         'Invalid prop `testProp` of type `number` supplied to ' +
//         '`testComponent`, expected a Mori.Map.'
//       )
//       fail(
//         PropTypes.mapOf(React.PropTypes.number),
//         'string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.Map.'
//       )
//       fail(
//         PropTypes.mapOf(React.PropTypes.number),
//         [1, 2, 3],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.Map.'
//       )
//     })
//
//     it('should not warn when passing an empty object', function() {
//       typeCheckPass(PropTypes.mapOf(React.PropTypes.number), Immutable.Map())
//       typeCheckPass(PropTypes.mapOf(React.PropTypes.number), Immutable.Map({}))
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(PropTypes.mapOf(React.PropTypes.number), null)
//       typeCheckPass(PropTypes.mapOf(React.PropTypes.number), undefined)
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.mapOf(React.PropTypes.number).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.mapOf(React.PropTypes.number).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//   })
//
//   describe('OrderedMapOf Type', function() {
//     it('should support the orderedMapOf propTypes', function() {
//       typeCheckPass(PropTypes.orderedMapOf(React.PropTypes.number), Immutable.OrderedMap({1: 1, 2: 2, 3: 3}))
//       typeCheckPass(PropTypes.orderedMapOf(React.PropTypes.string), Immutable.OrderedMap({1: 'a', 2: 'b', 3: 'c'}))
//       typeCheckPass(PropTypes.orderedMapOf(React.PropTypes.oneOf(['a', 'b'])), Immutable.OrderedMap({1: 'a', 2: 'b'}))
//     })
//
//     it('should support orderedMapOf with complex types', function() {
//       typeCheckPass(
//         PropTypes.orderedMapOf(React.PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.OrderedMap({1: {a: 1}, 2: {a: 2}})
//       )
//
//       typeCheckPass(
//         PropTypes.orderedMapOf(PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.fromJS({1: {a: 1}, 2: {a: 2}}).toOrderedMap()
//       )
//
//       function Thing() {}
//       typeCheckPass(
//         PropTypes.orderedMapOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.OrderedMap({ 1: new Thing(), 2: new Thing() })
//       )
//     })
//
//     it('should warn with invalid items in the map', function() {
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.number),
//         Immutable.OrderedMap({ 1: 1, 2: 2, 3: 'b' }),
//         'Invalid prop `testProp[2]` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should warn with invalid complex types', function() {
//       function Thing() {}
//       var name = Thing.name || '<<anonymous>>'
//
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.OrderedMap({ 1: new Thing(), 2: 'xyz' }),
//         'Invalid prop `testProp[1]` of type `String` supplied to `testComponent`, expected instance of `' +
//         name + '`.'
//       )
//     })
//
//     it('should warn when passed something other than an Immutable.OrderedMap', function() {
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.number),
//         {'0': 'maybe-array', length: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedMap.'
//       )
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.number),
//         123,
//         'Invalid prop `testProp` of type `number` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedMap.'
//       )
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.number),
//         'string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedMap.'
//       )
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.number),
//         [1, 2, 3],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedMap.'
//       )
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.number),
//         Immutable.fromJS({a: 1, b: 2 }),
//         'Invalid prop `testProp` of type `Immutable.Map` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedMap.'
//       )
//     })
//
//     it('should not warn when passing an empty object', function() {
//       typeCheckPass(PropTypes.orderedMapOf(React.PropTypes.number), Immutable.OrderedMap())
//       typeCheckPass(PropTypes.orderedMapOf(React.PropTypes.number), Immutable.OrderedMap({}))
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(PropTypes.orderedMapOf(React.PropTypes.number), null)
//       typeCheckPass(PropTypes.orderedMapOf(React.PropTypes.number), undefined)
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.number).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.orderedMapOf(React.PropTypes.number).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//   })
//
//   describe('SetOf Type', function() {
//     it('should support the setOf propTypes', function() {
//       typeCheckPass(PropTypes.setOf(React.PropTypes.number), Immutable.Set([1, 2, 3]))
//       typeCheckPass(PropTypes.setOf(React.PropTypes.string), Immutable.Set(['a', 'b', 'c']))
//       typeCheckPass(PropTypes.setOf(React.PropTypes.oneOf(['a', 'b'])), Immutable.Set(['a', 'b']))
//     })
//
//     it('should support setOf with complex types', function() {
//       typeCheckPass(
//         PropTypes.setOf(React.PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.Set([{a: 1}, {a: 2}])
//       )
//
//       function Thing() {}
//       typeCheckPass(
//         PropTypes.setOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.Set([new Thing(), new Thing() ])
//       )
//     })
//
//     it('should warn with invalid items in the set', function() {
//       fail(
//         PropTypes.setOf(React.PropTypes.number),
//         Immutable.Set([1, 2, 'b']),
//         'Invalid prop `testProp[2]` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should warn with invalid complex types', function() {
//       function Thing() {}
//       var name = Thing.name || '<<anonymous>>'
//
//       fail(
//         PropTypes.setOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.Set([new Thing(), 'xyz' ]),
//         'Invalid prop `testProp[1]` of type `String` supplied to `testComponent`, expected instance of `' +
//         name + '`.'
//       )
//     })
//
//     it('should warn when passed something other than an Immutable.Set', function() {
//       fail(
//         PropTypes.setOf(React.PropTypes.number),
//         {'0': 'maybe-array', length: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.Set.'
//       )
//       fail(
//         PropTypes.setOf(React.PropTypes.number),
//         123,
//         'Invalid prop `testProp` of type `number` supplied to ' +
//         '`testComponent`, expected a Mori.Set.'
//       )
//       fail(
//         PropTypes.setOf(React.PropTypes.number),
//         'string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.Set.'
//       )
//       fail(
//         PropTypes.setOf(React.PropTypes.number),
//         [1, 2, 3],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.Set.'
//       )
//     })
//
//     it('should not warn when passing an empty object', function() {
//       typeCheckPass(PropTypes.setOf(React.PropTypes.number), Immutable.Set())
//       typeCheckPass(PropTypes.setOf(React.PropTypes.number), Immutable.Set([]))
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(PropTypes.setOf(React.PropTypes.number), null)
//       typeCheckPass(PropTypes.setOf(React.PropTypes.number), undefined)
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.setOf(React.PropTypes.number).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.setOf(React.PropTypes.number).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//   })
//
//   describe('OrderedSetOf Type', function() {
//     it('should support the orderedSetOf propTypes', function() {
//       typeCheckPass(PropTypes.orderedSetOf(React.PropTypes.number), Immutable.OrderedSet([1, 2, 3]))
//       typeCheckPass(PropTypes.orderedSetOf(React.PropTypes.string), Immutable.OrderedSet(['a', 'b', 'c']))
//       typeCheckPass(PropTypes.orderedSetOf(React.PropTypes.oneOf(['a', 'b'])), Immutable.OrderedSet(['a', 'b']))
//     })
//
//     it('should support orderedSetOf with complex types', function() {
//       typeCheckPass(
//         PropTypes.orderedSetOf(React.PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.OrderedSet([{a: 1}, {a: 2}])
//       )
//
//       function Thing() {}
//       typeCheckPass(
//         PropTypes.orderedSetOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.OrderedSet([new Thing(), new Thing() ])
//       )
//     })
//
//     it('should warn with invalid items in the set', function() {
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number),
//         Immutable.OrderedSet([1, 2, 'b']),
//         'Invalid prop `testProp[2]` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should warn with invalid complex types', function() {
//       function Thing() {}
//       var name = Thing.name || '<<anonymous>>'
//
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.OrderedSet([new Thing(), 'xyz' ]),
//         'Invalid prop `testProp[1]` of type `String` supplied to `testComponent`, expected instance of `' +
//         name + '`.'
//       )
//     })
//
//     it('should warn when passed something other than an Immutable.OrderedSet', function() {
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number),
//         {'0': 'maybe-array', length: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedSet.'
//       )
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number),
//         123,
//         'Invalid prop `testProp` of type `number` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedSet.'
//       )
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number),
//         'string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedSet.'
//       )
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number),
//         [1, 2, 3],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedSet.'
//       )
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number),
//         Immutable.list([1, 2, 3]),
//         'Invalid prop `testProp` of type `Immutable.list` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedSet.'
//       )
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number),
//         Immutable.Set([1, 2, 3]),
//         'Invalid prop `testProp` of type `Immutable.Set` supplied to ' +
//         '`testComponent`, expected a Mori.OrderedSet.'
//       )
//     })
//
//     it('should not warn when passing an empty object', function() {
//       typeCheckPass(PropTypes.orderedSetOf(React.PropTypes.number), Immutable.OrderedSet())
//       typeCheckPass(PropTypes.orderedSetOf(React.PropTypes.number), Immutable.OrderedSet([]))
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(PropTypes.orderedSetOf(React.PropTypes.number), null)
//       typeCheckPass(PropTypes.orderedSetOf(React.PropTypes.number), undefined)
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.orderedSetOf(React.PropTypes.number).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//   })
//
//   describe('IterableOf Type', function() {
//     it('should support the iterableOf propTypes', function() {
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.number), Immutable.list([1, 2, 3]))
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.string), Immutable.list(['a', 'b', 'c']))
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.oneOf(['a', 'b'])), Immutable.list(['a', 'b']))
//
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.number), Immutable.Map({1: 1, 2: 2, 3: 3}))
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.string), Immutable.Map({1: 'a', 2: 'b', 3: 'c'}))
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.oneOf(['a', 'b'])), Immutable.Map({1: 'a', 2: 'b'}))
//     })
//
//     it('should support iterableOf with complex types', function() {
//       function Thing() {}
//
//       typeCheckPass(
//         PropTypes.iterableOf(React.PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.list([{a: 1}, {a: 2}])
//       )
//
//       typeCheckPass(
//         PropTypes.iterableOf(PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.fromJS([{a: 1}, {a: 2}])
//       )
//
//       typeCheckPass(
//         PropTypes.iterableOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.list([new Thing(), new Thing()])
//       )
//
//       typeCheckPass(
//         PropTypes.iterableOf(React.PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.Map({1: {a: 1}, 2: {a: 2}})
//       )
//
//       typeCheckPass(
//         PropTypes.iterableOf(PropTypes.shape({a: React.PropTypes.number.isRequired})),
//         Immutable.fromJS({1: {a: 1}, 2: {a: 2}})
//       )
//
//       typeCheckPass(
//         PropTypes.iterableOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.Map({ 1: new Thing(), 2: new Thing() })
//       )
//     })
//
//     it('should warn with invalid items in the list', function() {
//       fail(
//         PropTypes.iterableOf(React.PropTypes.number),
//         Immutable.list([1, 2, 'b']),
//         'Invalid prop `testProp[2]` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//
//       fail(
//         PropTypes.iterableOf(React.PropTypes.number),
//         Immutable.Map({ 1: 1, 2: 2, 3: 'b' }),
//         'Invalid prop `testProp[2]` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should warn with invalid complex types', function() {
//       function Thing() {}
//       var name = Thing.name || '<<anonymous>>'
//
//       fail(
//         PropTypes.iterableOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.list([new Thing(), 'xyz']),
//         'Invalid prop `testProp[1]` of type `String` supplied to `testComponent`, expected instance of `' +
//         name + '`.'
//       )
//
//       fail(
//         PropTypes.iterableOf(React.PropTypes.instanceOf(Thing)),
//         Immutable.Map({ 1: new Thing(), 2: 'xyz' }),
//         'Invalid prop `testProp[1]` of type `String` supplied to `testComponent`, expected instance of `' +
//         name + '`.'
//       )
//     })
//
//     it('should warn when passed something other than an Immutable.Iterable', function() {
//       fail(
//         PropTypes.iterableOf(React.PropTypes.number),
//         {'0': 'maybe-array', length: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//       fail(
//         PropTypes.iterableOf(React.PropTypes.number),
//         123,
//         'Invalid prop `testProp` of type `number` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//       fail(
//         PropTypes.iterableOf(React.PropTypes.number),
//         'string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//       fail(
//         PropTypes.iterableOf(React.PropTypes.number),
//         [1, 2, 3],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//     })
//
//     it('should not warn when passing an empty iterable', function() {
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.number), Immutable.list())
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.number), Immutable.list([]))
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.number), Immutable.Map({}))
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.number), null)
//       typeCheckPass(PropTypes.iterableOf(React.PropTypes.number), undefined)
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.iterableOf(React.PropTypes.number).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.iterableOf(React.PropTypes.number).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//   })
//
//   describe('RecordOf Type', function() {
//     it('should warn for non objects', function() {
//       fail(
//         PropTypes.recordOf({}),
//         'some string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.Record.'
//       )
//       fail(
//         PropTypes.recordOf({}),
//         ['array'],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.Record.'
//       )
//       fail(
//         PropTypes.recordOf({}),
//         {a: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.Record.'
//       )
//       fail(
//         PropTypes.recordOf({}),
//         Immutable.Map({ a: 1 }),
//         'Invalid prop `testProp` of type `Immutable.Map` supplied to ' +
//         '`testComponent`, expected a Mori.Record.'
//       )
//     })
//
//     it('should not warn for empty values', function() {
//       typeCheckPass(PropTypes.recordOf({}), undefined)
//       typeCheckPass(PropTypes.recordOf({}), null)
//     })
//
//     it('should not warn for an empty Record object', function() {
//       typeCheckPass(PropTypes.recordOf({}).isRequired, new (Immutable.Record({}))())
//     })
//
//     it('should not warn for non specified types', function() {
//       typeCheckPass(PropTypes.recordOf({}), new (Immutable.Record({key: 1}))())
//     })
//
//     it('should not warn for valid types', function() {
//       typeCheckPass(PropTypes.recordOf({key: React.PropTypes.number}), new (Immutable.Record({key: 1}))())
//     })
//
//     it('should ignore null keys', function() {
//       typeCheckPass(PropTypes.recordOf({key: null}), new (Immutable.Record({key: 1}))())
//     })
//
//     it('should warn for required valid types', function() {
//       fail(
//         PropTypes.recordOf({key: React.PropTypes.number.isRequired}),
//         new (Immutable.Record({}))(),
//         'Required prop `testProp.key` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should warn for the first required type', function() {
//       fail(
//         PropTypes.recordOf({
//           key: React.PropTypes.number.isRequired,
//           secondKey: React.PropTypes.number.isRequired
//         }),
//         new (Immutable.Record({}))(),
//         'Required prop `testProp.key` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should warn for invalid key types', function() {
//       fail(PropTypes.recordOf({key: React.PropTypes.number}),
//         new (Immutable.Record({key: 'abc'}))(),
//         'Invalid prop `testProp.key` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(
//         PropTypes.recordOf(PropTypes.recordOf({key: React.PropTypes.number})), null
//       )
//       typeCheckPass(
//         PropTypes.recordOf(PropTypes.recordOf({key: React.PropTypes.number})), undefined
//       )
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.recordOf({key: React.PropTypes.number}).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.recordOf({key: React.PropTypes.number}).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//   })
//
//   describe('Shape Types [deprecated]', function() {
//     it('should warn for non objects', function() {
//       fail(
//         PropTypes.shape({}),
//         'some string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//       fail(
//         PropTypes.shape({}),
//         ['array'],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//       fail(
//         PropTypes.shape({}),
//         {a: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//     })
//
//     it('should not warn for empty values', function() {
//       typeCheckPass(PropTypes.shape({}), undefined)
//       typeCheckPass(PropTypes.shape({}), null)
//       typeCheckPass(PropTypes.shape({}), Immutable.fromJS({}))
//     })
//
//     it('should not warn for an empty Immutable object', function() {
//       typeCheckPass(PropTypes.shape({}).isRequired, Immutable.fromJS({}))
//     })
//
//     it('should not warn for non specified types', function() {
//       typeCheckPass(PropTypes.shape({}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should not warn for valid types', function() {
//       typeCheckPass(PropTypes.shape({key: React.PropTypes.number}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should ignore null keys', function() {
//       typeCheckPass(PropTypes.shape({key: null}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should warn for required valid types', function() {
//       fail(
//         PropTypes.shape({key: React.PropTypes.number.isRequired}),
//         Immutable.fromJS({}),
//         'Required prop `testProp.key` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should warn for the first required type', function() {
//       fail(
//         PropTypes.shape({
//           key: React.PropTypes.number.isRequired,
//           secondKey: React.PropTypes.number.isRequired
//         }),
//         Immutable.fromJS({}),
//         'Required prop `testProp.key` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should warn for invalid key types', function() {
//       fail(PropTypes.shape({key: React.PropTypes.number}),
//         Immutable.fromJS({key: 'abc'}),
//         'Invalid prop `testProp.key` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(
//         PropTypes.shape(PropTypes.shape({key: React.PropTypes.number})), null
//       )
//       typeCheckPass(
//         PropTypes.shape(PropTypes.shape({key: React.PropTypes.number})), undefined
//       )
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.shape({key: React.PropTypes.number}).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.shape({key: React.PropTypes.number}).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//
//     it('should probably not validate a list, but does', function() {
//       var shape = {
//         0: React.PropTypes.number.isRequired,
//         1: React.PropTypes.string.isRequired,
//         2: React.PropTypes.string
//       }
//       typeCheckPass(PropTypes.shape(shape), Immutable.list([1, '2']))
//     })
//   })
//
//   describe('Contains Types', function() {
//     it('should warn for non objects', function() {
//       fail(
//         PropTypes.contains({}),
//         'some string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//       fail(
//         PropTypes.contains({}),
//         ['array'],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//       fail(
//         PropTypes.contains({}),
//         {a: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.Iterable.'
//       )
//     })
//
//     it('should not warn for empty values', function() {
//       typeCheckPass(PropTypes.contains({}), undefined)
//       typeCheckPass(PropTypes.contains({}), null)
//       typeCheckPass(PropTypes.contains({}), Immutable.fromJS({}))
//     })
//
//     it('should not warn for an empty Immutable object', function() {
//       typeCheckPass(PropTypes.contains({}).isRequired, Immutable.fromJS({}))
//     })
//
//     it('should not warn for non specified types', function() {
//       typeCheckPass(PropTypes.contains({}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should not warn for valid types', function() {
//       typeCheckPass(PropTypes.contains({key: React.PropTypes.number}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should ignore null keys', function() {
//       typeCheckPass(PropTypes.contains({key: null}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should warn for required valid types', function() {
//       fail(
//         PropTypes.contains({key: React.PropTypes.number.isRequired}),
//         Immutable.fromJS({}),
//         'Required prop `testProp.key` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should warn for the first required type', function() {
//       fail(
//         PropTypes.contains({
//           key: React.PropTypes.number.isRequired,
//           secondKey: React.PropTypes.number.isRequired
//         }),
//         Immutable.fromJS({}),
//         'Required prop `testProp.key` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should warn for invalid key types', function() {
//       fail(PropTypes.contains({key: React.PropTypes.number}),
//         Immutable.fromJS({key: 'abc'}),
//         'Invalid prop `testProp.key` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(
//         PropTypes.contains(PropTypes.contains({key: React.PropTypes.number})), null
//       )
//       typeCheckPass(
//         PropTypes.contains(PropTypes.contains({key: React.PropTypes.number})), undefined
//       )
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.contains({key: React.PropTypes.number}).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.contains({key: React.PropTypes.number}).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//
//     it('should probably not validate a list, but does', function() {
//       var contains = {
//         0: React.PropTypes.number.isRequired,
//         1: React.PropTypes.string.isRequired,
//         2: React.PropTypes.string
//       }
//       typeCheckPass(PropTypes.contains(contains), Immutable.list([1, '2']))
//     })
//   })
//
//   describe('MapContains Types', function() {
//     it('should warn for non objects', function() {
//       fail(
//         PropTypes.mapContains({}),
//         'some string',
//         'Invalid prop `testProp` of type `string` supplied to ' +
//         '`testComponent`, expected a Mori.Map.'
//       )
//       fail(
//         PropTypes.mapContains({}),
//         ['array'],
//         'Invalid prop `testProp` of type `array` supplied to ' +
//         '`testComponent`, expected a Mori.Map.'
//       )
//       fail(
//         PropTypes.mapContains({}),
//         {a: 1},
//         'Invalid prop `testProp` of type `object` supplied to ' +
//         '`testComponent`, expected a Mori.Map.'
//       )
//     })
//
//     it('should not warn for empty values', function() {
//       typeCheckPass(PropTypes.mapContains({}), undefined)
//       typeCheckPass(PropTypes.mapContains({}), null)
//       typeCheckPass(PropTypes.mapContains({}), Immutable.fromJS({}))
//     })
//
//     it('should not warn for an empty Immutable object', function() {
//       typeCheckPass(PropTypes.mapContains({}).isRequired, Immutable.fromJS({}))
//     })
//
//     it('should not warn for non specified types', function() {
//       typeCheckPass(PropTypes.mapContains({}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should not warn for valid types', function() {
//       typeCheckPass(PropTypes.mapContains({key: React.PropTypes.number}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should not warn for nested valid types', function() {
//       typeCheckPass(
//         PropTypes.mapContains({
//           data: PropTypes.listOf(PropTypes.mapContains({
//             id: React.PropTypes.number.isRequired
//           })).isRequired
//         }),
//         Immutable.fromJS({data: [{id: 1}, {id: 2}]})
//       )
//     })
//
//     it('should warn for nested invalid types', function() {
//       fail(
//         PropTypes.mapContains({
//           data: PropTypes.listOf(PropTypes.mapContains({
//             id: React.PropTypes.number.isRequired
//           })).isRequired
//         }),
//         Immutable.fromJS({data: [{id: 1}, {}]}),
//         'Required prop `testProp.data[1].id` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should ignore null keys', function() {
//       typeCheckPass(PropTypes.mapContains({key: null}), Immutable.fromJS({key: 1}))
//     })
//
//     it('should warn for required valid types', function() {
//       fail(
//         PropTypes.mapContains({key: React.PropTypes.number.isRequired}),
//         Immutable.fromJS({}),
//         'Required prop `testProp.key` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should warn for the first required type', function() {
//       fail(
//         PropTypes.mapContains({
//           key: React.PropTypes.number.isRequired,
//           secondKey: React.PropTypes.number.isRequired
//         }),
//         Immutable.fromJS({}),
//         'Required prop `testProp.key` was not specified in `testComponent`.'
//       )
//     })
//
//     it('should warn for invalid key types', function() {
//       fail(PropTypes.mapContains({key: React.PropTypes.number}),
//         Immutable.fromJS({key: 'abc'}),
//         'Invalid prop `testProp.key` of type `string` supplied to `testComponent`, ' +
//         'expected `number`.'
//       )
//     })
//
//     it('should be implicitly optional and not warn without values', function() {
//       typeCheckPass(
//         PropTypes.mapContains(PropTypes.mapContains({key: React.PropTypes.number})), null
//       )
//       typeCheckPass(
//         PropTypes.mapContains(PropTypes.mapContains({key: React.PropTypes.number})), undefined
//       )
//     })
//
//     it('should warn for missing required values', function() {
//       fail(
//         PropTypes.mapContains({key: React.PropTypes.number}).isRequired,
//         null,
//         requiredMessage
//       )
//       fail(
//         PropTypes.mapContains({key: React.PropTypes.number}).isRequired,
//         undefined,
//         requiredMessage
//       )
//     })
//
//     it('should not validate a list', function() {
//       var contains = {
//         0: React.PropTypes.number.isRequired,
//         1: React.PropTypes.string.isRequired,
//         2: React.PropTypes.string
//       }
//       fail(
//         PropTypes.mapContains(contains),
//         Immutable.list([1, '2']),
//         'Invalid prop `testProp` of type `Immutable.list` supplied to `testComponent`, expected a Mori.Map.'
//       )
//     })
//   })
// })
