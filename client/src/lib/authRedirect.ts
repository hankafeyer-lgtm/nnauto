/** After login/register, navigate here (full navigation so /add-listing loads with auth). */
export const AUTH_POST_LOGIN_REDIRECT_KEY = "nnauth_post_auth_redirect";

/** Header listens and opens register modal + setPostAuthRedirect("/add-listing"). */
export const NNAUTO_OPEN_ADD_LISTING_AUTH_EVENT = "nnauto-open-add-listing-auth";

export function dispatchOpenAddListingAuth() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NNAUTO_OPEN_ADD_LISTING_AUTH_EVENT));
}

export function setPostAuthRedirect(path: string) {
  try {
    sessionStorage.setItem(AUTH_POST_LOGIN_REDIRECT_KEY, path);
  } catch {
    /* ignore */
  }
}

export function consumePostAuthRedirect(): string | null {
  try {
    const v = sessionStorage.getItem(AUTH_POST_LOGIN_REDIRECT_KEY);
    if (v) sessionStorage.removeItem(AUTH_POST_LOGIN_REDIRECT_KEY);
    return v;
  } catch {
    return null;
  }
}
