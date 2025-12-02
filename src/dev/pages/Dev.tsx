import React, { useState, useEffect, useRef } from 'react'

const FIXED_OFFSET_LEFT = 19
const FIXED_OFFSET_TOP = 23

const ElementPositioningDemo = () => {
  const eleRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [elementB, setElementB] = useState({
    x: 100,
    y: 100,
    width: 150,
    height: 100,
  })

  const [elementA, setElementA] = useState({
    x: 119, // 100 + 19
    y: 123, // 100 + 23
    width: 50,
    height: 50,
  })

  const [offsetLeft, setOffsetLeft] = useState(FIXED_OFFSET_LEFT)
  const [offsetTop, setOffsetTop] = useState(FIXED_OFFSET_TOP)

  // Input controls state
  const [inputs, setInputs] = useState({
    bX: 100,
    bY: 100,
    bWidth: 150,
    bHeight: 100,
  })

  // Calculate fixed offset between A and B
  const calculateFixedOffset = (stateA, stateB) => {
    return {
      offsetLeft: stateA.x - stateB.x,
      offsetTop: stateA.y - stateB.y,
    }
  }

  // Calculate new position for A based on B's new state
  const calculateNewAPosition = (newBState, offsetL, offsetT) => {
    return {
      x: newBState.x + offsetL,
      y: newBState.y + offsetT,
    }
  }

  // Main function to move A with B
  const moveElementAWithB = (currentA, currentB, newB) => {
    const offset = calculateFixedOffset(currentA, currentB) // tính khoảng cách giữa A và B
    const newPosition = calculateNewAPosition(newB, offset.offsetLeft, offset.offsetTop) // tính vị trí mới của A dựa trên: B và offset

    return {
      ...currentA,
      x: newPosition.x,
      y: newPosition.y,
    }
  }

  // Apply changes when inputs change
  const applyChanges = () => {
    const newBState = {
      x: parseFloat(inputs.bX),
      y: parseFloat(inputs.bY),
      width: parseFloat(inputs.bWidth),
      height: parseFloat(inputs.bHeight),
    }

    const newAState = moveElementAWithB(elementA, elementB, newBState)

    setElementB(newBState)
    setElementA(newAState)

    // Update offsets
    const { offsetLeft: newOffsetL, offsetTop: newOffsetT } = calculateFixedOffset(
      newAState,
      newBState
    )
    setOffsetLeft(newOffsetL)
    setOffsetTop(newOffsetT)
  }

  const todo = () => {
    const start = performance.now()
    const style = getComputedStyle(eleRef.current!)
    const end = performance.now()
    console.log('Time to get computed style:', end - start, 'ms')
    console.log('>>> style:', style)
  }

  // Reset to initial positions
  const resetPositions = () => {
    const initialB = {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    }

    const initialA = {
      x: 119,
      y: 123,
      width: 50,
      height: 50,
    }

    setElementB(initialB)
    setElementA(initialA)
    setInputs({
      bX: 100,
      bY: 100,
      bWidth: 150,
      bHeight: 100,
    })
    setScale(1)
    setOffsetLeft(FIXED_OFFSET_LEFT)
    setOffsetTop(FIXED_OFFSET_TOP)
  }

  // Demo resize animation
  const demoResize = () => {
    const steps = [
      { x: 100, y: 100, w: 200, h: 150, delay: 500 },
      { x: 100, y: 100, w: 250, h: 100, delay: 1000 },
      { x: 100, y: 100, w: 100, h: 200, delay: 1500 },
      { x: 100, y: 100, w: 150, h: 100, delay: 2000 },
    ]

    steps.forEach((step) => {
      setTimeout(() => {
        setInputs({
          bX: step.x,
          bY: step.y,
          bWidth: step.w,
          bHeight: step.h,
        })

        const newBState = { x: step.x, y: step.y, width: step.w, height: step.h }
        const newAState = moveElementAWithB(elementA, elementB, newBState)
        setElementB(newBState)
        setElementA(newAState)
      }, step.delay)
    })
  }

  // Demo move animation
  const demoMove = () => {
    const steps = [
      { x: 200, y: 150, w: 150, h: 100, delay: 500 },
      { x: 300, y: 200, w: 150, h: 100, delay: 1000 },
      { x: 150, y: 80, w: 150, h: 100, delay: 1500 },
      { x: 100, y: 100, w: 150, h: 100, delay: 2000 },
    ]

    steps.forEach((step) => {
      setTimeout(() => {
        setInputs({
          bX: step.x,
          bY: step.y,
          bWidth: step.w,
          bHeight: step.h,
        })

        const newBState = { x: step.x, y: step.y, width: step.w, height: step.h }
        const newAState = moveElementAWithB(elementA, elementB, newBState)
        setElementB(newBState)
        setElementA(newAState)
      }, step.delay)
    })
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div ref={eleRef} className="min-h-screen bg-gray-100 p-5 font-sans">
      <h1 className="text-2xl font-bold mb-5">
        Demo: Element A giữ khoảng cách cố định với mép của Element B
      </h1>

      {/* Controls */}
      <div className="bg-white p-5 rounded-lg mb-5 shadow">
        <div className="mb-4">
          <label className="inline-block w-40 font-bold">Scale Container:</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-52 align-middle"
          />
          <span className="ml-2">{scale.toFixed(1)}</span>
        </div>

        <div className="mb-4">
          <label className="inline-block w-40 font-bold">B - X Position:</label>
          <input
            type="number"
            value={inputs.bX}
            onChange={(e) => handleInputChange('bX', e.target.value)}
            min="0"
            max="500"
            className="w-20 px-2 py-1 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="inline-block w-40 font-bold">B - Y Position:</label>
          <input
            type="number"
            value={inputs.bY}
            onChange={(e) => handleInputChange('bY', e.target.value)}
            min="0"
            max="300"
            className="w-20 px-2 py-1 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="inline-block w-40 font-bold">B - Width:</label>
          <input
            type="number"
            value={inputs.bWidth}
            onChange={(e) => handleInputChange('bWidth', e.target.value)}
            min="50"
            max="300"
            className="w-20 px-2 py-1 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="inline-block w-40 font-bold">B - Height:</label>
          <input
            type="number"
            value={inputs.bHeight}
            onChange={(e) => handleInputChange('bHeight', e.target.value)}
            min="50"
            max="300"
            className="w-20 px-2 py-1 border border-gray-300 rounded"
          />
        </div>

        <div>
          <button
            onClick={applyChanges}
            className="bg-blue-600 text-white px-5 py-2 rounded mr-2 hover:bg-blue-700"
          >
            Áp dụng thay đổi
          </button>
          <button
            onClick={todo}
            className="bg-blue-600 text-white px-5 py-2 rounded mr-2 hover:bg-blue-700"
          >
            Reset
          </button>
          <button
            onClick={demoResize}
            className="bg-blue-600 text-white px-5 py-2 rounded mr-2 hover:bg-blue-700"
          >
            Demo Resize
          </button>
          <button
            onClick={demoMove}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Demo Move
          </button>
        </div>
      </div>

      {/* Container with elements */}
      <div className="bg-white p-5 rounded-lg shadow inline-block overflow-hidden">
        <div
          className="relative bg-gray-200 border-2 border-gray-700 transition-transform duration-300"
          style={{
            width: '600px',
            height: '400px',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Element A */}
          <div
            className="absolute flex items-center justify-center font-bold text-white text-lg transition-all duration-300"
            style={{
              left: `${elementA.x}px`,
              top: `${elementA.y}px`,
              width: `${elementA.width}px`,
              height: `${elementA.height}px`,
              background: 'rgba(220, 53, 69, 0.8)',
              border: '2px solid #dc3545',
            }}
          >
            A
          </div>

          {/* Element B */}
          <div
            className="absolute flex items-center justify-center font-bold text-white text-lg transition-all duration-300"
            style={{
              left: `${elementB.x}px`,
              top: `${elementB.y}px`,
              width: `${elementB.width}px`,
              height: `${elementB.height}px`,
              background: 'rgba(40, 167, 69, 0.8)',
              border: '2px solid #28a745',
            }}
          >
            B
          </div>
        </div>
      </div>

      {/* Relative Info */}
      <div className="bg-blue-100 p-4 rounded mt-5 border-l-4 border-blue-500 font-mono whitespace-pre-line">
        {`Vị trí tương đối của A so với B:
• Cách mép trái B: ${offsetLeft.toFixed(1)}px
• Cách mép trên B: ${offsetTop.toFixed(1)}px

Vị trí tuyệt đối:
• A: (${elementA.x.toFixed(1)}, ${elementA.y.toFixed(1)})
• B: (${elementB.x.toFixed(1)}, ${elementB.y.toFixed(1)})

Kích thước B:
• Width: ${elementB.width}px, Height: ${elementB.height}px`}
      </div>

      {/* Info */}
      <div className="bg-yellow-100 p-4 rounded mt-5 border-l-4 border-yellow-500">
        <h3 className="font-bold mb-2">Hướng dẫn:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Element A (đỏ) giữ <strong>khoảng cách PIXEL cố định</strong> từ mép trái và mép trên
            của B
          </li>
          <li>Khi B thay đổi kích thước, A vẫn cách mép trái B là 19px và mép trên B là 23px</li>
          <li>Khi B di chuyển, A cũng di chuyển theo để giữ vị trí tương đối</li>
          <li>Thử thay đổi kích thước B để thấy A luôn giữ khoảng cách cố định!</li>
        </ul>
      </div>
    </div>
  )
}

export { ElementPositioningDemo }
