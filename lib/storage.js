import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const region = process.env.ASSET_REGION || "us-east-1";
let client;

function getBucket() {
  return (
    process.env.ASSET_BUCKET ||
    new URL(process.env.AWS_SERVE_URL).hostname.split(".")[0]
  );
}

function s3() {
  client ??= new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

/**
 * Upload a buffer to the Remotion/asset S3 bucket and return a public URL.
 * Returns ONLY the URL (safe for Inngest step output size limits).
 */
export async function uploadFile(buffer, key, contentType) {
  const Bucket = getBucket();
  const Key = `assets/${key}`;

  const params = {
    Bucket,
    Key,
    Body: buffer,
    ContentType: contentType,
  };

  // Prefer ACL when the bucket allows it; fall back if ACLs are disabled.
  try {
    await s3().send(
      new PutObjectCommand({ ...params, ACL: "public-read" }),
    );
  } catch (err) {
    const msg = String(err?.name || err?.Code || err?.message || "");
    if (
      msg.includes("AccessControlListNotSupported") ||
      msg.includes("InvalidArgument") ||
      err?.Code === "AccessControlListNotSupported"
    ) {
      await s3().send(new PutObjectCommand(params));
    } else {
      throw err;
    }
  }

  return `https://${Bucket}.s3.${region}.amazonaws.com/${Key}`;
}

/**
 * Best-effort delete of one or more objects under the `assets/` prefix.
 * Accepts keys WITHOUT the `assets/` prefix (e.g. `images/<id>/scene-0.jpg`).
 * Missing keys are ignored and errors are swallowed so cleanup never blocks
 * the caller from removing the underlying record.
 */
export async function deleteFiles(keys) {
  const Bucket = getBucket();
  const uniqueKeys = [...new Set((keys || []).filter(Boolean))].map(
    (key) => `assets/${key}`,
  );
  if (uniqueKeys.length === 0) return 0;

  try {
    const res = await s3().send(
      new DeleteObjectsCommand({
        Bucket,
        Delete: { Objects: uniqueKeys.map((Key) => ({ Key })), Quiet: true },
      }),
    );
    return uniqueKeys.length - (res?.Errors?.length ?? 0);
  } catch (err) {
    console.error("[deleteFiles] S3 delete failed:", err?.message || err);
    return 0;
  }
}
