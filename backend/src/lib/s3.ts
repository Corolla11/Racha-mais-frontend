import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from "../errors/AppError.js";

interface ConfigS3 {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

let clienteCache: { assinatura: string; cliente: S3Client } | null = null;

export function configS3(): ConfigS3 {
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new AppError(503, "Armazenamento de arquivos não configurado");
  }

  return {
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    region: process.env.S3_REGION?.trim() || "us-east-1",
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

function obterClienteS3(cfg: ConfigS3): S3Client {
  const assinatura = `${cfg.endpoint ?? ""}|${cfg.region}|${cfg.accessKeyId}|${cfg.forcePathStyle}`;
  if (clienteCache?.assinatura === assinatura) {
    return clienteCache.cliente;
  }

  const cliente = new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    forcePathStyle: cfg.forcePathStyle,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  clienteCache = { assinatura, cliente };
  return cliente;
}

export async function criarUrlUploadAssinada(params: {
  key: string;
  contentType: string;
  contentLength: number;
  expiresInSeconds?: number;
}): Promise<string> {
  const cfg = configS3();
  const cliente = obterClienteS3(cfg);
  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: params.key,
    ContentType: params.contentType,
    ContentLength: params.contentLength,
  });
  return getSignedUrl(cliente, command, {
    expiresIn: params.expiresInSeconds ?? 120,
  });
}

export async function criarUrlLeituraAssinada(params: {
  key: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const cfg = configS3();
  const cliente = obterClienteS3(cfg);
  const command = new GetObjectCommand({
    Bucket: cfg.bucket,
    Key: params.key,
  });
  return getSignedUrl(cliente, command, {
    expiresIn: params.expiresInSeconds ?? 300,
  });
}
