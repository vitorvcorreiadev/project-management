export const ACCEPTED_IMAGE_TYPES: readonly string[] = ['image/jpeg', 'image/png']

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',')

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type)
}
