type TIdleWarningModalProps = {
  show: boolean
  countdown: number
  onConfirm: () => void
}

/**
 * Modal cảnh báo khi user không hoạt động (toàn cục)
 */
export const IdleWarningModal = ({ show, countdown, onConfirm }: TIdleWarningModalProps) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-main-cl animate-scale-in">
        {/* Icon Warning */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-main-cl/20 rounded-full animate-ping"></div>
            <div className="relative bg-linear-to-br from-main-cl to-pink-hover-cl p-5 rounded-full shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-triangle-alert-icon lucide-triangle-alert text-white"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
          Bạn vẫn đang ở đây chứ?
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          Chúng tôi nhận thấy bạn không có hoạt động. Nếu bạn vẫn muốn tiếp tục, vui lòng xác nhận.
        </p>

        {/* Countdown */}
        <div className="bg-linear-to-br from-main-cl/10 to-pink-hover-cl/10 rounded-2xl p-6 mb-6 border-2 border-main-cl/30">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2 font-medium">Thời gian còn lại</p>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-white rounded-xl px-6 py-3 shadow-md border-2 border-main-cl">
                <span className="text-4xl font-bold text-main-cl tabular-nums">{countdown}</span>
              </div>
              <span className="text-2xl font-bold text-gray-600">giây</span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          className="w-full bg-linear-to-r from-main-cl to-pink-hover-cl hover:from-dark-main-cl hover:to-main-cl text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Vâng, tôi vẫn ở đây!</span>
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Nếu không xác nhận, bạn sẽ được chuyển về trang chủ
        </p>
      </div>
    </div>
  )
}
