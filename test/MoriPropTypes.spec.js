import { describe, it } from 'mocha'
import { expect } from 'chai'
import mori from 'mori'
import React from 'react'

import PropTypes from '../src/MoriPropTypes'

function Thing() {}

const ANONYMOUS = '<<anonymous>>'
const THING_NAME = Thing.name || ANONYMOUS
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
      pass(
        PropTypes.listOf(React.PropTypes.number),
        mori.list(1, 2, 3)
      )
      fail(
        PropTypes.listOf(123),
        mori.list(1, 2, 3),
        'Invalid typeChecker supplied to ' +
        '`testComponent` for propType `testProp`, expected a function.'
      )
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

    it('should warn for invalid set', () => {
      failAll(PropTypes.set, 'Mori.set', ['Mori.set', 'Mori.sortedSet'])
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
  })

  describe('listOf Type', () => {
    it('should support the listOf propTypes', () => {
      pass(PropTypes.listOf(React.PropTypes.number), mori.list(1, 2, 3))
      pass(PropTypes.listOf(React.PropTypes.string), mori.list('a', 'b', 'c'))
      pass(PropTypes.listOf(React.PropTypes.oneOf(['a', 'b'])), mori.list('a', 'b'))
    })

    it('should warn when passed something other than a Mori.list', () => {
      failAll(PropTypes.listOf(React.PropTypes.number), 'Mori.list', ['Mori.list'])
    })

    it('should not warn when passing an empty list', () => {
      pass(PropTypes.listOf(React.PropTypes.number), mori.list())
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

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.listOf(React.PropTypes.number), null)
      pass(PropTypes.listOf(React.PropTypes.number), undefined)
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
      fail(
        PropTypes.listOf(React.PropTypes.instanceOf(Thing)),
        mori.list(new Thing(), 'xyz'),
        'Invalid prop `testProp[1]` of type `String` ' +
        'supplied to `testComponent`, expected instance of `' + THING_NAME + '`.'
      )
    })
  })

  describe('mapOf Type', () => {
    it('should support the mapOf propTypes', () => {
      pass(PropTypes.mapOf(React.PropTypes.number), mori.hashMap({ 1: 1, 2: 2, 3: 3 }))
      pass(PropTypes.mapOf(React.PropTypes.string), mori.hashMap({ 1: 'a', 2: 'b', 3: 'c' }))
      pass(PropTypes.mapOf(React.PropTypes.oneOf(['a', 'b'])), mori.hashMap({ a: 1, b: 2 }))
    })

    it('should warn when passed something other than a Mori.map', () => {
      failAll(PropTypes.mapOf(React.PropTypes.number), 'Mori.map', ['Mori.map', 'Mori.sortedMap'])
    })

    it('should not warn when passing an empty map', () => {
      pass(PropTypes.mapOf(React.PropTypes.number), mori.hashMap())
    })

    it('should warn for missing required values', () => {
      fail(
        PropTypes.mapOf(React.PropTypes.number).isRequired,
        null,
        REQUIRED,
      )
      fail(
        PropTypes.mapOf(React.PropTypes.number).isRequired,
        undefined,
        REQUIRED
      )
    })

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.mapOf(React.PropTypes.number), null)
      pass(PropTypes.mapOf(React.PropTypes.number), undefined)
    })

    it('should support mapOf with complex types', () => {
      pass(
        PropTypes.mapOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.hashMap({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.mapOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.hashMap({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.mapOf(React.PropTypes.instanceOf(Thing)),
        mori.hashMap(new Thing(), new Thing())
      )
    })

    it('should warn with invalid items in the map', () => {
      fail(
        PropTypes.mapOf(React.PropTypes.number),
        mori.hashMap(1, 1, 2, 2, 3, 'c'),
        'Invalid prop `testProp[2]` of type `string` ' +
        'supplied to `testComponent`, expected `number`.'
      )
    })

    it('should warn with invalid complex types', () => {
      fail(
        PropTypes.mapOf(React.PropTypes.instanceOf(Thing)),
        mori.hashMap(1, new Thing(), 2, 'foo'),
        'Invalid prop `testProp[1]` of type `String` ' +
        'supplied to `testComponent`, expected instance of `' + THING_NAME + '`.'
      )
    })
  })

  describe('queueOf Type', () => {
    it('should support the queueOf propTypes', () => {
      pass(PropTypes.queueOf(React.PropTypes.number), mori.queue(1, 2, 3))
      pass(PropTypes.queueOf(React.PropTypes.string), mori.queue('a', 'b', 'c'))
      pass(PropTypes.queueOf(React.PropTypes.oneOf(['a', 'b'])), mori.queue('a', 'b'))
    })

    it('should warn when passed something other than a Mori.queue', () => {
      failAll(PropTypes.queueOf(React.PropTypes.number), 'Mori.queue', ['Mori.queue'])
    })

    it('should not warn when passing an empty queue', () => {
      pass(PropTypes.queueOf(React.PropTypes.number), mori.queue())
    })

    it('should warn for missing required values', () => {
      fail(
        PropTypes.queueOf(React.PropTypes.number).isRequired,
        null,
        REQUIRED,
      )
      fail(
        PropTypes.queueOf(React.PropTypes.number).isRequired,
        undefined,
        REQUIRED
      )
    })

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.queueOf(React.PropTypes.number), null)
      pass(PropTypes.queueOf(React.PropTypes.number), undefined)
    })

    it('should support queueOf with complex types', () => {
      pass(
        PropTypes.queueOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.queue({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.queueOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.queue({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.queueOf(React.PropTypes.instanceOf(Thing)),
        mori.queue(new Thing(), new Thing())
      )
    })

    it('should warn with invalid items in the queue', () => {
      fail(
        PropTypes.queueOf(React.PropTypes.number),
        mori.queue(1, 2, 'b'),
        'Invalid prop `testProp[2]` of type `string` ' +
        'supplied to `testComponent`, expected `number`.'
      )
    })

    it('should warn with invalid complex types', () => {
      fail(
        PropTypes.queueOf(React.PropTypes.instanceOf(Thing)),
        mori.queue(new Thing(), 'xyz'),
        'Invalid prop `testProp[1]` of type `String` ' +
        'supplied to `testComponent`, expected instance of `' + THING_NAME + '`.'
      )
    })
  })

  describe('setOf Type', () => {
    it('should support the setOf propTypes', () => {
      pass(PropTypes.setOf(React.PropTypes.string), mori.set('a', 'b', 'c'))
      pass(PropTypes.setOf(React.PropTypes.oneOf(['a', 'b'])), mori.set('a', 'b'))
    })

    it('should warn when passed something other than a Mori.set', () => {
      failAll(PropTypes.setOf(React.PropTypes.number), 'Mori.set', ['Mori.set', 'Mori.sortedSet'])
    })

    it('should not warn when passing an empty set', () => {
      pass(PropTypes.setOf(React.PropTypes.number), mori.set())
    })

    it('should warn for missing required values', () => {
      fail(
        PropTypes.setOf(React.PropTypes.number).isRequired,
        null,
        REQUIRED,
      )
      fail(
        PropTypes.setOf(React.PropTypes.number).isRequired,
        undefined,
        REQUIRED
      )
    })

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.setOf(React.PropTypes.number), null)
      pass(PropTypes.setOf(React.PropTypes.number), undefined)
    })
  })

  describe('sortedMapOf Type', () => {
    it('should support the sortedMapOf propTypes', () => {
      pass(PropTypes.sortedMapOf(React.PropTypes.number), mori.sortedMap(1, 2, 3))
      pass(PropTypes.sortedMapOf(React.PropTypes.string), mori.sortedMap('a', 'b', 'c'))
      pass(PropTypes.sortedMapOf(React.PropTypes.oneOf(['a', 'b'])), mori.sortedMap('a', 'b'))
    })

    it('should warn when passed something other than a Mori.sortedMap', () => {
      failAll(PropTypes.sortedMapOf(React.PropTypes.number), 'Mori.sortedMap', ['Mori.sortedMap'])
    })

    it('should not warn when passing an empty sortedMap', () => {
      pass(PropTypes.sortedMapOf(React.PropTypes.number), mori.sortedMap())
    })

    it('should warn for missing required values', () => {
      fail(
        PropTypes.sortedMapOf(React.PropTypes.number).isRequired,
        null,
        REQUIRED,
      )
      fail(
        PropTypes.sortedMapOf(React.PropTypes.number).isRequired,
        undefined,
        REQUIRED
      )
    })

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.sortedMapOf(React.PropTypes.number), null)
      pass(PropTypes.sortedMapOf(React.PropTypes.number), undefined)
    })

    it('should support sortedMapOf with complex types', () => {
      pass(
        PropTypes.sortedMapOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.sortedMap({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.sortedMapOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.sortedMap({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.sortedMapOf(React.PropTypes.instanceOf(Thing)),
        mori.sortedMap(new Thing(), new Thing())
      )
    })

    it('should warn with invalid items in the sortedMap', () => {
      fail(
        PropTypes.sortedMapOf(React.PropTypes.number),
        mori.sortedMap(1, 1, 2, 2, 3, 'c'),
        'Invalid prop `testProp[2]` of type `string` ' +
        'supplied to `testComponent`, expected `number`.'
      )
    })

    it('should warn with invalid complex types', () => {
      fail(
        PropTypes.sortedMapOf(React.PropTypes.instanceOf(Thing)),
        mori.sortedMap(1, new Thing(), 2, 'foo'),
        'Invalid prop `testProp[1]` of type `String` ' +
        'supplied to `testComponent`, expected instance of `' + THING_NAME + '`.'
      )
    })
  })

  describe('sortedSetOf Type', () => {
    it('should support the sortedSetOf propTypes', () => {
      pass(PropTypes.sortedSetOf(React.PropTypes.number), mori.sortedSet(1, 2, 3))
      pass(PropTypes.sortedSetOf(React.PropTypes.string), mori.sortedSet('a', 'b', 'c'))
      pass(PropTypes.sortedSetOf(React.PropTypes.oneOf(['a', 'b'])), mori.sortedSet('a', 'b'))
    })

    it('should warn when passed something other than a Mori.sortedSet', () => {
      failAll(PropTypes.sortedSetOf(React.PropTypes.number), 'Mori.sortedSet', ['Mori.sortedSet'])
    })

    it('should not warn when passing an empty sortedSet', () => {
      pass(PropTypes.sortedSetOf(React.PropTypes.number), mori.sortedSet())
    })

    it('should warn for missing required values', () => {
      fail(
        PropTypes.sortedSetOf(React.PropTypes.number).isRequired,
        null,
        REQUIRED,
      )
      fail(
        PropTypes.sortedSetOf(React.PropTypes.number).isRequired,
        undefined,
        REQUIRED
      )
    })

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.sortedSetOf(React.PropTypes.number), null)
      pass(PropTypes.sortedSetOf(React.PropTypes.number), undefined)
    })

    it('should support sortedSetOf with complex types', () => {
      pass(
        PropTypes.sortedSetOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.sortedSet({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.sortedSetOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.sortedSet({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.sortedSetOf(React.PropTypes.instanceOf(Thing)),
        mori.sortedSet(new Thing(), new Thing())
      )
    })
  })

  describe('vecOf Type', () => {
    it('should support the vecOf propTypes', () => {
      pass(PropTypes.vecOf(React.PropTypes.number), mori.vector(1, 2, 3))
      pass(PropTypes.vecOf(React.PropTypes.string), mori.vector('a', 'b', 'c'))
      pass(PropTypes.vecOf(React.PropTypes.oneOf(['a', 'b'])), mori.vector('a', 'b'))
    })

    it('should warn when passed something other than a Mori.vec', () => {
      failAll(PropTypes.vecOf(React.PropTypes.number), 'Mori.vec', ['Mori.vec'])
    })

    it('should not warn when passing an empty list', () => {
      pass(PropTypes.vecOf(React.PropTypes.number), mori.vector())
    })

    it('should warn for missing required values', () => {
      fail(
        PropTypes.vecOf(React.PropTypes.number).isRequired,
        null,
        REQUIRED,
      )
      fail(
        PropTypes.vecOf(React.PropTypes.number).isRequired,
        undefined,
        REQUIRED
      )
    })

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.vecOf(React.PropTypes.number), null)
      pass(PropTypes.vecOf(React.PropTypes.number), undefined)
    })

    it('should support vecOf with complex types', () => {
      pass(
        PropTypes.vecOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.vector({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.vecOf(React.PropTypes.shape({ a: React.PropTypes.number.isRequired })),
        mori.vector({ a: 1 }, { a: 2 })
      )

      pass(
        PropTypes.vecOf(React.PropTypes.instanceOf(Thing)),
        mori.vector(new Thing(), new Thing())
      )
    })

    it('should warn with invalid items in the list', () => {
      fail(
        PropTypes.vecOf(React.PropTypes.number),
        mori.vector(1, 2, 'b'),
        'Invalid prop `testProp[2]` of type `string` ' +
        'supplied to `testComponent`, expected `number`.'
      )
    })

    it('should warn with invalid complex types', () => {
      fail(
        PropTypes.vecOf(React.PropTypes.instanceOf(Thing)),
        mori.vector(new Thing(), 'xyz'),
        'Invalid prop `testProp[1]` of type `String` ' +
        'supplied to `testComponent`, expected instance of `' + THING_NAME + '`.'
      )
    })
  })

  describe('contains Type', () => {
    it('should not warn for empty values', () => {
      pass(PropTypes.contains({}), undefined)
      pass(PropTypes.contains({}), null)
      pass(PropTypes.contains({}), mori.toClj({}))
    })

    it('should warn for non objects', () => {
      fail(
        PropTypes.contains({}),
        'some string',
        'Invalid prop `testProp` of type `string` supplied to ' +
        '`testComponent`, expected a `Mori.map`.'
      )
      fail(
        PropTypes.contains({}),
        ['array'],
        'Invalid prop `testProp` of type `array` supplied to ' +
        '`testComponent`, expected a `Mori.map`.'
      )
      fail(
        PropTypes.contains({}),
        { a: 1 },
        'Invalid prop `testProp` of type `object` supplied to ' +
        '`testComponent`, expected a `Mori.map`.'
      )
    })

    it('should warn for missing required values', () => {
      fail(
        PropTypes.contains({}).isRequired,
        null,
        REQUIRED,
      )
      fail(
        PropTypes.contains({}).isRequired,
        undefined,
        REQUIRED
      )
    })

    it('should not warn for non specified types', () => {
      pass(PropTypes.contains({}), mori.toClj({ key: 1 }))
    })

    it('should not warn for valid types', () => {
      pass(PropTypes.contains({ key: React.PropTypes.number }), mori.toClj({ key: 1 }))
    })

    it('should ignore null keys', () => {
      pass(PropTypes.contains({ key: null }), mori.toClj({ key: 1 }))
    })

    it('should warn for required valid types', () => {
      fail(
        PropTypes.contains({ key: React.PropTypes.number.isRequired }),
        mori.toClj({}),
        'Required prop `testProp.key` was not specified in `testComponent`.'
      )
    })

    it('should warn for the first required type', () => {
      fail(
        PropTypes.contains({
          key: React.PropTypes.number.isRequired,
          secondKey: React.PropTypes.number.isRequired,
        }),
        mori.toClj({}),
        'Required prop `testProp.key` was not specified in `testComponent`.'
      )
    })

    it('should warn for invalid key types', () => {
      fail(PropTypes.contains({ key: React.PropTypes.number }),
        mori.toClj({ key: 'abc' }),
        'Invalid prop `testProp.key` of type `string` supplied to `testComponent`, ' +
        'expected `number`.'
      )
    })

    it('should be implicitly optional and not warn without values', () => {
      pass(PropTypes.contains(PropTypes.contains({})), null)
      pass(PropTypes.contains(PropTypes.contains({})), undefined)
    })
  })
})
