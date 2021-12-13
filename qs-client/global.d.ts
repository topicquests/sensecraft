// https://github.com/facebook/jest/issues/11640#issuecomment-893867514
export {};

declare global {
  namespace NodeJS {
    interface Global {}
    interface InspectOptions {}

    interface ConsoleConstructor extends console.ConsoleConstructor {}
  }
}
