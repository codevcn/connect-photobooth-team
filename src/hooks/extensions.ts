export const useQueryFilter = () => {
  const params = new URLSearchParams(window.location.search)
  return {
    isPhotoism: params.get('q') === 'ptm',
    funId: params.get('funstudio'),
    dev: params.get('dev') === '123',
  }
}
