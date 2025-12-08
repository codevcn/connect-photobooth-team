import { useEditedElementStore } from '@/stores/element/element.store'
import { StickerElement } from '../elements/sticker-element/StickerElement'
import { TextElement } from '../elements/text-element/TextElement'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useSearchParams } from 'react-router-dom'
import { PrintedImageElement } from '../elements/printed-image/PrintedImageElement'
import { TElementControlRegistryRef } from '@/hooks/element/use-element-control'

type TEditedElementsAreaProps = {
  allowedPrintAreaRef: React.RefObject<HTMLDivElement | null>
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
  elementControlRegistryRef: TElementControlRegistryRef
}

export const EditedElementsArea = ({
  allowedPrintAreaRef,
  printAreaContainerRef,
  elementControlRegistryRef,
}: TEditedElementsAreaProps) => {
  const stickerElements = useEditedElementStore((s) => s.stickerElements)
  const textElements = useEditedElementStore((s) => s.textElements)
  const printedImages = useEditedElementStore((s) => s.printedImages)
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const selectElement = useEditedElementStore((s) => s.selectElement)
  const mockupId = useSearchParams()[0].get('mockupId')
  const layers = useElementLayerStore((s) => s.elementLayers)
  console.log('>>> [idx] view layers:', layers)

  return (
    <>
      {stickerElements.length > 0 &&
        stickerElements.map((element) => (
          <StickerElement
            key={element.id}
            element={element}
            allowedPrintAreaRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'from-new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removeStickerElement={(elementId) => {
              useElementLayerStore.getState().removeElementLayers([elementId])
              useEditedElementStore.getState().removeStickerElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
            elementControlRegistryRef={elementControlRegistryRef}
          />
        ))}

      {textElements.length > 0 &&
        textElements.map((element) => (
          <TextElement
            key={element.id}
            element={element}
            allowedPrintAreaRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'from-new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removeTextElement={(elementId) => {
              useElementLayerStore.getState().removeElementLayers([elementId])
              useEditedElementStore.getState().removeTextElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
            elementControlRegistryRef={elementControlRegistryRef}
          />
        ))}

      {printedImages.length > 0 &&
        printedImages.map((element) => (
          <PrintedImageElement
            key={element.id}
            element={element}
            allowedPrintAreaRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'from-new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removePrintedImageElement={(elementId) => {
              useElementLayerStore.getState().removeElementLayers([elementId])
              useEditedElementStore.getState().removePrintedImageElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
            elementControlRegistryRef={elementControlRegistryRef}
          />
        ))}
    </>
  )
}
