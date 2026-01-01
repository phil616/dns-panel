import Cookies from 'js-cookie';

const AUTH_COOKIE_KEY = 'cf_dns_auth';

export interface AuthData {
  apiToken: string;
  email?: string; // Optional if using Bearer Token
}

export const getAuth = (): AuthData | null => {
  const cookie = Cookies.get(AUTH_COOKIE_KEY);
  if (!cookie) return null;
  try {
    return JSON.parse(cookie);
  } catch (e) {
    return null;
  }
};

export const setAuth = (data: AuthData) => {
  Cookies.set(AUTH_COOKIE_KEY, JSON.stringify(data), { expires: 7 });
};

export const clearAuth = () => {
  Cookies.remove(AUTH_COOKIE_KEY);
};
