import { apiRequest, listingsFetchHeaders } from "@/lib/queryClient";

function readFileAsBase64Payload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.includes(",")) {
        reject(new Error("Nepodařilo se načíst soubor"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Nepodařilo se zpracovat soubor"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Chyba čtení souboru"));
    reader.readAsDataURL(file);
  });
}

async function uploadMultipartSameOrigin(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, file.name || "photo.jpg");

  const res = await fetch("/api/objects/upload-image", {
    method: "POST",
    headers: listingsFetchHeaders(),
    body: formData,
    credentials: "include",
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = `Nahrání selhalo (${res.status})`;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = JSON.parse(text) as { objectPath?: string };
  if (!data?.objectPath) {
    throw new Error("Chybí cesta k souboru");
  }
  return data.objectPath;
}

async function uploadBase64Legacy(file: File): Promise<string> {
  const contentType =
    file.type && file.type.startsWith("image/")
      ? file.type
      : "image/jpeg";
  const fileData = await readFileAsBase64Payload(file);
  const uploadRes = await apiRequest("POST", "/api/objects/upload-file", {
    fileData,
    fileName: file.name || "photo.jpg",
    contentType,
  });
  const uploadData = (await uploadRes.json()) as { objectPath?: string };
  if (!uploadData?.objectPath) {
    throw new Error("Nahrání přes server selhalo");
  }
  return uploadData.objectPath;
}

/**
 * Fast path: multipart POST to same origin (no base64 bloat, no cross-origin R2 wait).
 * Fallback: legacy JSON+base64 if multipart is rejected (e.g. strict body limits).
 */
export async function uploadImageViaPresignOrLegacy(file: File): Promise<string> {
  try {
    return await uploadMultipartSameOrigin(file);
  } catch {
    return await uploadBase64Legacy(file);
  }
}
