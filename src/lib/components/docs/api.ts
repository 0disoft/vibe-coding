import type { Intent } from "$lib/components/design-system/types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const methodIntentMap: Record<HttpMethod, Intent> = {
  GET: "secondary",
  POST: "primary",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "danger",
};

export function getApiMethodIntent(method: HttpMethod): Intent {
  return methodIntentMap[method] ?? "warning";
}
