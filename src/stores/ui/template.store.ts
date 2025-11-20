import { TPrintTemplate, TTemplateFrame, TPrintedImage } from '@/utils/types/global'
import { getInitialContants } from '@/utils/contants'
import { create } from 'zustand'

type TTemplateStore = {
  availableTemplates: TPrintTemplate[]
  pickedTemplate: TPrintTemplate | null
  showTemplatePicker: boolean
  pickedFrame: TTemplateFrame | undefined
  
  // Actions
  initializeTemplates: (templates: TPrintTemplate[]) => void
  setPickedTemplate: (template: TPrintTemplate) => void
  setShowTemplatePicker: (show: boolean) => void
  setPickedFrame: (frame: TTemplateFrame | undefined) => void
  addImageToFrame: (printedImage: TPrintedImage, frameId?: string) => void
  updateFrameImageURL: (newURL: string, frameId: string, idOfURLImage?: string) => void
  removeFrameImage: (frameId: string) => void
}

export const useTemplateStore = create<TTemplateStore>((set, get) => ({
  availableTemplates: [],
  pickedTemplate: null,
  showTemplatePicker: false,
  pickedFrame: undefined,

  initializeTemplates: (templates) => {
    set({
      availableTemplates: templates,
      pickedTemplate: templates[0] || null,
    })
  },

  setPickedTemplate: (template) => {
    const { pickedTemplate } = get()
    if (pickedTemplate && pickedTemplate.id === template.id) return
    set({ pickedTemplate: template })
  },

  setShowTemplatePicker: (show) => {
    set({ showTemplatePicker: show })
  },

  setPickedFrame: (frame) => {
    set({ pickedFrame: frame })
  },

  addImageToFrame: (printedImage, frameId) => {
    const { availableTemplates, pickedTemplate } = get()
    if (!pickedTemplate) return

    const templates = [...availableTemplates]
    const pickedTemplateId = pickedTemplate.id

    if (frameId) {
      // Thêm vào frame cụ thể
      for (const template of templates) {
        let frameIndex: number = getInitialContants<number>('PLACED_IMG_FRAME_INDEX')
        for (const frame of template.frames) {
          if (frame.id === frameId) {
            frame.placedImage = {
              id: printedImage.id,
              imgURL: printedImage.url,
              placementState: {
                frameIndex,
                zoom: getInitialContants<number>('PLACED_IMG_ZOOM'),
                objectFit: getInitialContants<'contain'>('PLACED_IMG_OBJECT_FIT'),
                squareRotation: getInitialContants<number>('PLACED_IMG_SQUARE_ROTATION'),
              },
            }
          }
          frameIndex++
        }
      }
    } else {
      // Thêm vào frame trống đầu tiên của template được chọn
      for (const template of templates) {
        if (template.id === pickedTemplateId) {
          const foundFrameIndex = template.frames.findIndex((f) => !f.placedImage)
          if (foundFrameIndex >= 0) {
            template.frames[foundFrameIndex].placedImage = {
              id: printedImage.id,
              imgURL: printedImage.url,
              placementState: {
                frameIndex: foundFrameIndex + 1,
                zoom: getInitialContants<number>('PLACED_IMG_ZOOM'),
                objectFit: getInitialContants<'contain'>('PLACED_IMG_OBJECT_FIT'),
                squareRotation: getInitialContants<number>('PLACED_IMG_SQUARE_ROTATION'),
              },
            }
            break
          }
        }
      }
    }

    set({ availableTemplates: templates })
  },

  updateFrameImageURL: (newURL, frameId, idOfURLImage) => {
    const { availableTemplates } = get()
    const templates = [...availableTemplates]

    for (const template of templates) {
      const foundFrame = template.frames.find((f) => f.id === frameId)
      if (foundFrame) {
        if (foundFrame.placedImage) {
          foundFrame.placedImage.imgURL = newURL
          if (idOfURLImage) {
            foundFrame.placedImage.id = idOfURLImage
          }
        }
        break
      }
    }

    set({ availableTemplates: templates })
  },

  removeFrameImage: (frameId) => {
    const { availableTemplates } = get()
    const templates = [...availableTemplates]

    for (const template of templates) {
      const foundFrame = template.frames.find((f) => f.id === frameId)
      if (foundFrame && foundFrame.placedImage) {
        foundFrame.placedImage = undefined
        break
      }
    }

    set({ availableTemplates: templates })
  },
}))
