export function detectCollisionByFixedElement(element: HTMLElement, margin: number = 10): void {
  const rect = element.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Phát hiện va chạm với cạnh trên
  if (rect.top < margin) {
    element.style.top = 'auto'
    element.style.bottom = margin + 'px'
  }

  // Phát hiện va chạm với cạnh dưới
  if (rect.bottom > viewportHeight - margin) {
    element.style.bottom = 'auto'
    element.style.top = margin + 'px'
  }

  // Phát hiện va chạm với cạnh trái
  if (rect.left < margin) {
    element.style.left = 'auto'
    element.style.right = margin + 'px'
  }

  // Phát hiện va chạm với cạnh phải
  if (rect.right > viewportWidth - margin) {
    element.style.right = 'auto'
    element.style.left = margin + 'px'
  }
}
