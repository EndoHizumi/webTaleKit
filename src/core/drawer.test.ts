import { sortDisplayedImageEntries } from './drawer'

describe('sortDisplayedImageEntries', () => {
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
      first: { image: {}, 'z-index': 1 },
      second: { image: {}, 'z-index': 1 },
      third: { image: {}, 'z-index': 1 },
    }

    const keys = sortDisplayedImageEntries(displayedImages).map(([key]) => key)
    expect(keys).toEqual(['first', 'second', 'third'])
  })
})
