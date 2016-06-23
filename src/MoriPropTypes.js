/**
 * This is a straight rip-off of the React.js ReactPropTypes.js proptype validators,
 * modified to make it possible to validate mori.js data.
 *    MoriPropTypes.vectorOf is patterned after React.PropTypes.arrayOf, but for mori.vector
 *    MoriPropTypes.listOf is patterned after React.PropTypes.listOf, but for mori.list
 *    MoriPropTypes.shape is based on React.PropTypes.shape, but for any mori.iterable
 */

import mori from 'mori'

const ANONYMOUS = '<<anonymous>>'

const typeCheckCreator = (type) => (value) => {
  return Object.getPrototypeOf(value) === Object.getPrototypeOf(type)
}

const isQueue = typeCheckCreator(mori.queue())

const isRange = typeCheckCreator(mori.range())

const isSortedMap = typeCheckCreator(mori.sortedMap())

const isSortedSet = typeCheckCreator(mori.sortedSet())

const getPropType = (propValue) => {
  const propType = typeof propValue

  if (Array.isArray(propValue)) {
    return 'array'
  }

  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return 'object'
  }

  if (isQueue(propValue)) {
    return 'Mori.queue'
  }

  if (isRange(propValue)) {
    return 'Mori.range'
  }

  if (isSortedMap(propValue)) {
    return 'Mori.sortedMap'
  }

  if (isSortedSet(propValue)) {
    return 'Mori.sortedSet'
  }

  if (mori.isList(propValue)) {
    return 'Mori.list'
  }

  if (mori.isVector(propValue)) {
    return 'Mori.vec'
  }

  if (mori.isMap(propValue)) {
    return 'Mori.map'
  }

  if (mori.isSet(propValue)) {
    return 'Mori.set'
  }

  if (mori.isSeq(propValue)) {
    return 'Mori.seq'
  }

  return propType
}

const createChainableTypeChecker = (validate) => {
  const checkType = (
    isRequired,
    props,
    propName,
    componentName,
    location,
    propFullName
  ) => {
    if (props[propName] === null) {
      if (isRequired) {
        return new Error(
          `Required ${location} \`${propFullName || propName}\` was not ` +
          `specified in \`${componentName || ANONYMOUS}\`.`
        )
      }
    } else {
      return validate(props, propName, componentName, location, propFullName)
    }
  }

  const chainedCheckType = checkType.bind(null, false)
  chainedCheckType.isRequired = checkType.bind(null, true)

  return chainedCheckType
}

const createMoriTypeChecker = (moriClassName, moriClassTypeValidator) => {
  const validate = (props, propName, componentName, location, propFullName) => {
    const propValue = props[propName]

    if (!moriClassTypeValidator(propValue)) {
      const propType = getPropType(propValue)

      return new Error(
        `Invalid ${location} \`${propFullName || propName}\` of type \`${propType}\` ` +
        `supplied to \`${componentName}\`, expected \`Mori.${moriClassName}\`.`
      )
    }

    return null
  }
  return createChainableTypeChecker(validate)
}

const createCollectionTypeChecker = (typeChecker, moriClassName, moriClassTypeValidator) => {
  const validate = (props, propName, componentName, location, propFullName) => {
    const propValue = props[propName]

    if (typeof typeChecker !== 'function') {
      return new Error(
        `Invalid typeChecker supplied to \`${componentName}\` ` +
        `for propType \`${propFullName}\`, expected a function.`
      )
    }

    if (!moriClassTypeValidator(propValue)) {
      const propType = getPropType(propValue)

      return new Error(
        `Invalid ${location} \`${propFullName}\` of type ` +
        `\`${propType}\` supplied to \`${componentName}\`, ` +
        `expected an Immutable.js ${moriClassName}.`
      )
    }

    const propValues = propValue.toArray()
    for (let i = 0, len = propValues.length; i < len; i++) {
      const error = typeChecker(propValues, i, componentName, location, `${propFullName}[${i}]`)
      if (error instanceof Error) {
        return error
      }
    }
  }
  return createChainableTypeChecker(validate)
}

export const coll = createMoriTypeChecker('coll', mori.isCollection)

export const map = createMoriTypeChecker('map', mori.isMap)

export const list = createMoriTypeChecker('list', mori.isList)

export const queue = createMoriTypeChecker('queue', isQueue)

export const range = createMoriTypeChecker('range', isRange)

export const seq = createMoriTypeChecker('seq', mori.isSeq)

export const set = createMoriTypeChecker('set', mori.isSet)

export const sortedMap = createMoriTypeChecker('sortedMap', isSortedMap)

export const sortedSet = createMoriTypeChecker('sortedSet', isSortedSet)

export const vec = createMoriTypeChecker('vec', mori.isVector)

export const vecOf = (typeChecker) => {
  return createCollectionTypeChecker(typeChecker, 'vec', mori.isVector)
}

export default {
  coll,
  list,
  map,
  queue,
  range,
  seq,
  set,
  sortedMap,
  sortedSet,
  vec,
  vecOf,
}
