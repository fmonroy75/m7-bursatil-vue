// src/components/__tests__/MarketTable.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MarketTable from '../../components/MarketTable.vue'

describe('MarketTable', () => {
  let wrapper
  const mockDatos = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'btc',
      image: 'https://example.com/btc.png',
      current_price: 50000,
      price_change_percentage_24h: 2.5,
      market_cap: 1000000000
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'eth',
      image: 'https://example.com/eth.png',
      current_price: 3000,
      price_change_percentage_24h: -1.2,
      market_cap: 500000000
    }
  ]

  beforeEach(() => {
    wrapper = mount(MarketTable, {
      props: {
        datos: mockDatos
      }
    })
  })

  it('debe renderizar la tabla correctamente', () => {
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('debe tener los encabezados correctos', () => {
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(4)
    expect(headers[0].text()).toBe('Activo')
    expect(headers[1].text()).toBe('Precio (USD)')
    expect(headers[2].text()).toBe('Variación 24h')
    expect(headers[3].text()).toBe('Market Cap')
  })

  it('debe renderizar todas las filas de datos', () => {
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
  })

  it('debe mostrar la información correcta del activo', () => {
    const firstRow = wrapper.findAll('tbody tr')[0]
    
    // Verificar imagen
    expect(firstRow.find('img').attributes('src')).toBe('https://example.com/btc.png')
    expect(firstRow.find('img').attributes('width')).toBe('25')
    
    // Verificar nombre
    expect(firstRow.find('strong').text()).toBe('Bitcoin')
    
    // Verificar precio formateado
    const cells = firstRow.findAll('td')
    expect(cells[1].text()).toContain('$50,000.00')
    
    // Verificar variación
    expect(cells[2].text()).toContain('2.50%')
    expect(cells[2].classes()).toContain('price-up')
  })

  it('debe aplicar la clase correcta según variación positiva', () => {
    const firstRow = wrapper.findAll('tbody tr')[0]
    const variacionCell = firstRow.findAll('td')[2]
    expect(variacionCell.classes()).toContain('price-up')
    expect(variacionCell.classes()).not.toContain('price-down')
  })

  it('debe aplicar la clase correcta según variación negativa', () => {
    const secondRow = wrapper.findAll('tbody tr')[1]
    const variacionCell = secondRow.findAll('td')[2]
    expect(variacionCell.classes()).toContain('price-down')
    expect(variacionCell.classes()).not.toContain('price-up')
  })

  it('debe formatear correctamente los precios', () => {
    const firstRow = wrapper.findAll('tbody tr')[0]
    const cells = firstRow.findAll('td')
    
    // Precio
    expect(cells[1].text()).toMatch(/^\$[\d,]+\.\d{2}$/)
    
    // Market Cap
    expect(cells[3].text()).toMatch(/^\$[\d,]+\.\d{2}$/)
  })

  it('debe manejar array vacío', async () => {
    await wrapper.setProps({ datos: [] })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(0)
  })

  it('debe actualizar cuando cambian los datos', async () => {
    const nuevosDatos = [
      {
        id: 'cardano',
        name: 'Cardano',
        symbol: 'ada',
        image: 'https://example.com/ada.png',
        current_price: 1.5,
        price_change_percentage_24h: 5.0,
        market_cap: 50000000
      }
    ]

    await wrapper.setProps({ datos: nuevosDatos })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)
    expect(rows[0].find('strong').text()).toBe('Cardano')
  })
})