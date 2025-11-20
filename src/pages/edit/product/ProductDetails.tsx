import { Modal } from '@/components/custom/common/Modal'
import { VietnamFlag } from '@/components/custom/icons/VietnamFlag'
import { TBaseProduct, TClientProductVariant } from '@/utils/types/global'
import { useState } from 'react'

type TProductDetailsProps = {
  pickedProduct: TBaseProduct
  pickedVariant: TClientProductVariant
}

export const ProductDetails = ({ pickedProduct, pickedVariant }: TProductDetailsProps) => {
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<TClientProductVariant['id']>(
    pickedVariant.id
  )

  return (
    <div className="w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{pickedProduct.name}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-3xl font-bold text-orange-600">
          <span>{pickedVariant.priceAmountOneSide}</span>
          <span>{pickedVariant.currency}</span>
        </span>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-lg space-y-2 p-4 my-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Người bán</span>
          <span className="font-semibold text-gray-900">Photoism</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-800 font-bold">Chăm sóc khách hàng</span>
          <span className="font-semibold text-orange-600 hover:text-pink-hover-cl transition-colors">
            0987 654 321
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {pickedVariant.stock > 0 ? (
          <>
            <span className="flex items-center gap-1 font-medium text-orange-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Còn hàng
            </span>
            <span className="text-gray-500">
              • <span>{pickedVariant.stock}</span> sản phẩm
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1 font-medium text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Hết hàng
          </span>
        )}
      </div>

      <div className="space-y-3 text-sm mt-2">
        <div className="flex items-center">
          <div className="mr-2 text-lg">
            <VietnamFlag />
          </div>
          <div>
            <span className="text-gray-600">Vận chuyển đến </span>
            <span className="font-bold">Vietnam</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between w-full">
          <label className="block text-sm font-bold text-slate-900 mb-1">Size</label>
          <button
            onClick={() => setShowSizeChart(true)}
            className="cursor-pointer active:scale-90 text-primary underline text-sm"
          >
            Size chart
          </button>
        </div>
        <div className="flex space-x-2">
          {pickedProduct.variants.map(({ size, id }) => (
            <button
              key={id}
              className={`${
                selectedVariantId === id
                  ? 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50'
                  : 'border border-gray-300 text-slate-700 hover:border-gray-400'
              } px-6 mobile-touch py-2 font-bold rounded bg-white transition-colors`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {showSizeChart && (
        <Modal
          onClose={() => setShowSizeChart(false)}
          title="Bảng kích thước"
          classNames={{
            contentContainer: 'p-0 overflow-y-auto',
            titleContainer: 'bg-secondary-cl text-white',
            board: 'max-w-2xl',
          }}
        >
          <div className="bg-white w-full rounded-xl shadow-2xl border border-gray-200 relative">
            <div className="p-4">
              <div className="border border-slate-300 rounded-2xl p-6">
                <p className="text-center text-sm text-gray-800 font-medium mb-8">
                  Có thể chênh lệch ±1.5 inch do đo thủ công và quy trình sản xuất
                </p>

                <div className="flex justify-center items-end gap-4 h-64 mb-8 relative">
                  <div className="text-center opacity-50 w-full h-full flex items-center justify-center bg-yellow-50 rounded-lg border border-dashed border-orange-300 text-orange-400">
                    [Khu vực dành cho hình ảnh Silhouettes: Phụ nữ, Nam, Trẻ em, Em bé]
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-800 font-medium text-center">
                  <p className="pb-4 border-b border-gray-200">
                    Vòng ngực - Đo ngang ngực cách nách 1 inch khi đặt áo nằm phẳng.
                  </p>
                  <p className="pb-4 border-b border-gray-200">
                    Vòng ngực nữ - Đo cách nách 1 inch.
                  </p>
                  <p>Chiều dài áo - Đo từ điểm cao nhất của vai phía sau.</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
