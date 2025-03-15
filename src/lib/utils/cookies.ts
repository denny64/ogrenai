/**
 * Gets a cookie value by name
 * @param name The name of the cookie to retrieve
 * @param defaultValue The default value to return if cookie is not found
 * @returns The cookie value or the default value
 */
export function getCookie(name: string, defaultValue: string = ""): string {
  if (typeof document === "undefined") return defaultValue // Handle SSR

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift()
    return cookieValue || defaultValue
  }

  return defaultValue
}

/**
 * Sets a cookie with the given name and value
 * @param name The name of the cookie
 * @param value The value to store
 * @param days Number of days until the cookie expires (default: 365)
 */
export function setCookie(
  name: string,
  value: string,
  days: number = 365,
): void {
  if (typeof document === "undefined") return // Handle SSR

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + days)

  const cookieValue = `${name}=${value};path=/;expires=${expirationDate.toUTCString()}`
  document.cookie = cookieValue
}

/**
 * Gets the current language preference from cookies or returns the default
 * @param defaultLang The default language to use if no preference is found
 * @returns The language code ('en' or 'tr')
 */
export function getLanguagePreference(
  defaultLang: "en" | "tr" = "tr",
): "en" | "tr" {
  const lang = getCookie("preferredLanguage", defaultLang)
  return lang === "en" || lang === "tr" ? lang : defaultLang
}

/**
 * Sets the language preference in cookies
 * @param lang The language code to save ('en' or 'tr')
 */
export function setLanguagePreference(lang: "en" | "tr"): void {
  setCookie("preferredLanguage", lang)
}
