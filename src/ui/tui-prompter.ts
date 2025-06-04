import blessed from "blessed";
import type { VariableDefinition } from "../common/types/index.js";
import type { EnvironmentPrompter } from "../core/script-executor.js";

export class TUIEnvironmentPrompter implements EnvironmentPrompter {
  constructor(
    private screen: blessed.Widgets.Screen,
    private outputLog: blessed.Widgets.Log,
  ) {}

  async promptForVariables(
    variables: VariableDefinition[],
    existingEnv: Record<string, string | undefined>,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    // Filter out variables that are already set
    const missingVariables = variables.filter(
      (variable) =>
        !existingEnv[variable.name] || existingEnv[variable.name] === "",
    );

    if (missingVariables.length === 0) {
      this.outputLog.log(
        "{green-fg}✅ All required environment variables are already set{/}",
      );
      this.screen.render();
      return result;
    }

    this.outputLog.log(
      `{blue-fg}📝 Need to collect ${missingVariables.length} environment variable(s){/}`,
    );
    this.outputLog.log(
      "{gray-fg}💡 Press Escape to cancel, Enter to confirm{/}",
    );
    this.screen.render();

    for (const variable of missingVariables) {
      const value = await this.promptForSingleVariable(variable);
      if (value !== null) {
        result[variable.name] = value;
        this.outputLog.log(`{green-fg}✅ ${variable.name} set{/}`);
      } else {
        this.outputLog.log(`{yellow-fg}⚠️ ${variable.name} skipped{/}`);
      }
      this.screen.render();
    }

    return result;
  }

  private async promptForSingleVariable(
    variable: VariableDefinition,
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const message =
        variable.message || `Please enter value for ${variable.name}:`;

      // Create modal overlay
      const modal = blessed.box({
        parent: this.screen,
        top: "center",
        left: "center",
        width: "60%",
        height: 8,
        border: { type: "line" },
        style: {
          border: { fg: "cyan" },
          bg: "black",
        },
        tags: true,
        label: ` ${variable.type === "password" ? "🔐" : "📝"} Environment Variable `,
      });

      // Create prompt message
      const promptText = blessed.text({
        parent: modal,
        top: 1,
        left: 2,
        width: "100%-4",
        height: 1,
        content: message,
        style: { fg: variable.type === "password" ? "yellow" : "cyan" },
        tags: true,
      });

      // Create input field
      const input = blessed.textbox({
        parent: modal,
        top: 3,
        left: 2,
        width: "100%-4",
        height: 1,
        border: { type: "line" },
        style: {
          border: { fg: "white" },
          bg: "black",
          focus: { border: { fg: "yellow" } },
        },
        keys: true,
        mouse: true,
        secret: variable.type === "password", // Hide input for passwords
        inputOnFocus: true,
      });

      // Create help text
      const helpText = blessed.text({
        parent: modal,
        top: 5,
        left: 2,
        width: "100%-4",
        height: 1,
        content:
          "{gray-fg}[Enter] Submit • [Escape] Cancel • [Tab] Empty value{/}",
        style: { fg: "gray" },
        tags: true,
      });

      // Handle input events
      const handleSubmit = () => {
        const value = input.getValue();
        cleanup();
        resolve(value);
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      const handleEmpty = () => {
        cleanup();
        resolve("");
      };

      const cleanup = () => {
        this.screen.remove(modal);
        this.screen.render();
      };

      // Event handlers
      input.key(["enter"], handleSubmit);
      input.key(["escape"], handleCancel);
      input.key(["tab"], handleEmpty);

      // Global escape handler for the modal
      modal.key(["escape"], handleCancel);

      // Focus the input and render
      input.focus();
      this.screen.render();
    });
  }
}
