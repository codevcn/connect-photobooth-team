import { useEditedElementStore } from '@/stores/element/element.store'
import { useEffect } from 'react'
import { PrintedImageElementMenu } from './Menu'

export const PrintedImageMenuWrapper = () => {
  const selectedElement = useEditedElementStore((state) => state.selectedElement)
  const { elementType, rootElement, elementId } = selectedElement || {}
  const cancelSelectingElement = useEditedElementStore((state) => state.cancelSelectingElement)

  const scrollToSelectedElement = () => {
    if (elementType !== 'printed-image') return
    if (window.innerWidth < 662) {
      document.body
        .querySelector('.NAME-print-area-container')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      document.body
        .querySelector('.NAME-menu-printed-image-element')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  useEffect(() => {
    scrollToSelectedElement()
  }, [elementId, elementType, rootElement])

  return (
    elementType === 'printed-image' &&
    rootElement &&
    elementId && (
      <div className="smd:block hidden w-full">
        <PrintedImageElementMenu elementId={elementId} onClose={cancelSelectingElement} />
      </div>
    )
  )
}
