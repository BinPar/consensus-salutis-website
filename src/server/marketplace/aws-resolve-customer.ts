/**
 * Canje del token de registro de AWS Marketplace: `ResolveCustomer`.
 *
 * ## El requisito que hundió la publicación anterior
 *
 * > Successfully call the AWS Marketplace APIs from the AWS account that
 * > registered as a provider and submitted the SaaS publishing request.
 *
 * Desde otra cuenta la llamada **funciona igual y aun así no cuenta**. No hay
 * señal de error: parece que va bien. De ahí que las credenciales no sean una
 * clave estática de cualquier cuenta, sino un rol de la cuenta proveedora
 * asumido por federación OIDC desde Vercel (`AWS_ROLE_ARN`, provisionado en
 * `BinPar/consensus-salutis#91`).
 *
 * ## Región
 *
 * `us-east-1` con independencia de dónde se despliegue: el servicio de Metering
 * del Marketplace vive ahí. `AWS_REGION` existe para no clavarlo en el código,
 * pero su valor correcto es ése.
 *
 * ## En desarrollo no hay AWS
 *
 * Ni la va a haber: la llamada solo cuenta desde la cuenta proveedora. En local
 * se apunta `AWS_MP_RESOLVE_ENDPOINT` al `resolve-stub` de
 * `scripts/marketplace-sim.mts` del monorepo, que habla el protocolo real,
 * devuelve `CustomerIdentifier` vacío a propósito y tiene modo `--expired`.
 * Cuando esa variable está puesta no se asume ningún rol — no hay ninguno que
 * asumir— y las credenciales son de mentira, que es lo que el stub espera.
 */

import {
  MarketplaceMeteringClient,
  ResolveCustomerCommand,
} from "@aws-sdk/client-marketplace-metering";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

import { env } from "~/env";

/** Lo que se saca del canje. Nada más de la respuesta se usa en ningún sitio. */
export type ResolvedCustomer = {
  /**
   * `CustomerAWSAccountId`, doce dígitos.
   *
   * **No `CustomerIdentifier`**: Concurrent Agreements es obligatorio para
   * productos nuevos desde el 1 de junio de 2026 y ese campo ya no viene
   * poblado. Cualquier ejemplo de código anterior a esa fecha hace guardar un
   * campo vacío, y se descubre tarde.
   */
  awsAccountId: string;
  licenseArn: string;
  productCode: string;
};

/** Por qué no se ha podido canjear. Es lo que decide el código de respuesta. */
export type ResolveFailureReason =
  /** El token caducó —~1 h— o AWS no lo reconoce. Culpa de nadie: se reintenta. */
  | "invalid-token"
  /** Falta configuración nuestra: sin rol, o sin código de producto. */
  | "not-configured"
  /** La respuesta no trae los campos de Concurrent Agreements. */
  | "incomplete-response"
  /** AWS no contestó, o contestó un error que no es ninguno de los anteriores. */
  | "unavailable";

export class ResolveCustomerError extends Error {
  readonly reason: ResolveFailureReason;

  constructor(reason: ResolveFailureReason, message: string) {
    super(message);
    this.name = "ResolveCustomerError";
    this.reason = reason;
  }
}

/**
 * Cliente de Metering, creado una vez por instancia.
 *
 * `awsCredentialsProvider` canjea el token OIDC que Vercel inyecta en la función
 * por credenciales del rol de la cuenta proveedora, y las refresca solo. Fuera
 * de Vercel —y en los tests— ese canje no puede ocurrir, así que el cliente solo
 * se construye cuando de verdad hay que llamar.
 */
let client: MarketplaceMeteringClient | null = null;

function meteringClient(): MarketplaceMeteringClient {
  if (client !== null) return client;

  const endpoint = env.AWS_MP_RESOLVE_ENDPOINT;

  if (endpoint) {
    // Stub local: sin rol, sin OIDC y con credenciales de mentira. El stub no
    // comprueba la firma, pero el SDK se niega a firmar sin credenciales.
    client = new MarketplaceMeteringClient({
      region: env.AWS_REGION,
      endpoint,
      credentials: { accessKeyId: "stub", secretAccessKey: "stub" },
    });
    return client;
  }

  if (!env.AWS_ROLE_ARN) {
    throw new ResolveCustomerError(
      "not-configured",
      "AWS_ROLE_ARN no está configurado: no hay rol de la cuenta proveedora que asumir.",
    );
  }

  client = new MarketplaceMeteringClient({
    region: env.AWS_REGION,
    credentials: awsCredentialsProvider({ roleArn: env.AWS_ROLE_ARN }),
  });

  return client;
}

/** Solo para tests: obliga a reconstruir el cliente con el entorno de turno. */
export function resetMeteringClient() {
  client = null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Canjea el token de registro y devuelve la cuenta de AWS que hay detrás.
 *
 * Se llama **de inmediato**, en cuanto entra el POST: el token caduca —la
 * documentación de AWS dice 4 h en un sitio y ~1 h en otro— y guardarlo para
 * canjearlo luego es convertir un plazo dudoso en un fallo intermitente.
 */
export async function resolveCustomer(
  registrationToken: string,
): Promise<ResolvedCustomer> {
  let response;
  try {
    response = await meteringClient().send(
      new ResolveCustomerCommand({ RegistrationToken: registrationToken }),
    );
  } catch (error) {
    if (error instanceof ResolveCustomerError) throw error;

    // `ExpiredTokenException` y `InvalidTokenException` son del comprador, no
    // nuestros: el enlace tardó demasiado o llegó tocado. Se distinguen para
    // poder decírselo, en vez de enseñar un error genérico de servidor.
    const name =
      isRecord(error) && typeof error.name === "string" ? error.name : "";
    if (name === "ExpiredTokenException" || name === "InvalidTokenException") {
      throw new ResolveCustomerError(
        "invalid-token",
        `AWS rechazó el token de registro: ${name}`,
      );
    }

    throw new ResolveCustomerError(
      "unavailable",
      `ResolveCustomer falló: ${String(error)}`,
    );
  }

  const awsAccountId = response.CustomerAWSAccountId;
  const licenseArn = response.LicenseArn;
  const productCode = response.ProductCode;

  /*
    Los tres campos son obligatorios y se comprueban aquí, no más abajo.

    Con Concurrent Agreements, `CustomerAWSAccountId` y `LicenseArn` son los que
    identifican al comprador. Una respuesta sin ellos significa que la
    integración está hablando con un producto configurado a la vieja usanza, y
    seguir adelante escribiría una fila con la clave del índice único vacía.
  */
  if (!awsAccountId || !licenseArn || !productCode) {
    throw new ResolveCustomerError(
      "incomplete-response",
      "ResolveCustomer respondió sin CustomerAWSAccountId, LicenseArn o ProductCode.",
    );
  }

  return { awsAccountId, licenseArn, productCode };
}
