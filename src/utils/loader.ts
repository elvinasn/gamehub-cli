import ora from "ora";

interface LoaderOptions {
  loadingText?: string;
  errorText?: string;
}

export async function runWithLoader<T>(
  task: Promise<T>,
  options?: LoaderOptions
): Promise<T | null> {
  const spinner = ora({
    text: options?.loadingText || "Loading...",
  }).start();

  try {
    const result = await task;
    return result;
  } catch (error) {
    spinner.fail(options?.errorText ?? "An error occurred.");
    return null;
  } finally {
    spinner.stop();
  }
}
