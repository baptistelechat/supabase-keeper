import chalk from "chalk";

export const logCommand = (command: string) => {
  return chalk.blue(`${command}`);
};
