<template>
    <input
      class="input-filter"
      type="text"
      placeholder="🔍 Filtrar por nombre o símbolo"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </template>
  
  <script setup>
  defineProps(['modelValue'])
  defineEmits(['update:modelValue'])
  </script>
  