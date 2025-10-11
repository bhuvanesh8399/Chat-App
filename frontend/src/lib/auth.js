const KEY = 'eb_token'
const NAME = 'eb_name'
export const saveAuth = (token, displayName) => {
  localStorage.setItem(KEY, token)
  if (displayName) localStorage.setItem(NAME, displayName)
}
export const getToken = () => localStorage.getItem(KEY)
export const getName = () => localStorage.getItem(NAME) ?? 'You'
export const clearAuth = () => { localStorage.removeItem(KEY); localStorage.removeItem(NAME) }
export const isAuthed = () => !!getToken()
