import { GetProps, styled } from '@tamagui/core'

import { YStack } from './Stacks'
import {
  bordered,
  circular,
  elevate,
  focusTheme,
  hoverTheme,
  padded,
  pressTheme,
  radiused,
} from './variants'

const chromelessStyle = {
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  shadowColor: 'transparent',
}

export const ThemeableStack = styled(YStack, {
  name: 'SizableStack',

  variants: {
    // allows the type to come in for use in size
    fontFamily: () => ({}),

    backgrounded: {
      true: {
        backgroundColor: '$background',
      },
    },

    radiused,
    hoverTheme,
    pressTheme,
    focusTheme,
    circular,
    padded,
    elevate,
    bordered,

    transparent: {
      true: {
        backgroundColor: 'transparent',
      },
    },

    chromeless: {
      true: chromelessStyle,
      all: {
        ...chromelessStyle,
        hoverStyle: chromelessStyle,
        pressStyle: chromelessStyle,
        focusStyle: chromelessStyle,
      },
    },
  } as const,
})

export type ThemeableStackProps = GetProps<typeof ThemeableStack>
