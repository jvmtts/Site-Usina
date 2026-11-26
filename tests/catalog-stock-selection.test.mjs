import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveStockGallery, resolveStockSelection } from '../src/catalog/stockSelection.ts'

const options = [
  { id: 'ice-m', label: 'Ice / M', price: 490, color: 'Ice', size: 'M' },
  { id: 'blue-m', label: 'Azul-Turquesa / M', price: 500, color: 'Azul-Turquesa', size: 'M' },
  { id: 'blue-g', label: 'Azul-Turquesa / G', price: 529, color: 'Azul-Turquesa', size: 'G' },
  { id: 'graphite-eg', label: 'Grafite / EG', price: null, color: 'Grafite', size: 'EG' },
]

test('selects a real default option at the model price and retains sizes across matching colors', () => {
  const initial = resolveStockSelection(options, 490)
  assert.equal(initial.option.id, 'ice-m')
  assert.deepEqual(initial.colors, ['Ice', 'Azul-Turquesa', 'Grafite'])

  const selection = resolveStockSelection(options, 490, { color: 'Azul-Turquesa', size: initial.size })
  assert.deepEqual(selection.sizes, ['M', 'G'])
  assert.equal(selection.option.id, 'blue-m')
  assert.equal(selection.option.price, 500)
})

test('clears an unavailable size when there are several choices and selects a sole valid size', () => {
  const selection = resolveStockSelection(options, 490, { color: 'Azul-Turquesa', size: 'EG' })
  assert.equal(selection.size, '')
  assert.equal(selection.option, undefined)

  const only = resolveStockSelection(options, 490, { color: 'Grafite', size: 'G' })
  assert.equal(only.size, 'EG')
  assert.equal(only.option.id, 'graphite-eg')
  assert.equal(only.option.price, null)
})

test('updates an unavailable size or color after inventory refresh', () => {
  const choice = { color: 'Azul-Turquesa', size: 'M' }
  const refreshed = options.filter(option => option.id !== 'blue-m')
  assert.equal(resolveStockSelection(refreshed, 490, choice).option.id, 'blue-g')

  const withoutColor = options.filter(option => option.color !== 'Azul-Turquesa')
  const selection = resolveStockSelection(withoutColor, 490, choice)
  assert.equal(selection.color, 'Ice')
  assert.equal(selection.option.id, 'ice-m')
})

test('leaves flat and mixed ERP options on the existing dropdown path', () => {
  const flat = { id: 'other', label: 'Outra versão', price: null }
  assert.equal(resolveStockSelection([], null), undefined)
  assert.equal(resolveStockSelection([flat], null), undefined)
  assert.equal(resolveStockSelection([...options, flat], null), undefined)
})

test('chooses color photos across spelling punctuation and excludes other colors from fallback', () => {
  const product = {
    imagens: ['ice.webp', 'general.webp', 'https://via.placeholder.com/model'],
    imagensPorCor: { Ice: ['ice.webp'], 'Azul-Turquesa': ['blue.webp'] },
  }
  assert.deepEqual(resolveStockGallery(product, 'áZUL turquesa'), ['blue.webp'])
  assert.deepEqual(resolveStockGallery(product, 'Grafite'), ['general.webp'])
  assert.deepEqual(resolveStockGallery({ ...product, imagens: ['ice.webp'] }, 'Grafite'), [])
})
