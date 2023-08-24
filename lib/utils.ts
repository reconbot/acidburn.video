export const assertUnreachable = (x: never) => {
  throw new Error('Unreachable code reached')
}
