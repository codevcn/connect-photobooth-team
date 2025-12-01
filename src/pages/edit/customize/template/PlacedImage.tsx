import { TPlacedImage, TTemplateFrame, TTemplateType } from '@/utils/types/global'
import { stylePlacedImageByTemplateType } from '@/configs/print-template/templates-helpers'
import { useRef, useState } from 'react'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { createPortal } from 'react-dom'

type TPlacedImageProps = {
  placedImage: TPlacedImage
  templateType: TTemplateType
  frameIndex: TTemplateFrame['index']
  frame: TTemplateFrame
  isLog?: boolean
  registerChild?: (index: number, el: HTMLImageElement | null) => void
  childIndex?: number
  onImageLoad?: () => void
  displayZoomButton?: boolean
}

export const PlacedImage = ({
  placedImage,
  templateType,
  frameIndex,
  frame,
  isLog,
  registerChild,
  childIndex,
  onImageLoad,
  displayZoomButton = false,
}: TPlacedImageProps) => {
  const { placementState } = placedImage
  const [zoom, setZoom] = useState<number>(1)
  const { containerRef, zoomButtonRef } = useZoomElement<HTMLImageElement>({
    currentZoom: zoom,
    setCurrentZoom: setZoom,
  })
  const imgRef = useRef<HTMLImageElement | null>(null)

  const handleRef = (el: HTMLImageElement | null) => {
    imgRef.current = el
    containerRef.current = el
    if (registerChild && childIndex !== undefined) {
      registerChild(childIndex, el)
    }
  }

  const handleClickImage = () => {
    for (const el of document.body.querySelectorAll<HTMLElement>(
      '.NAME-zoom-placed-image-btn-wrapper'
    )) {
      el.classList.add('hidden')
    }
    const imgRect = imgRef.current?.getBoundingClientRect()
    if (!imgRect) return
    const zoomButton = zoomButtonRef.current
    if (!zoomButton) return
    const btnWrapper = zoomButton.parentElement
    if (!btnWrapper) return
    btnWrapper.classList.remove('hidden')
    btnWrapper.style.top = `${imgRect.top - (imgRect.height / zoom - imgRect.height) / 2}px`
    btnWrapper.style.left = `${imgRect.left - (imgRect.width / zoom - imgRect.width) / 2}px`
    btnWrapper.style.height = `${imgRect.height / zoom}px`
    btnWrapper.style.width = `${imgRect.width / zoom}px`
  }

  return (
    <>
      <img
        onClick={handleClickImage}
        onDragStart={(e) => e.preventDefault()}
        ref={handleRef}
        src={placedImage.imgURL}
        alt="Ảnh in của bạn"
        className="NAME-frame-placed-image h-full w-full absolute top-0 left-0 z-10 select-none"
        style={{
          objectFit: placementState.objectFit,
          willChange: 'transform',
          ...stylePlacedImageByTemplateType(templateType, placedImage, frame, {}, zoom),
        }}
        onLoad={(e) => onImageLoad?.()}
        // data-placed-image-meta-data={JSON.stringify(
        //   typeToObject<TPlacedImageMetaData>({
        //     placedImageInitialSize:,
        //     frameInitialSize,
        //   })
        // )}
      />

      {displayZoomButton &&
        createPortal(
          <div
            style={{ transform: `scale(${zoom})` }}
            className="NAME-zoom-placed-image-btn-wrapper hidden fixed top-0 left-0 z-99 border-2 border-main-cl"
          >
            <button
              ref={zoomButtonRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-[calc(100%-9px)] left-[calc(100%+9px)] rotate-y-180"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-scaling-icon lucide-scaling text-main-cl h-[18px] w-[18px] md:w-[22px] md:h-[22px]"
              >
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M14 15H9v-5" />
                <path d="M16 3h5v5" />
                <path d="M21 3 9 15" />
              </svg>
            </button>
          </div>,
          document.body
        )}
    </>
  )
}
