export const adjustSizeOfPlacedImageOnPlaced = () => {
  const imagesDisplayer = document.querySelector<HTMLElement>(
    '.NAME-print-area-allowed .NAME-placed-images-displayer'
  )
  if (!imagesDisplayer) return
  const adjust = () => {
    const images = imagesDisplayer.querySelectorAll<HTMLImageElement>('.NAME-frame-placed-image')
    images.forEach((img) => {
      if (img.complete) fix(img)
      else img.onload = () => fix(img)
    })
  }
  adjust()

  function fix(img: HTMLImageElement) {
    if (img['NAME_isSizeAdjusted']) return
    const { width, height } = img.getBoundingClientRect()
    console.log('>>> 17:', { width, height })
    if (width === 0 || height === 0) return requestAnimationFrame(() => fix(img))
    img.style.width = width + 'px'
    img.style.height = height + 'px'
    const frame = img.closest<HTMLElement>('.NAME-template-frame')
    if (frame) {
      frame.style.width = width + 'px'
      frame.style.height = height + 'px'
    }
  }
}
