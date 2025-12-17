import { getContext, setContext } from "svelte";

export type RadioGroupContext = {
  name?: string;
  disabled: boolean;
  required: boolean;
  describedBy?: string;
  value: () => string;
  setValue: (next: string) => void;
};

const radioGroupContextKey = Symbol("ds-radio-group");

export function setRadioGroupContext(ctx: RadioGroupContext): void {
  setContext(radioGroupContextKey, ctx);
}

export function getRadioGroupContext(): RadioGroupContext {
  return getContext(radioGroupContextKey);
}

