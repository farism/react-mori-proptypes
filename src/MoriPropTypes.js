/**
 * This is a straight rip-off of the React.js ReactPropTypes.js proptype validators,
 * modified to make it possible to validate mori.js data.
 *    MoriPropTypes.vectorOf is patterned after React.PropTypes.arrayOf, but for mori.vector
 *    MoriPropTypes.listOf is patterned after React.PropTypes.listOf, but for mori.list
 *    MoriPropTypes.contains is based on React.PropTypes.shape, but for mori.hashMap
 */

import mori from 'mori'

const ANONYMOUS = '<<anonymous>>'

const typeCheckCreator = (type) => (value) => {
  if (!type || !value) {
    return false
  }

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

const toArray = (propValue) => {
  const propType = getPropType(propValue)

  if (propType === 'Mori.map' || propType === 'Mori.sortedMap') {
    return mori.toJs(mori.vals(propValue))
  }


  return mori.toJs(propValue)
}

const createChainableTypeChecker = (validate) => {
  const checkType = (isRequired, props, propName, componentName, location, propFullName) => {
    if (props[propName] === null || props[propName] === undefined) {
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

const createMoriTypeChecker = (moriClassName, moriTypeValidator) => {
  const validate = (props, propName, componentName, location, propFullName) => {
    const propValue = props[propName]

    if (!moriTypeValidator(propValue)) {
      const propType = getPropType(propValue)

      return new Error(
        `Invalid ${location} \`${propFullName || propName}\` of type ` +
        `\`${propType}\` supplied to \`${componentName}\`, ` +
        `expected a \`Mori.${moriClassName}\`.`
      )
    }

    return null
  }

  return createChainableTypeChecker(validate)
}

const createCollectionTypeChecker = (typeChecker, moriClassName, moriTypeValidator) => {
  const validate = (props, propName, componentName, location, propFullName) => {
    const propValue = props[propName]

    if (typeof typeChecker !== 'function') {
      return new Error(
        `Invalid typeChecker supplied to \`${componentName}\` ` +
        `for propType \`${propFullName || propName}\`, expected a function.`
      )
    }

    if (!moriTypeValidator(propValue)) {
      const propType = getPropType(propValue)

      return new Error(
        `Invalid ${location} \`${propFullName || propName}\` of type ` +
        `\`${propType}\` supplied to \`${componentName}\`, ` +
        `expected a \`Mori.${moriClassName}\`.`
      )
    }

    const propValues = toArray(propValue) || []
    for (let i = 0, len = propValues.length; i < len; i++) {
      const error = typeChecker(propValues, i, componentName, location, `${propFullName || propName}[${i}]`)
      if (error instanceof Error) {
        return error
      }
    }
  }

  return createChainableTypeChecker(validate)
}

const createShapeTypeChecker = (shapeTypes, moriClassName, moriTypeValidator) => {
  const validate = (props, propName, componentName, location, propFullName) => {
    const propValue = props[propName]

    if (!moriTypeValidator(propValue)) {
      const propType = getPropType(propValue)
      return new Error(
        `Invalid ${location} \`${propFullName || propName}\` of type ` +
        `\`${propType}\` supplied to \`${componentName}\`, ` +
        `expected a \`Mori.${moriClassName}\`.`
      )
    }

    const keys = Object.keys(shapeTypes)
    const innerProps = mori.toJs(propValue)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      const checker = shapeTypes[key]
      if (!checker) {
        continue
      }

      const error = checker(innerProps, key, componentName, location, `${propFullName || propName}.${key}`);
      if (error) {
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

export const listOf = (typeChecker) => {
  return createCollectionTypeChecker(typeChecker, 'list', mori.isList)
}

export const mapOf = (typeChecker) => {
  return createCollectionTypeChecker(typeChecker, 'map', mori.isMap)
}

export const queueOf = (typeChecker) => {
  return createCollectionTypeChecker(typeChecker, 'queue', isQueue)
}

export const setOf = (typeChecker) => {
  return createCollectionTypeChecker(typeChecker, 'set', mori.isSet)
}

export const sortedMapOf = (typeChecker) => {
  return createCollectionTypeChecker(typeChecker, 'sortedMap', isSortedMap)
}

export const sortedSetOf = (typeChecker) => {
  return createCollectionTypeChecker(typeChecker, 'sortedSet', isSortedSet)
}

export const vecOf = (typeChecker) => {
  return createCollectionTypeChecker(typeChecker, 'vec', mori.isVector)
}

export const contains = (typeChecker) => {
  return createShapeTypeChecker(typeChecker, 'map', mori.isMap)
}

export default {
  // primitives
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

  // collections
  listOf,
  mapOf,
  queueOf,
  setOf,
  sortedMapOf,
  sortedSetOf,
  vecOf,

  // shape
  contains,
}
