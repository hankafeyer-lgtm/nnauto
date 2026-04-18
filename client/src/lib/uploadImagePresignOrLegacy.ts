import { apiRequest } from "@/lib/queryClient";

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

/**
 * Prefer direct PUT to R2 (presigned). If that fails (e.g. missing R2 CORS → Safari "Load failed"),
 * fall back to same-origin JSON upload so listing photos always work.
 */
export async function uploadImageViaPresignOrLegacy(file: File): Promise<string> {
  const contentType =
    file.type && file.type.startsWith("image/")
      ? file.type
      : "image/jpeg";

  try {
    const presignRes = await apiRequest("POST", "/api/objects/upload", {
      contentType,
    });
    const presign = (await presignRes.json()) as {
      url: string;
      objectKey: string;
    };
    const putRes = await fetch(presign.url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });
    if (!putRes.ok) {
      throw new Error(`presign_put_${putRes.status}`);
    }
    const finRes = await apiRequest("POST", "/api/objects/finalize-upload", {
      objectKey: presign.objectKey,
    });
    const fin = (await finRes.json()) as { objectPath?: string };
    if (!fin?.objectPath) {
      throw new Error("finalize_missing_path");
    }
    return fin.objectPath;
  } catch {
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
}
