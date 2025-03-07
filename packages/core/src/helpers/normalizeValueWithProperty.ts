/**
 * Some parts adapted from react-native-web
 * Copyright (c) Nicolas Gallagher licensed under the MIT license.
 */

import { getAllSelectors } from './insertStyleRule'
import { normalizeColor } from './normalizeColor'

const cache = {}

export function normalizeValueWithProperty(value: any, property?: string): any {
  if (property && unitlessNumbers[property]) {
    return value
  }
  const cached = cache[value]
  if (cached !== undefined) {
    return cached
  }
  let res = value
  if (
    process.env.TAMAGUI_TARGET === 'web' &&
    typeof value === 'number' &&
    (property === undefined || !unitlessNumbers[property])
  ) {
    res = `${value}px`
  } else if (property && colorProps[property]) {
    res = normalizeColor(value)
    cache[value] = res
  }
  return res
}

// TODO react-native-web-lite

const colorProps = {
  backgroundColor: true,
  borderColor: true,
  borderTopColor: true,
  borderRightColor: true,
  borderBottomColor: true,
  borderLeftColor: true,
  color: true,
  shadowColor: true,
  textDecorationColor: true,
  textShadowColor: true,
}

const unitlessNumbers = {
  WebkitLineClamp: true,
  animationIterationCount: true,
  aspectRatio: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexOrder: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  fontWeight: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowGap: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnGap: true,
  gridColumnStart: true,
  lineClamp: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  scale: true,
  scaleX: true,
  scaleY: true,
  scaleZ: true,
  shadowOpacity: true,
}

// getting real values for colors for animations (reverse mapped from CSS)
// this isn't beautiful, but will do relatively fine performance for now
const rcache = {}
export function reverseMapClassNameToValue(key: string, className: string) {
  const selectors = getAllSelectors()
  const cssRule = selectors[className]
  if (rcache[cssRule]) return rcache[cssRule]
  if (!cssRule) {
    return
  }
  const cssVal = cssRule.replace(/.*:/, '').replace(/;.*/, '').trim()
  let res: any
  if (cssVal.startsWith('var(')) {
    res = cssVal
  } else if (unitlessNumbers[key]) {
    res = +cssVal
  } else if (cssVal.endsWith('px')) {
    res = +cssVal.replace('px', '')
  } else {
    res = cssVal
  }
  rcache[cssRule] = res
  if (process.env.NODE_ENV === 'development') {
    // ensure we are parsing properly
    if (typeof res === 'number' && isNaN(res)) {
      // eslint-disable-next-line no-console
      console.log(`Tamagui invalid parsed value, NaN:`, { res, cssVal, cssRule, key, className })
    }
  }
  return res
}
