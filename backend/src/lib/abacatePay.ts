import { z } from "zod";
import { AppError } from "../errors/AppError.js";

const envelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().nullable().optional(),
});

export async function postAbacatePay<T>(
  path: string,
  body: unknown,
  responseSchema: z.ZodType<T>,
): Promise<T> {
  const apiKey = process.env.ABACATEPAY_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(503, "AbacatePay não está configurado");
  }

  let response: Response;
  try {
    response = await fetch(`https://api.abacatepay.com/v2${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new AppError(502, "Não foi possível conectar à AbacatePay");
    }
    throw error;
  }

  let responseBody: unknown;
  try {
    responseBody = JSON.parse(await response.text());
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AppError(502, "A AbacatePay retornou uma resposta inválida");
    }
    throw error;
  }

  const envelope = envelopeSchema.safeParse(responseBody);
  if (
    !response.ok ||
    !envelope.success ||
    !envelope.data.success ||
    envelope.data.data === undefined
  ) {
    console.error("AbacatePay request failed", {
      status: response.status,
      error: envelope.success ? envelope.data.error : "Invalid response",
    });
    throw new AppError(502, "Não foi possível concluir a operação com a AbacatePay");
  }

  const parsedData = responseSchema.safeParse(envelope.data.data);
  if (!parsedData.success) {
    console.error("AbacatePay returned an unexpected response", {
      status: response.status,
      issues: parsedData.error.issues,
    });
    throw new AppError(502, "A AbacatePay retornou uma resposta inválida");
  }

  return parsedData.data;
}
