export const defineAction = <Input, Output>(config: {
  input: any;
  handler: (input: Input) => Promise<Output>;
}) => ({
  input: config.input,
  handler: config.handler,
});

export class ActionError extends Error {
  public readonly code: string;
  constructor(options: { code: string; message: string }) {
    super(options.message);
    this.code = options.code;
    this.name = "ActionError";
  }
}

const chainable = {
  min: (_n: number, _msg?: string) => chainable,
  max: (_n: number) => chainable,
  optional: () => chainable,
  email: () => chainable,
};

export const z = {
  object: <T extends Record<string, any>>(_shape: T) => ({
    parse: (data: any) => data,
    safeParse: (data: any) => ({ success: true, data }),
  }),
  string: () => chainable,
  boolean: () => chainable,
};