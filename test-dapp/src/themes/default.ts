import {
  white,
  black,
  darkestGrey,
  red,
  cyan,
} from './colors'

const bgColor = black
const textColor = white

export default (): any => ({
  layout: {
    bgColor,
    textColor,
  },
  pre: {
    undetermined: {
      bgColor: darkestGrey,
      textColor: white,
    },
    error: {
      bgColor: red,
      textColor: white,
    },
    value: {
      bgColor: cyan,
      textColor: black,
    },
  },
})
