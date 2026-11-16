import { pickSpatial, pickWrap, padDir, DirRepeat, REPEAT_DELAY, REPEAT_EVERY } from './padNav'

const r = (left: number, top: number, width = 100, height = 40) => ({ left, top, width, height })

describe('pickSpatial（押した向きの、いちばん近いボタン）', () => {
  // 2 列 × 2 行のカード（依頼ボードのような並び）
  //  0 1
  //  2 3
  const grid = [r(0, 0), r(200, 0), r(0, 100), r(200, 100)]

  test('格子の上下左右に動く', () => {
    expect(pickSpatial(grid, 0, 'right')).toBe(1)
    expect(pickSpatial(grid, 0, 'down')).toBe(2)
    expect(pickSpatial(grid, 3, 'left')).toBe(2)
    expect(pickSpatial(grid, 3, 'up')).toBe(1)
  })

  test('DOM 順の次（1）ではなく、真下（2）へ動く', () => {
    expect(pickSpatial(grid, 0, 'down')).toBe(2)
  })

  test('その向きに何も無ければ -1', () => {
    expect(pickSpatial(grid, 0, 'up')).toBe(-1)
    expect(pickSpatial(grid, 1, 'right')).toBe(-1)
  })

  test('近くても横にずれたものより、少し遠くても真下にあるものを選ぶ', () => {
    // 0 の真下に遠い 1、斜め下の近くに 2
    const rects = [r(0, 0), r(0, 200), r(300, 60)]
    expect(pickSpatial(rects, 0, 'down')).toBe(1)
  })

  test('押した向きから大きく外れたもの（右上から見た、ずっと下のボタン）は選ばない', () => {
    // 0 1
    //       2（下のほうの右寄りのボタン）
    const rects = [r(0, 0), r(200, 0), r(300, 400)]
    expect(pickSpatial(rects, 1, 'right')).toBe(-1)
    expect(pickSpatial(rects, 1, 'down')).toBe(2)
  })

  test('縦一列の選択肢', () => {
    const list = [r(0, 0, 400), r(0, 60, 400), r(0, 120, 400)]
    expect(pickSpatial(list, 0, 'down')).toBe(1)
    expect(pickSpatial(list, 2, 'up')).toBe(1)
    expect(pickSpatial(list, 1, 'left')).toBe(-1)
  })
})

describe('pickWrap（向きに無いときの回り込み）', () => {
  test('下・右は次、最後の次は最初', () => {
    expect(pickWrap(3, 0, 'down')).toBe(1)
    expect(pickWrap(3, 2, 'right')).toBe(0)
  })
  test('上・左は前、最初の前は最後', () => {
    expect(pickWrap(3, 0, 'up')).toBe(2)
    expect(pickWrap(3, 2, 'left')).toBe(1)
  })
  test('空なら -1', () => {
    expect(pickWrap(0, 0, 'down')).toBe(-1)
  })
})

describe('padDir（十字キーと左スティック）', () => {
  const btn = (i: number) => Object.assign([] as boolean[], { [i]: true })
  test('十字キー', () => {
    expect(padDir(btn(12), [])).toBe('up')
    expect(padDir(btn(13), [])).toBe('down')
    expect(padDir(btn(14), [])).toBe('left')
    expect(padDir(btn(15), [])).toBe('right')
  })
  test('スティックは小さな傾きを無視し、斜めは強いほうの軸', () => {
    expect(padDir([], [0.2, 0.3])).toBeNull()
    expect(padDir([], [0.9, 0.6])).toBe('right')
    expect(padDir([], [-0.3, -0.8])).toBe('up')
  })
})

describe('DirRepeat（長押し）', () => {
  test('押した瞬間に 1 回、しばらく待ってから一定の間隔で繰り返す', () => {
    const rep = new DirRepeat()
    expect(rep.update('down', 0)).toBe('down')
    expect(rep.update('down', REPEAT_DELAY - 1)).toBeNull()
    expect(rep.update('down', REPEAT_DELAY)).toBe('down')
    expect(rep.update('down', REPEAT_DELAY + REPEAT_EVERY - 1)).toBeNull()
    expect(rep.update('down', REPEAT_DELAY + REPEAT_EVERY)).toBe('down')
  })
  test('離したら止まり、向きを変えたらすぐ動く', () => {
    const rep = new DirRepeat()
    rep.update('down', 0)
    expect(rep.update(null, 10)).toBeNull()
    expect(rep.update('right', 20)).toBe('right')
  })
})
