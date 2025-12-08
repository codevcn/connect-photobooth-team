import QRScanner from './QRScanner'
import { TPrintedImage, TUserInputImage } from '@/utils/types/global'
import { useNavigate } from 'react-router-dom'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { generateUniqueId } from '@/utils/helpers'
import { toast } from 'react-toastify'

const ScanQRPage = () => {
  const setPrintedImages = usePrintedImageStore((s) => s.setPrintedImages)
  const navigate = useNavigate()

  const handleData = async (imageDataList: TUserInputImage[]) => {
    setPrintedImages([])
    const imagesToAdd: TPrintedImage[] = []
    for (const imageData of imageDataList) {
      const img = new Image()
      img.onload = () => {
        imagesToAdd.push({
          url: imageData.url,
          height: img.naturalHeight,
          width: img.naturalWidth,
          id: generateUniqueId(),
          isOriginalImage: imageData.isOriginalImage,
        })
        if (imagesToAdd.length === imageDataList.length) {
          imagesToAdd.sort((a, b) => b.width * b.height - a.width * a.height) // ảnh có kích thước lớn nhất phải ở đầu tiên trong danh sách
          setPrintedImages(imagesToAdd)
          navigate('/edit')
        }
      }
      img.onerror = () => {
        toast.error('Đã có lỗi xảy ra khi tải hình ảnh. Có 1 số ảnh không được xử lý.')
      }
      img.src = imageData.url
    }
  }

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload"
        >
          <source src="/videos/scan-qr-page-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Content */}
      <section className="NAME-scan-qr-main-content relative z-10 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl p-2">
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <QRScanner onScanSuccess={handleData} />
        </div>
      </section>
    </div>
  )
}

export default ScanQRPage
