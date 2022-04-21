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
      <nav class="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-800">
        <div class="container flex flex-wrap justify-between items-center mx-auto">
          <a href="http://localhost:8080" class="flex items-center">
              <p class="font-['Shrikhand'] text-[#E43C4A] font-bold text-4xl text-center py-5">Blickets</p>
          </a>
          <div class="hidden w-full md:block md:w-auto" id="mobile-menu">
            <ul class="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              <li>
                <RouterLink to="/" class="block py-2 pr-4 pl-3 text-stone-800 bg-blue-700 rounded bg-transparent md:p-0 dark:text-white">Dashboard</RouterLink>
              </li>
              <li>
                <RouterLink to="/analytics" class="block py-2 pr-4 pl-3 text-stone-800 bg-blue-700 rounded bg-transparent md:p-0 dark:text-white">Analytics</RouterLink>
              </li>
              <li>
                <RouterLink to="/view-events" class="block py-2 pr-4 pl-3 text-stone-800 bg-blue-700 rounded bg-transparent md:p-0 dark:text-white">What's On</RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <RouterView :address="address" :tokens="{accessToken, refreshToken}" />
    </header>

    
  </div>
  <div v-else>
    <RouterView  @updateAddress="updateAddress" :address="address" @reload="reload"/>
  </div>
</template>

