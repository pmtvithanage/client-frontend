import { useEffect } from 'react'

/**
 * Sets the document title for a page.
 * @param {string} title Page title; the "NIDS Client Portal" suffix is added.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · NIDS Client Portal` : 'NIDS Client Portal'
    return () => {
      document.title = 'NIDS Client Portal'
    }
  }, [title])
}
