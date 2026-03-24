/** After login/register, navigate here (full navigation so /add-listing loads with auth). */
export const AUTH_POST_LOGIN_REDIRECT_KEY = "nnauth_post_auth_redirect";

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
