// `message` is an i18n key; translate it with `params` where it is shown.
export class ApiError extends Error {
  code?: string;
  status: number;
  params?: Record<string, unknown>;

  constructor(message: string, status: number, params?: Record<string, unknown>, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.params = params;
    this.code = code;
  }
}
