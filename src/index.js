const canvas = document.getElementById('canvas-container')
const ctx = canvas.getContext('2d')

const midX = Math.round(canvas.width / 2)
const midY = Math.round(canvas.height / 2)

ctx.lineWidth = 2

function calcB (a, angle, reference, reverse, aMid, bMid) {
  const tan = -Math.tan(angle * Math.PI / 180)

  return bMid + (reference === 90 ? 0 : (reverse ? (a - aMid) / tan : tan * (a - aMid)))
}

function initShape (shape) {
  ctx.strokeStyle = 'red'

  switch (shape) {
    case 'square':
      ctx.strokeRect(midX - 50, midY - 50, 100, 100)
      break
    case 'circle':
      ctx.beginPath()
      ctx.arc(midX, midY, 50, 0, 2 * Math.PI)
      ctx.stroke()
      break
    case 'triangle':
      ctx.beginPath()
      ctx.moveTo(midX, midY - 25)
      ctx.lineTo(midX + 25, midY + 25)
      ctx.lineTo(midX - 25, midY + 25)
      ctx.lineTo(midX, midY - 25)
      ctx.stroke()
      break
    default:
      ctx.beginPath()
      ctx.moveTo(midX - 10, midY - 10)
      ctx.lineTo(midX + 10, midY + 10)
      ctx.stroke()
  }
}

async function traceAngle (angle) {
  ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'

  const reference = 90 - Math.abs((angle % 180 + 180) % 180 - 90)
  const steep = reference > 45

  const values = [
    {
      mid: midX,
      max: canvas.width,
      backward: angle > 90 && angle < 270
    },
    {
      mid: midY,
      max: canvas.height,
      backward: angle > 0 && angle < 180
    }
  ]

  if (steep) values.reverse()

  for (let a = values[0].mid; Math.abs(a) <= values[0].max * 100; values[0].backward ? a-- : a++) {
    const b = calcB(a, angle, reference, steep, values[0].mid, values[1].mid)
    const looped = a < 0 || a > values[0].max || b < 0 || b > values[1].max

    const coords = [
      a < 0 ? values[0].max + (a % values[0].max) : a > values[0].max ? a % values[0].max : a,
      b < 0 ? values[1].max + (b % values[1].max) : b > values[1].max ? b % values[1].max : b
    ]

    if (steep) coords.reverse()

    const pixel = ctx.getImageData(...coords, 1, 1).data

    if (pixel[0] && looped) {
      const ghostCoords = [
        values[0].mid + ((a % values[0].max) / 2),
        calcB(values[0].mid + ((a % values[0].max) / 2), angle, reference, steep, values[0].mid, values[1].mid)
      ]

      if (steep) ghostCoords.reverse()

      ctx.fillStyle = 'black'
      ctx.fillRect(...ghostCoords, 2, 2)
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'

      return true
    } else ctx.fillRect(...coords, 1, 1)
  }

  return false
}

function fullTrace () {
  for (let a = 0; a < 360; a++) setTimeout(() => traceAngle(a))
}

initShape('triangle')

fullTrace()
