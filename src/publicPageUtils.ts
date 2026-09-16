import metadata from '../public-pages.json'

export type PublicPagePath = keyof typeof metadata

export function isPublicPagePath(path: string): path is PublicPagePath {
  return Object.hasOwn(metadata, path)
}
