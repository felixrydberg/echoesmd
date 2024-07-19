<script setup lang="ts">
  import { ref, onMounted, PropType } from 'vue'
  import tippy from 'tippy.js';
  import 'tippy.js/dist/svg-arrow.css';
  import { background, border, hover, shadow, transition, typography } from '../../variables';
  const props = defineProps({
    props: {
      type: Object as PropType<{[key: string]: any}>
    }
  })
  const target = ref(null);

  onMounted(() => {
    if (!target.value) {
      return;
    }

    const div = document.createElement('div');
    div.classList.add(
      ...background.container.split(" "),
      ...border.item.split(" "),
      ...shadow.card.split(" "),
      ...transition.split(" "),
      ...typography.normal.split(" "),
      'rounded',
      'text-xs'
    )

    const ul = document.createElement('ul');
    div.appendChild(ul);
    Object.entries(props.props).forEach(([key, value]) => {
      const li = document.createElement('li');
      if (Array.isArray(value)) {
        li.innerHTML = `<span class="capitalize font-semibold">${key}: [</span>`;
        value.forEach((v: string) => {
          const span = document.createElement('span');
          li.classList.add('flex', 'flex-col');
          span.classList.add('ml-4');
          span.innerHTML = v;
          li.appendChild(span);
        })
        li.innerHTML += `<span>]</span>`;
      } else {        
        li.innerHTML = `<span class="capitalize font-semibold">${key}: </span><span>${value}</span>`;
      }
      li.classList.add(
        ...background.item.split(" "),
        ...hover.item.split(" "),
        'm-2',
        'p-2',
        'rounded',
        'cursor-pointer'
      )
      ul.appendChild(li);
    })

    tippy(target.value, {
      content: div,
      placement: "bottom",
      animation: "fade",
      duration: [0, 0],
      delay: [0, 0],
      interactive: true,
    })
  })
</script>

<template>
  <div ref="target">
    <slot></slot>
  </div>  
</template>
