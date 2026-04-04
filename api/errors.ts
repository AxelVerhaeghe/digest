/**
 * Structured error thrown when a Miniflux API request fails with a non-2xx
 * status code.
 *
 * Miniflux returns errors as `{ "error_message": "..." }`. When the response
 * body cannot be parsed, `errorMessage` will be `null`.
 */
export class ApiError extends Error {
  constructor(
    /** HTTP status code returned by the server. */
    public readonly status: number,
    /** Parsed `error_message` from the JSON body, or `null` if unavailable. */
    public readonly errorMessage: string | null,
    /** The full request URL that failed. */
    public readonly url: string,
  ) {
    super(
      errorMessage
        ? `Miniflux API error ${status}: ${errorMessage}`
        : `Miniflux API error ${status} (${url})`,
    );
    this.name = 'ApiError';
  }
}
