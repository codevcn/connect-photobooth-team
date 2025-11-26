import {
  TPrintTemplate,
  TTemplateFrame,
  TPrintedImage,
  TPlacedImage,
  TSizeInfo,
  TPrintAreaInfo,
} from '@/utils/types/global'
import { getInitialContants } from '@/utils/contants'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { hardCodedPrintTemplates } from '@/configs/print-template/templates-data'
import { assignFrameSizeByTemplateType } from '@/configs/print-template/templates-helpers'
import { initFramePlacedImageByPrintedImage } from '@/pages/edit/helpers'
import { useEditedElementStore } from '../element/element.store'

type TTemplateStore = {
  allTemplates: TPrintTemplate[]
  pickedTemplate: TPrintTemplate | null
  showTemplatePicker: boolean
  pickedFrame: TTemplateFrame | undefined

  // Actions
  getFrameById: (frameId: string) => TTemplateFrame | undefined
  getFrameByFrameIdAndTemplateId: (
    frameId: string,
    templateId: TPrintTemplate['id']
  ) => TTemplateFrame | undefined
  initializeAddingTemplates: (templates: TPrintTemplate[], isFinal: boolean) => void
  pickTemplate: (template: TPrintTemplate, printAreaForTemplate: TPrintAreaInfo) => void
  hideShowTemplatePicker: (show: boolean) => void
  pickFrame: (frame: TTemplateFrame | undefined) => void
  addImageToFrame: (printedImage: TPrintedImage, printAreaSize: TSizeInfo, frameId?: string) => void
  updateFrameImageURL: (newURL: string, frameId: string, newIdForImageOfURL?: string) => void
  removeFrameImage: (frameId: string) => void
  updatePickedTemplate: (template: TPrintTemplate) => void
}

export const useTemplateStore = create(
  subscribeWithSelector<TTemplateStore>((set, get) => ({
    allTemplates: [],
    pickedTemplate: null,
    showTemplatePicker: false,
    pickedFrame: undefined,

    getFrameByFrameIdAndTemplateId: (frameId, templateId) => {
      const { allTemplates } = get()
      const foundTemplate = allTemplates.find((t) => t.id === templateId)
      if (foundTemplate) {
        const foundFrame = foundTemplate.frames.find((f) => f.id === frameId)
        return foundFrame
      }
    },

    getFrameById: (frameId: string): TTemplateFrame | undefined => {
      const { allTemplates } = get()
      for (const template of allTemplates) {
        const foundFrame = template.frames.find((f) => f.id === frameId)
        if (foundFrame) {
          return foundFrame
        }
      }
      return undefined
    },

    initializeAddingTemplates: (templates, isFinal = false) => {
      if (isFinal) {
        const toCheckUnique = new Map<TPrintTemplate['id'], TPrintTemplate>()
        for (const t of get().allTemplates) {
          toCheckUnique.set(t.id, t)
        }
        for (const t of templates) {
          toCheckUnique.set(t.id, t)
        }
        for (const t of hardCodedPrintTemplates()) {
          if (!toCheckUnique.has(t.id)) {
            toCheckUnique.set(t.id, t)
          }
        }
        set({
          allTemplates: [...toCheckUnique.values()],
        })
      } else {
        set({
          allTemplates: [...get().allTemplates, ...templates],
        })
      }
    },

    pickTemplate: (template, printAreaForTemplate) => {
      const { pickedTemplate } = get()
      if (pickedTemplate && pickedTemplate.id === template.id) return
      for (const frame of template.frames) {
        assignFrameSizeByTemplateType(
          { width: printAreaForTemplate.area.printW, height: printAreaForTemplate.area.printH },
          template.type,
          frame
        )
      }
      console.log('>>> template picked:', template)
      set({ pickedTemplate: template })
    },

    hideShowTemplatePicker: (show) => {
      set({ showTemplatePicker: show })
    },

    pickFrame: (frame) => {
      set({ pickedFrame: frame })
    },

    addImageToFrame: (printedImage, printAreaSize, frameId) => {
      const { allTemplates, pickedTemplate } = get()
      if (!pickedTemplate) return

      const templates = [...allTemplates]

      if (frameId) {
        // Thêm vào frame cụ thể
        for (const template of templates) {
          let frameIndex: number = getInitialContants<number>('PLACED_IMG_FRAME_INDEX')
          for (const frame of template.frames) {
            if (frame.id === frameId) {
              frame.placedImage = initFramePlacedImageByPrintedImage(frameIndex, printedImage)
              // assignFrameSizeByTemplateType(printAreaSize, template.type, frame)
              // if (matchPrintedImgAndAllowSquareMatchToShapeSize(frame, printedImage)) {
              //   frame.placedImage = initFramePlacedImageByPrintedImage(frameIndex, printedImage)
              // } else {
              //   toast.warning('Ảnh không phù hợp với khung hình. Vui lòng chọn ảnh khác.')
              // }
              useEditedElementStore.getState().updateSelectedElement({
                elementURL: printedImage.url,
              })
              break
            }
            frameIndex++
          }
        }
      } else {
        // Thêm vào frame trống đầu tiên của template được chọn
        const currentTemplateId = pickedTemplate.id
        for (const template of templates) {
          if (template.id === currentTemplateId) {
            const foundFrameIndex = template.frames.findIndex((f) => !f.placedImage)
            if (foundFrameIndex >= 0) {
              const foundFrame = template.frames[foundFrameIndex]
              foundFrame.placedImage = initFramePlacedImageByPrintedImage(
                foundFrameIndex + 1,
                printedImage
              )
              useEditedElementStore.getState().updateSelectedElement({
                elementURL: printedImage.url,
              })
              // assignFrameSizeByTemplateType(printAreaSize, template.type, foundFrame)
              // if (matchPrintedImgAndAllowSquareMatchToShapeSize(foundFrame, printedImage)) {
              //   foundFrame.placedImage = initFramePlacedImageByPrintedImage(foundFrameIndex + 1, printedImage)
              // } else {
              //   toast.warning('Ảnh không phù hợp với khung hình. Vui lòng chọn ảnh khác.')
              // }
              break
            }
          }
        }
      }

      set({ allTemplates: templates })
    },

    updateFrameImageURL: (newURL, frameId, newIdForImageOfURL) => {
      const { allTemplates } = get()
      const templates = [...allTemplates]

      for (const template of templates) {
        const foundFrame = template.frames.find((f) => f.id === frameId)
        if (foundFrame) {
          if (foundFrame.placedImage) {
            foundFrame.placedImage.imgURL = newURL
            if (newIdForImageOfURL) {
              foundFrame.placedImage.id = newIdForImageOfURL
            }
          }
          break
        }
      }

      set({ allTemplates: templates })
    },

    removeFrameImage: (frameId) => {
      const { allTemplates } = get()
      const templates = [...allTemplates]

      for (const template of templates) {
        const foundFrame = template.frames.find((f) => f.id === frameId)
        if (foundFrame && foundFrame.placedImage) {
          foundFrame.placedImage = undefined
          break
        }
      }

      set({ allTemplates: templates })
    },

    updatePickedTemplate: (template) => {
      set({ pickedTemplate: { ...template } })
    },
  }))
)

useTemplateStore.subscribe(
  (state) => state.allTemplates,
  (allTemplates) => {
    const pickedTemplate = useTemplateStore.getState().pickedTemplate
    if (pickedTemplate) {
      const pickedTemplateId = pickedTemplate.id
      for (const template of allTemplates) {
        if (template.id === pickedTemplateId) {
          useTemplateStore.getState().updatePickedTemplate(template)
        }
      }
    }
  }
)
