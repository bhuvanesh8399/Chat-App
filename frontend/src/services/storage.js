const KEY = "auth.jwt";
export const saveToken = (t) => localStorage.setItem(KEY, t);
export const getToken  = () => localStorage.getItem(KEY);
export const clearToken = () => localStorage.removeItem(KEY);
