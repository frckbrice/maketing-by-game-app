/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | number | string[]): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
    }
  }
}

export {};
