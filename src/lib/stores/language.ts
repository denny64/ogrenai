import { writable } from "svelte/store"
import {
  getLanguagePreference,
  setLanguagePreference,
} from "$lib/utils/cookies"
import { browser } from "$app/environment"

// Initialize with default value (will be updated on client side)
const defaultLang = "tr"
const initialLang = browser ? getLanguagePreference(defaultLang) : defaultLang

// Create the store
export const language = writable<"en" | "tr">(initialLang)

// Function to update language and save to cookie
export function setLanguage(lang: "en" | "tr") {
  language.set(lang)
  if (browser) {
    setLanguagePreference(lang)
  }
}
