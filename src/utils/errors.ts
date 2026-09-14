export function getErrorMessage(
  cause: unknown,
  fallback = 'Unknown error',
): string {
  if (cause instanceof Error && cause.message) {
    return cause.message
  }
  return fallback
}
