/** One-shot draft for /zpravy after opening chat from a listing (not sent until Odeslat). */
export const CHAT_COMPOSE_PREFILL_STORAGE_KEY = "nn_chat_compose_prefill_v1";

export type ChatComposePrefillPayload = {
  conversationId: string;
  text: string;
};
