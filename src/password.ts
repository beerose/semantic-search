/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PasswordPrompt } from "@clack/core";
import color from "picocolors";
export { isCancel } from "@clack/core";

// This is temporary until https://github.com/natemoo-re/clack/pull/61 is merged

export default function isUnicodeSupported() {
  if (process.platform !== "win32") {
    return process.env.TERM !== "linux"; // Linux console (kernel)
  }

  return (
    Boolean(process.env.CI) ||
    Boolean(process.env.WT_SESSION) || // Windows Terminal
    Boolean(process.env.TERMINUS_SUBLIME) || // Terminus (<0.2.27)
    process.env.ConEmuTask === "{cmd::Cmder}" || // ConEmu and cmder
    process.env.TERM_PROGRAM === "Terminus-Sublime" ||
    process.env.TERM_PROGRAM === "vscode" ||
    process.env.TERM === "xterm-256color" ||
    process.env.TERM === "alacritty" ||
    process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm"
  );
}

const unicode = isUnicodeSupported();
const s = (c: string, fallback: string) => (unicode ? c : fallback);
const S_STEP_ACTIVE = s("◆", "*");
const S_STEP_CANCEL = s("■", "x");
const S_STEP_ERROR = s("▲", "x");
const S_STEP_SUBMIT = s("◇", "o");

const S_BAR = s("│", "|");
const S_BAR_END = s("└", "—");

const symbol = (state: any) => {
  switch (state) {
    case "initial":
    case "active":
      return color.cyan(S_STEP_ACTIVE);
    case "cancel":
      return color.red(S_STEP_CANCEL);
    case "error":
      return color.yellow(S_STEP_ERROR);
    case "submit":
      return color.green(S_STEP_SUBMIT);
  }
};

export interface PasswordOptions {
  message: string;
}
export const password = (opts: PasswordOptions) => {
  return new PasswordPrompt({
    render() {
      const title = `${color.gray(S_BAR)}\n${symbol(this.state)}  ${
        opts.message
      }\n`;
      const value = this.valueWithCursor;
      const masked = this.value
        .split("")
        .map(() => color.gray("•"))
        .join("");

      switch (this.state) {
        case "error":
          return `${title.trim()}\n${color.yellow(
            S_BAR
          )}  ${masked}\n${color.yellow(S_BAR_END)}  ${color.yellow(
            this.error
          )}\n`;
        case "submit":
          return `${title}${color.gray(S_BAR)}  ${color.dim(masked)}`;
        case "cancel":
          return `${title}${color.gray(S_BAR)}  ${color.strikethrough(
            color.dim(masked ?? "")
          )}${masked?.trim() ? "\n" + color.gray(S_BAR) : ""}`;
        default:
          return `${title}${color.cyan(S_BAR)}  ${value}\n${color.cyan(
            S_BAR_END
          )}\n`;
      }
    },
  }).prompt();
};
