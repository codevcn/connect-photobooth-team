import React, { useState } from 'react'
import ReactDOM from 'react-dom'

export const MyDevComponent: React.FC = () => {
  const [showModal, setShowModal] = useState(false)

  const [coords, setCoords] = useState([
    { x: '', y: '' },
    { x: '', y: '' },
    { x: '', y: '' },
    { x: '', y: '' },
  ])

  const [points, setPoints] = useState<{ x: number; y: number }[]>([])

  const updateCoord = (index: number, key: 'x' | 'y', value: string) => {
    const newCoords = [...coords]
    newCoords[index][key] = value
    setCoords(newCoords)
  }

  const handleOk = () => {
    const parsed = coords
      .map((c) => ({
        x: Number(c.x),
        y: Number(c.y),
      }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y))

    setPoints(parsed)
    setShowModal(false)
  }

  const portalRoot = document.body

  // ===== VẼ LINE NỐI HAI ĐIỂM =====
  const renderLine = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    index: number
  ) => {
    if (!p1 || !p2) return null

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y

    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI

    return (
      <div
        key={`line-${index}`}
        style={{
          position: 'absolute',
          top: p1.y,
          left: p1.x,
          width: length,
          height: 3,
          background: '#2563eb',
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 50%',
          zIndex: 9997,
        }}
      />
    )
  }

  return ReactDOM.createPortal(
    <>
      {/* Trigger bar */}
      <div
        onClick={() => setShowModal(true)}
        className="fixed top-0 left-0 bg-blue-600 text-white px-4 py-2 cursor-pointer z-9999"
      >
        OK
      </div>

      {/* Points */}
      {points.map((p, idx) => (
        <div
          key={idx}
          className="absolute bg-blue-600"
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            top: p.y,
            left: p.x,
            transform: 'translate(-50%, -50%)',
            zIndex: 9998,
          }}
        />
      ))}

      {/* Lines nối 4 điểm */}
      {points.length === 4 && (
        <>
          {renderLine(points[0], points[1], 1)}
          {renderLine(points[1], points[2], 2)}
          {renderLine(points[2], points[3], 3)}
          {renderLine(points[3], points[0], 4)}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-99999"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleOk()
            }
          }}
          tabIndex={0} // quan trọng để div nhận focus
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-[350px]">
            <h2 className="text-lg font-semibold mb-4">Nhập tọa độ (x, y)</h2>

            {coords.map((c, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder={`Point ${index + 1} - X`}
                  value={c.x}
                  onChange={(e) => updateCoord(index, 'x', e.target.value)}
                  className="border p-2 rounded w-full"
                  autoFocus={index === 0}
                />
                <input
                  type="number"
                  placeholder={`Point ${index + 1} - Y`}
                  value={c.y}
                  onChange={(e) => updateCoord(index, 'y', e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}

            <button onClick={handleOk} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              OK
            </button>
          </div>
        </div>
      )}
    </>,
    portalRoot
  )
}
