import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
