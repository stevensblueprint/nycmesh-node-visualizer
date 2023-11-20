export default class StatusError extends Error {
  status: number;
  cleanup: () => unknown;

  constructor(
    status: number,
    message: string,
    cleanup: () => unknown = () => null
  ) {
    // Run cleanup to clean up any loose code when throwing error
    super(message);
    this.name = 'StatusError';
    this.status = status;
    this.cleanup = cleanup;
  }
}
