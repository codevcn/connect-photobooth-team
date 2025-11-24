import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useNavigate } from 'react-router-dom'
import { MockupPreview } from './MockupPreview'
import { useEffect, useState } from 'react'
import { LocalStorageHelper } from '@/utils/localstorage'

export const Actions = () => {
  const cartCount = useProductUIDataStore((s) => s.cartCount)
  const navigate = useNavigate()
  const [showMockupPreview, setShowMockupPreview] = useState(false)
  const pickedSurface = useProductUIDataStore((s) => s.pickedSurface)

  const addToCart = () => {
    eventEmitter.emit(EInternalEvents.ADD_TO_CART)
  }

  const updateCartCount = () => {
    useProductUIDataStore.getState().setCartCount(LocalStorageHelper.countSavedMockupImages())
  }

  useEffect(() => {
    updateCartCount()
  }, [])

  return (
    <div className="order-3 py-2">
      <button
        onClick={() => setShowMockupPreview(true)}
        className="w-full cursor-pointer border-main-cl border-2 active:bg-main-hover-cl text-main-cl font-bold h-10 px-4 rounded shadow-lg touch-target flex items-center justify-center gap-2 text-lg"
      >
        Xem trước bản mockup
      </button>
      <div className="flex gap-2 items-stretch mt-3 flex-col lg:flex-row">
        <button
          onClick={addToCart}
          className="w-full cursor-pointer bg-main-cl mobile-touch text-white font-bold h-10 px-4 rounded shadow-lg flex items-center justify-center gap-2 text-lg"
        >
          <span>Thêm vào giỏ hàng</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-check-icon lucide-check"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
        <button
          onClick={() => navigate('/payment')}
          className="flex items-center justify-center gap-2 lg:block relative cursor-pointer bg-white border-2 border-gray-200 px-2 h-10 rounded-md shadow mobile-touch"
        >
          <span className="inline-block lg:hidden">Xem giỏ hàng</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-shopping-cart-icon lucide-shopping-cart"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-main-cl text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {showMockupPreview && pickedSurface && (
        <MockupPreview onClose={() => setShowMockupPreview(false)} />
      )}
    </div>
  )
}
