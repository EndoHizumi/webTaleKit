import { sortDisplayedImageEntries } from './drawer'

describe('sortDisplayedImageEntries', () => {
  test('order属性で昇順ソートされること', () => {
    const displayedImages = {
      a: { image: {}, order: 20 },
      b: { image: {}, order: 10 },
      c: { image: {}, order: 30 },
    }

    const keys = sortDisplayedImageEntries(displayedImages).map(([key]) => key)
    expect(keys).toEqual(['b', 'a', 'c'])
  })

  test('z-index属性で昇順ソートされること', () => {
    const displayedImages = {
      a: { image: {}, 'z-index': 3 },
      b: { image: {}, 'z-index': 1 },
      c: { image: {}, 'z-index': 2 },
    }

    const keys = sortDisplayedImageEntries(displayedImages).map(([key]) => key)
    expect(keys).toEqual(['b', 'c', 'a'])
  })

  test('同順位は元の挿入順を維持すること', () => {
    const displayedImages = {
      first: { image: {}, order: 1 },
      second: { image: {}, order: 1 },
      third: { image: {}, order: 1 },
    }

    const keys = sortDisplayedImageEntries(displayedImages).map(([key]) => key)
    expect(keys).toEqual(['first', 'second', 'third'])
  })
})
