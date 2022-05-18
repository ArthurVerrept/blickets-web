<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onBeforeMount } from 'vue'
import axios from 'axios'

const route = useRoute();
const emit = defineEmits(['reload'])
onBeforeMount(async () => {
  console.log('nce only')
  let res = await axios.post("https://gateway-3jjrtrh3ha-ew.a.run.app/user/google-login", {code: route.query.code})
  console.log(res.data.accessToken)
  localStorage.setItem('accessToken', res.data.accessToken)
  localStorage.setItem('refreshToken', res.data.refreshToken)
  emit('reload', res.data.addresses)
})

</script>

<template>
  <div></div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
