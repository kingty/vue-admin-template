import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Android Team'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
