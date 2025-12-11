export const Dev = () => {
  return (
    <>
      <div className="w-full max-w-md mx-auto bg-white py-6">
        <div className="text-center space-y-2">
          <span className="uppercase tracking-widest text-xs font-semibold text-gray-400">
            Bộ sưu tập mùa hè
          </span>

          <h1 className="text-2xl md:text-3xl font-serif font-medium text-gray-900">
            Classic Cotton Tee
          </h1>

          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="text-xl font-semibold text-gray-900">189.000 đ</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-sm text-green-600 font-medium">Còn hàng</span>
          </div>

          <div className="w-16 h-1 bg-gray-900 mx-auto mt-4 rounded-full"></div>
        </div>
      </div>
    </>
  )
}
