<script setup lang="ts">
  import UiContainer from './components/container/index.vue';
  import UiButton from './components/button.vue';
  import UiHeader from './components/header.vue';
  import UiTemplateSink from './components/templates/sink.vue';
  import UiList from './components/list/index.vue';
  import UiListItem from './components/list/item.vue';
  import { typography } from './variables';

  const toggleTheme = () => {
    const html = document.querySelector('html');
    html?.classList.toggle('dark');
    if (html?.classList.contains('dark')) {
      
    } else {

    }
  }

  const components: {
    title: string,
    props: string[],
    components: {
      component: any,
      props: {[key: string]: any}
      excludeSlot?: boolean,
    }[]
  }[] = [
    {
      title: "Buttons",
      components: [
        {
          component: UiButton,
          props: {
            hover: false,
            background: false,
          }
        },
        {
          component: UiButton,
          props: {
            hover: true,
            background: false,
          }
        },
        {
          component: UiButton,
          props: {
            hover: true,
            background: true,
          }
        },
        {
          component: UiButton,
          props: {
            hover: true,
            primary: true
          }
        },
        {
          component: UiButton,
          props: {
            hover: true,
            secondary: true,
          }
        },
      ],
      props: ['hover', 'background', 'primary', 'secondary']
    },
    {
      title: "Header",
      components: [
        {
          component: UiHeader,
          props: {}
        },
        {
          component: UiHeader,
          props: {
            shadow: true,
          }
        }
      ],
      props: [],
    },
    {
      title: "Container",
      components: [
        {
          component: UiContainer,
          props: {
            shadow: false,
            border: 'item',
          }
        },
        {
          component: UiContainer,
          props: {
            shadow: true,
            border: 'none',
          }
        },
        {
          component: UiContainer,
          props: {
            shadow: true,
            border: 'primary',
          }
        },
        {
          component: UiContainer,
          props: {
            shadow: true,
            border: 'secondary',
          }
        },
      ],
      props: ['shadow', 'border']
    },
    {
      title: "List",
      components: [
        {
          component: UiList,
          excludeSlot: true,
          props: {
            title: "List Title",
            children: [
              "List Item 1",
              "List Item 2",
              "List Item 3",
              "List Item 4",
              "List Item 5",
              "List Item 6",
            ]
          }
        },
        {
          component: UiList,
          excludeSlot: true,
          props: {
            subtitle: "List Subtitle",
            children: [
              "List Item 1",
              "List Item 2",
              "List Item 3",
              "List Item 4",
              "List Item 5",
              "List Item 6",
            ]
          }
        }
      ],
      props: ["title", "subtitle"]
    },
  ]
</script>

<template>
  <ui-container class="min-h-screen" :class="typography.normal">
    <ui-header class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">
        Echoes UI
      </h1>
      <ui-button @click="toggleTheme">
        <span class="block dark:hidden animate-[spin_500ms_ease]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd" />
          </svg>
        </span>
        <span class="hidden dark:block animate-[spin_500ms_ease]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z" />
          </svg>
        </span>
      </ui-button>
    </ui-header>
    <div>
      <ui-container border="item" v-for="(component, index) in components" class="m-4 p-2 rounded-lg">
        <h1 class="text-xl font-semibold ml-2">{{ component.title }}</h1>
        <ui-container class="flex gap-2 w-full justify-start p-2">
            <ui-template-sink v-for="(item, yIndex) in component.components" :props="item.props" class="w-full">
              <component :is="item.component" v-bind="item.props" :key="`component-${index}-${yIndex}`">
                <template v-if="!item.excludeSlot">
                  Hover for props
                </template>
              </component>
            </ui-template-sink>
        </ui-container>
      </ui-container>
      </div>
  </ui-container>
</template>
 