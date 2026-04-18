/**
 * Reads a fetch Response body as a stream of decoded text chunks.
 * The server may flush arbitrary-sized UTF-8 slices; TextDecoder with
 * { stream: true } buffers partial multi-byte sequences across chunks.
 */
export async function* readTextStream(
  response: Response,
): AsyncGenerator<string, void, void> {
  if (!response.body) {
    throw new Error("readTextStream: response has no body");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) yield chunk;
      }
    }
    // Flush any final bytes stuck in the decoder buffer.
    const tail = decoder.decode();
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}
