import type { Config as InlangConfig } from "@inlang/core/config";
import type { Resource } from "@inlang/core/ast";

/**
 * The state of the vscode extension.
 */
type State = {
  config: InlangConfig;
  /**
   * The config path is useful to resolve relative paths in the config.
   */
  configPath: string;
  resources: Resource[];
};

let _state: State;

/**
 * Set the state.
 *
 * Export variables can not be assigned outside of this file. Thus,
 * this function is a wrapper to assign the `state` variable.
 */
export function setState(state: State) {
  _state = state;
}

/**
 * Returns the current state.
 *
 * The state is a function because importing a variable
 * is static i.e. if the variable is mutated after an
 * import occured, the change (might) not be reflected.
 * State that is not reflected = endless bugs.
 */
export function state(): State {
  return _state;
}
