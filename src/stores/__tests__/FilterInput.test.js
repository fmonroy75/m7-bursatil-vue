// src/components/__tests__/FilterInput.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterInput from '../../components/FilterInput.vue'
describe('FilterInput', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(FilterInput, {
      props: {
        modelValue: ''
      }
    })
  })


  describe('Renderizado', () => {
    it('debe renderizar un input de tipo texto', () => {
      const input = wrapper.find('input')
      expect(input.exists()).toBe(true)
      expect(input.attributes('type')).toBe('text')
    })

    it('debe tener el placeholder correcto', () => {
      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe('🔍 Filtrar por nombre o símbolo')
    })

    it('debe tener la clase CSS correcta', () => {
      const input = wrapper.find('input')
      expect(input.classes()).toContain('input-filter')
      expect(input.classes()).toHaveLength(1) // Solo una clase
    })
  })

  describe('Comportamiento con props', () => {
    it('debe mostrar el valor inicial vacío', () => {
      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('debe actualizar cuando cambia modelValue', async () => {
      const input = wrapper.find('input')
      
      await wrapper.setProps({ modelValue: 'bitcoin' })
      expect(input.element.value).toBe('bitcoin')
      
      await wrapper.setProps({ modelValue: 'ethereum' })
      expect(input.element.value).toBe('ethereum')
    })

    it('debe mantener el placeholder cuando hay valor', async () => {
      const input = wrapper.find('input')
      
      await wrapper.setProps({ modelValue: 'solana' })
      expect(input.attributes('placeholder')).toBe('🔍 Filtrar por nombre o símbolo')
    })
  })

  describe('Eventos', () => {
    it('debe emitir update:modelValue al escribir', async () => {
      const input = wrapper.find('input')
      await input.setValue('cardano')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['cardano'])
    })

    it('debe emitir el valor correcto para cada entrada', async () => {
      const input = wrapper.find('input')
      const valores = ['bitcoin', 'ethereum', 'solana']
      
      for (const valor of valores) {
        await input.setValue(valor)
        const ultimoEvento = wrapper.emitted('update:modelValue')?.slice(-1)[0]
        expect(ultimoEvento).toEqual([valor])
      }
    })

    it('debe emitir evento con string vacío cuando se borra', async () => {
      const input = wrapper.find('input')
      
      await input.setValue('bitcoin')
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['bitcoin'])
      
      await input.setValue('')
      expect(wrapper.emitted('update:modelValue')[1]).toEqual([''])
    })

    it('debe emitir en cada tecla presionada', async () => {
      const input = wrapper.find('input')
      
      // CORRECCIÓN: Modificar element.value antes de trigger
      // Primera tecla
      input.element.value = 'b'
      await input.trigger('input')
      
      // Segunda tecla
      input.element.value = 'bi'
      await input.trigger('input')
      
      // Tercera tecla
      input.element.value = 'bit'
      await input.trigger('input')
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(3)
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['b'])
      expect(wrapper.emitted('update:modelValue')[1]).toEqual(['bi'])
      expect(wrapper.emitted('update:modelValue')[2]).toEqual(['bit'])
    })
  })

  describe('Integración', () => {
    it('debe funcionar en un flujo completo', async () => {
      const input = wrapper.find('input')
      
      // 1. Estado inicial
      expect(input.element.value).toBe('')
      expect(input.attributes('placeholder')).toBe('🔍 Filtrar por nombre o símbolo')
      
      // 2. Escribir
      await input.setValue('ripple')
      expect(input.element.value).toBe('ripple')
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['ripple'])
      
      // 3. Cambiar desde fuera
      await wrapper.setProps({ modelValue: 'xrp' })
      expect(input.element.value).toBe('xrp')
      
      // 4. Borrar
      await input.setValue('')
      expect(input.element.value).toBe('')
      expect(wrapper.emitted('update:modelValue')[1]).toEqual([''])
    })

    it('debe mantener el placeholder en todo momento', async () => {
      const input = wrapper.find('input')
      const placeholder = input.attributes('placeholder')
      
      const acciones = [
        () => input.setValue('test'),
        () => input.setValue(''),
        () => input.setValue('otro'),
        () => wrapper.setProps({ modelValue: 'valor' })
      ]
      
      for (const accion of acciones) {
        await accion()
        expect(input.attributes('placeholder')).toBe(placeholder)
      }
    })
  })
})