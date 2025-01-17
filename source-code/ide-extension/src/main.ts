import * as vscode from "vscode";
import { ExtractMessage } from "./actions/extractMessage.js";
import { setState, state } from "./state.js";
import { extractMessageCommand } from "./commands/extractMessage.js";
import { inlinePattern } from "./decorations/inlinePattern.js";
import { determineClosestPath } from "./utils/determineClosestPath.js";
import type { Config as InlangConfig } from "@inlang/core/config";
import { $import } from "@inlang/core/config";
import fs from "node:fs/promises";

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  try {
    vscode.window.showInformationMessage("Inlang extension activated.");
    // start the extension
    main({ context });
    // in case the active window changes -> restart the extension
    // (could be improved in the future for performance reasons
    // by detecting whether the closest config differs. For now,
    // it's easier to restart the application each time.)
    vscode.window.onDidChangeActiveTextEditor(() => {
      // in case of running subscriptions -> dispose them (no commands will be shown anymore in the IDE)
      for (const subscription of context.subscriptions) {
        subscription.dispose();
      }
      // restart extension
      main({ context });
    });
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
    console.error(error);
  }
}

/**
 * The main entry of the extension.
 *
 * This function registers all commands, actions, loads the config etc.
 */
async function main(args: { context: vscode.ExtensionContext }): Promise<void> {
  // if no active text editor -> no window is open -> hence dont activate the extension
  const activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor === undefined) {
    return;
  }
  // checking whether a config file exists -> if not dont start the extension
  const potentialConfigFileUris = await vscode.workspace.findFiles(
    "**/inlang.config.js"
  );
  if (potentialConfigFileUris.length === 0) {
    return;
  }
  const closestConfigPath = determineClosestPath({
    options: potentialConfigFileUris.map((uri) => uri.path),
    to: activeTextEditor.document.uri.path,
  });
  const configModule: InlangConfig = (await import(closestConfigPath)).config;
  setState({
    config: configModule,
    configPath: closestConfigPath,
    bundles: await configModule.readBundles({ $import, fs: fs as any }),
  });
  const b = state().bundles;
  console.log(b);
  // register the commands
  args.context.subscriptions.push(
    vscode.commands.registerCommand(
      extractMessageCommand.id,
      extractMessageCommand.callback
    )
  );
  // register the code actions
  for (const language of state().config.ideExtension.documentSelectors) {
    args.context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        language,
        new ExtractMessage(),
        {
          providedCodeActionKinds: ExtractMessage.providedCodeActionKinds,
        }
      )
    );
  }
  // register decorations
  inlinePattern({ activeTextEditor });
}

// this method is called when your extension is deactivated
// export function deactivate() {}
