import {
  TPlacedImage,
  TPlacedImageMetaData,
  TTemplateFrame,
  TTemplateType,
} from '@/utils/types/global'
import { useDragImageInFrame } from '@/hooks/element/use-drag-image-in-frame'
import { typeToObject } from '@/utils/helpers'
import { stylePlacedImageByTemplateType } from '@/configs/print-template/templates-helpers'

type TPlacedImageProps = {
  placedImage: TPlacedImage
  templateType: TTemplateType
  frameIndex: TTemplateFrame['index']
  frame: TTemplateFrame
  isLog?: boolean
}

export const PlacedImage = ({
  placedImage,
  templateType,
  frameIndex,
  frame,
  isLog,
}: TPlacedImageProps) => {
  const { placementState } = placedImage

  // Hook để kéo ảnh trong frame với ràng buộc boundary
  // const { imageRef } = useDragImageInFrame({
  //   frameId: placedImage.id,
  //   initialPosition: { x: 0, y: 0 },
  //   disabled: false,
  //   saveElementPosition: (frameId, position) => {},
  // })

  return (
    <img
      // ref={imageRef as React.RefObject<HTMLImageElement>}
      src={placedImage.imgURL}
      alt="Ảnh in của bạn"
      className="NAME-frame-placed-image h-full w-full absolute top-0 left-0"
      style={{
        objectFit: placementState.objectFit,
        willChange: 'transform',
        ...stylePlacedImageByTemplateType(templateType, placedImage, frame, {}, isLog),
      }}
      // data-placed-image-meta-data={JSON.stringify(
      //   typeToObject<TPlacedImageMetaData>({
      //     placedImageInitialSize:,
      //     frameInitialSize,
      //   })
      // )}
    />
  )
}
