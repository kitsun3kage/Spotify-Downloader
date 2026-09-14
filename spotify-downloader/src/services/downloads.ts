function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160) || 'download';
}

function extensionFromContentType(
  contentType: string
): string {
  const normalized = contentType.toLowerCase();

  if (normalized.includes('mpeg')) {
    return 'mp3';
  }

  if (normalized.includes('wav')) {
    return 'wav';
  }

  if (normalized.includes('ogg')) {
    return 'ogg';
  }

  if (normalized.includes('webm')) {
    return 'webm';
  }

  if (normalized.includes('mp4')) {
    return 'm4a';
  }

  return 'bin';
}

export async function downloadLegalFile(
  url: string,
  fileName: string,
  onProgress: (progress: number) => void
): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Download failed with status ${response.status}.`
    );
  }

  const total = Number(
    response.headers.get('content-length') ?? 0
  );

  const contentType =
    response.headers.get('content-type') ?? '';

  const reader = response.body?.getReader();

  if (!reader) {
    const blob = await response.blob();

    saveBlob(
      blob,
      `${sanitizeFileName(fileName)}.${extensionFromContentType(
        contentType
      )}`
    );

    onProgress(100);

    return;
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) {
      break;
    }

    if (value) {
      chunks.push(value);
      received += value.length;

      if (total > 0) {
        onProgress(
          Math.min(
            100,
            Math.round(
              (received / total) * 100
            )
          )
        );
      }
    }
  }

  const blob = new Blob(chunks, {
    type: contentType || 'application/octet-stream'
  });

  saveBlob(
    blob,
    `${sanitizeFileName(fileName)}.${extensionFromContentType(
      contentType
    )}`
  );

  onProgress(100);
}

function saveBlob(
  blob: Blob,
  fileName: string
): void {
  const objectUrl =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener';

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(objectUrl),
    1000
  );
}