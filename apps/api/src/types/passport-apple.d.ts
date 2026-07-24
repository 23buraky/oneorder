// No official type definitions are published for "passport-apple" at the
// version used here, so we declare a minimal shape covering what this
// project actually uses (constructor options + Strategy class).
declare module "passport-apple" {
  import { Strategy as PassportStrategy } from "passport";

  interface AppleStrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    privateKeyString?: string;
    privateKeyLocation?: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class Strategy extends PassportStrategy {
    constructor(options: AppleStrategyOptions, verify: (...args: any[]) => void);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate(req: any, options?: any): void;
  }

  export { Strategy };
}
