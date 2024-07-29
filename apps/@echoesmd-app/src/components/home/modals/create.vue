<script setup lang="ts">
  import { computed, ref } from 'vue';
  import EchoesModel from '../../ui/modal.vue';
  import { EchoesUiContainer, EchoesUiButton, background, border } from '@echoesmd/ui';
  import { Vault } from '../../../types';
  import { useEchoesStore } from '../../../store/echoes';
import { useRouter } from 'vue-router';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    }
  })
  const modelValue = computed({
    get: () => props.modelValue,
    set: (value: boolean) => {
      emits('update:modelValue', value)
    }
  })
  const emits = defineEmits(['update:modelValue'])
  const echoes = useEchoesStore();
  const router = useRouter();

  const name = ref('');
  const url = ref('');
  const token = ref('');
  const collaboration = ref(false);
  const selfHosted = ref(true);
  const password = ref('');

  const handleSubmit = () => {
    if (collaboration.value) {
      console.log('Collaboration enabled');
      // If we are selfhosting we need to validate password and url
      // If we arent selfhosting we need to validate password and token

      if (selfHosted.value && (!url.value || !password.value)) {
        console.log("Password or url missing")
        return;
      } else if (!selfHosted.value && (!token.value || !password.value)) {
        console.log("Password or token missing")
        return;
      }
    };
    const vault = echoes.createVault({
      name: name.value,
      url: url.value,
      token: token.value,
      collaboration: false,
    });
    echoes.setOptions({
      ...echoes.getOptions,
      openVault: vault.id,
    });
    router.push(`/${vault.id}`);
  }

  const handleCancel = () => {
    name.value = '';
    url.value = '';
    token.value = '';
    password.value = '';
    collaboration.value = false;
    selfHosted.value = true;
    emits('update:modelValue', false);
  }
</script>

<template>
  <echoes-model v-model="modelValue">
    <echoes-ui-container size="lg" class="p-4 rounded-lg">
      <h1 class="text-lg">Create Vault</h1>
      <form @submit.prevent.stop=handleSubmit class="text-sm flex flex-col gap-y-2 select-none pt-1">
        <input class="p-2 rounded test-xs outline-none" :class="[border.item, background.container]" type="text" placeholder="Vault name" v-model="name" />
        <!-- <div class="flex flex-col gap-y-2">
          <div class="flex flex-col gap-y-2">
            <div class="flex">
              <div class="flex items-center w-full gap-x-1 p-1 px-2 text-neutral-500 opacity-50">
                <input :class="border.item" type="checkbox" id="collaboration" disabled v-model="collaboration" />
                <label for="collaboration">Collaboration</label>
              </div>
              <div class="flex items-center w-full gap-x-1 p-1 px-2" :class="{'text-neutral-500 opacity-50': !collaboration}">
                <input :disabled="!collaboration" :class="border.item" type="checkbox" id="self-hosted" v-model="selfHosted" />
                <label for="self-hosted">Self hosted</label>
              </div>
            </div>
            <div v-if="selfHosted" class="flex flex-col" :class="{'text-neutral-500 opacity-50': !collaboration}">
              <input class="p-2 rounded test-xs outline-none" :disabled="!collaboration" :class="[border.item, background.container]" type="text" placeholder="Url" v-model="url" />
            </div>
            <div v-else class="flex flex-col" :class="{'text-neutral-500 opacity-50': !collaboration}">
              <input class="p-2 rounded test-xs outline-none" :disabled="!collaboration" :class="[border.item, background.container]" type="text" placeholder="Token" v-model="token" />
            </div>
            <div class="flex flex-col" :class="{'text-neutral-500 opacity-50': !collaboration}">
              <input class="p-2 rounded test-xs outline-none" type="password" :disabled="!collaboration" :class="[border.item, background.container]" placeholder="Password" v-model="password" />
            </div>
          </div>
        </div> -->
        <div class="flex gap-x-2">
          <echoes-ui-button class="w-full" size="small" @click="handleCancel">Cancel</echoes-ui-button>
          <echoes-ui-button class="w-full" size="small" type="submit" primary>Create</echoes-ui-button>
        </div>
      </form>
    </echoes-ui-container>
  </echoes-model>
</template>
