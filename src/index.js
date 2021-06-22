const canvas = document.getElementById('canvas-container')
const ctx = canvas.getContext('2d')

const midX = Math.round(canvas.width / 2)
const midY = Math.round(canvas.height / 2)
const radius = 50

ctx.lineWidth = 2
const threshold = 100

function calcB (a, angle, reference, reverse, aMid, bMid) {
  const tan = -Math.tan(angle * Math.PI / 180)

  return bMid + (reference === 90 ? 0 : (reverse ? (a - aMid) / tan : tan * (a - aMid)))
}

function initShape (shape) {
  ctx.strokeStyle = 'red'

  switch (shape) {
    case 'square':
      ctx.strokeRect(midX - radius, midY - radius, radius * 2, radius * 2)
      break
    case 'circle':
      ctx.beginPath()
      ctx.arc(midX, midY, radius, 0, 2 * Math.PI)
      ctx.stroke()
      break
    case 'triangle':
      ctx.beginPath()
      ctx.moveTo(midX, midY - radius)
      ctx.lineTo(midX + radius, midY + radius)
      ctx.lineTo(midX - radius, midY + radius)
      ctx.lineTo(midX, midY - radius)
      ctx.stroke()
      break
    default:
      ctx.beginPath()
      ctx.moveTo(midX - (radius / 2), midY - (radius / 2))
      ctx.lineTo(midX + (radius / 2), midY + (radius / 2))
      ctx.stroke()
  }
}

function traceAngle (angle) {
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

  for (let a = values[0].mid; Math.abs(a) <= values[0].max * threshold; values[0].backward ? a-- : a++) {
    const b = calcB(a, angle, reference, steep, values[0].mid, values[1].mid)
    const looped = a < 0 || a > values[0].max || b < 0 || b > values[1].max

    const coords = [
      a < 0 ? values[0].max + (a % values[0].max) : a > values[0].max ? a % values[0].max : a,
      b < 0 ? values[1].max + (b % values[1].max) : b > values[1].max ? b % values[1].max : b
    ]

    if (steep) coords.reverse()

    const pixel = ctx.getImageData(...coords, 1, 1).data

    if (pixel[0] && looped) {
      const projA = values[0].mid + (a < 0 ? -radius : radius) + ((a - values[0].mid) / (threshold / 2))
      const projCoords = [
        projA,
        calcB(projA, angle, reference, steep, values[0].mid, values[1].mid)
      ]

      if (steep) projCoords.reverse()

      console.log('SKEL:', a, b)
      console.log('HIT COORDS:', coords)
      console.log('PROJECTION COORDS:', projCoords)

      ctx.fillStyle = 'black'
      ctx.fillRect(...projCoords, 2, 2)
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'

      return true
    } else ctx.fillRect(...coords, 1, 1)
  }

  return false
}

function fullTrace () {
  for (let a = 0; a < 360; a++) {
    setTimeout(() => {
      const hit = traceAngle(a)

      if (!hit) console.warn(`Angle ${a} did not hit a surface. Try increasing loop threshold`)
    })
  }
}

const buttons = document.getElementsByTagName('button')

for (const button of buttons) {
  button.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    initShape(button.id)

    fullTrace()
  })
}
