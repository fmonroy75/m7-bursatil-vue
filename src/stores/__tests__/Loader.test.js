// src/components/__tests__/Loader.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Loader from '../../components/Loader.vue'

describe('Loader Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Loader)
  })

  describe('Renderizado básico', () => {
    it('debe renderizar un elemento div', () => {
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('debe tener el id "loader"', () => {
      expect(wrapper.attributes('id')).toBe('loader')
    })

    it('debe ser visible', () => {
      expect(wrapper.isVisible()).toBe(true)
    })
  })

  describe('Contenido de texto', () => {
    it('debe mostrar el mensaje de carga correcto', () => {
      expect(wrapper.text()).toBe('Cargando datos del mercado...')
    })

    it('debe contener la palabra "Cargando"', () => {
      expect(wrapper.text()).toContain('Cargando')
    })

    it('debe contener la palabra "mercado"', () => {
      expect(wrapper.text()).toContain('mercado')
    })

    it('debe terminar con tres puntos', () => {
      expect(wrapper.text()).toMatch(/\.\.\.$/)
    })
  })

  describe('Estructura', () => {
    it('no debe tener elementos hijos', () => {
      expect(wrapper.find('*').exists()).toBe(true) // El div existe
      expect(wrapper.findAll('*').length).toBe(1) // Solo el div, sin hijos
    })

    it('debe tener solo texto directo', () => {
      expect(wrapper.find('span').exists()).toBe(false)
      expect(wrapper.find('p').exists()).toBe(false)
      expect(wrapper.find('div').exists()).toBe(true) // El div principal
    })
  })

  describe('Estilos básicos (si aplica)', () => {
    it('puede tener estilos por defecto', () => {
      // Esto es opcional, dependiendo de si tienes estilos en el componente
      const styles = window.getComputedStyle(wrapper.element)
      expect(styles).toBeDefined()
    })
  })

  // Prueba de snapshot (opcional)
  it('debe coincidir con el snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })
})

// Pruebas de integración con otros componentes
describe('Loader en contexto', () => {
  it('debe mostrarse cuando se está cargando', () => {
    const wrapper = mount({
      template: `
        <div>
          <Loader v-if="loading" />
          <div v-else>Contenido cargado</div>
        </div>
      `,
      components: { Loader },
      data() {
        return { loading: true }
      }
    })

    expect(wrapper.find('#loader').exists()).toBe(true)
    expect(wrapper.text()).toContain('Cargando datos del mercado')
  })

  it('debe ocultarse cuando termina la carga', async () => {
    const wrapper = mount({
      template: `
        <div>
          <Loader v-if="loading" />
          <div v-else>Contenido cargado</div>
        </div>
      `,
      components: { Loader },
      data() {
        return { loading: true }
      }
    })

    expect(wrapper.find('#loader').exists()).toBe(true)

    await wrapper.setData({ loading: false })
    
    expect(wrapper.find('#loader').exists()).toBe(false)
    expect(wrapper.text()).toBe('Contenido cargado')
  })
})