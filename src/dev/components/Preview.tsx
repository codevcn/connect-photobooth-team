import { Modal } from '@/components/custom/common/Modal'
import { useState } from 'react'
import { createPortal } from 'react-dom'

export const MyPreviewComponent = () => {
  const [openModal, setOpenModal] = useState(false)

  return (
    <>
      {createPortal(
        <div
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 h-12 w-12 fixed top-0 left-0 z-1000"
        >
          <div>oke</div>
        </div>,
        document.body
      )}
      {createPortal(
        <Modal
          onClose={() => setOpenModal(false)}
          classNames={{ rootModal: 'z-999' + (openModal ? ' flex' : ' hidden') }}
        >
          <div className="h-[80vh] w-[80vw] border-3 border-white">
            <div className="NAME-preview-component h-full w-full"></div>
          </div>
        </Modal>,
        document.body
      )}
    </>
  )
}
