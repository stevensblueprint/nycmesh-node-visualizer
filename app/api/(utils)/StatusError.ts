export default class StatusError extends Error {
  status: number;
  cleanup: () => Promise<unknown>;

  constructor(
    status: number,
    message: string,
    cleanup: () => Promise<unknown> = () => new Promise((res) => res(null))
  ) {
    // Run async cleanup to clean up any loose code when handling error
    super(message);
    this.name = 'StatusError';
    this.status = status;
    this.cleanup = async () => await cleanup();
  }
}
