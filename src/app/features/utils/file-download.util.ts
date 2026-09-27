/** Saves a downloaded file (e.g. a PDF from the API) through the browser. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Reads the error message from a failed blob request (the body is JSON inside a Blob). */
export async function blobErrorMessage(error: unknown, fallback: string): Promise<string> {
  const body = (error as { error?: unknown })?.error;
  if (body instanceof Blob) {
    try {
      const parsed = JSON.parse(await body.text()) as { message?: string };
      if (parsed?.message) {
        return parsed.message;
      }
    } catch {
      // not JSON
    }
  }
  const message = (error as { error?: { message?: string } })?.error?.message;
  return message ?? fallback;
}
