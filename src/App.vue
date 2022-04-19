<script setup lang="ts">
import { onMounted, ref } from 'vue'
import router from './router'
import request from './helpers/request'
const address = ref('')

let accessToken = ref<string | null>()
// let accessToken = localStorage.getItem('accessToken')
let refreshToken = ref<string | null>()
// let refreshToken = localStorage.getItem('refreshToken')
let gotAuthCode: string | null = 'false'

async function load() {
  gotAuthCode = localStorage.getItem('gotAuthCode')
  if (gotAuthCode !== 'true') {
      router.replace('/sign-in')
  } 

  accessToken.value = localStorage.getItem('accessToken')
  refreshToken.value = localStorage.getItem('refreshToken')
  if (localStorage.getItem('accessToken') && localStorage.getItem('refreshToken') && address.value === '') {
    router.replace('/metamask')
  }
   
  // TODO: handle someone exiting google sign in and coming back to site
}


onMounted(async () => {
  load()
})


function updateAddress(acc: string){
  address.value = acc
  router.replace('/')
}

function reload(){
  load()
}

</script>

<template>
  <div v-if="address !== '' && (accessToken && refreshToken)">
    <header>
      <nav>
          <div class="wrapper mb-4">
              <RouterLink class="mx-3" to="/">Dashboard</RouterLink>
              <RouterLink class="mx-3" to="/Analytics">Analytics</RouterLink>
          </div>
      </nav>
      <RouterView :address="address" :tokens="{accessToken, refreshToken}" />
    </header>

    
  </div>
  <div v-else>
    <RouterView  @updateAddress="updateAddress" :address="address" @reload="reload"/>
  </div>
</template>

