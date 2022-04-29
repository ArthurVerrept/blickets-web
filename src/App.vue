<script setup lang="ts">
import { onMounted, ref } from 'vue'
import router from './router'
import Request from './helpers/request'
const address = ref('')

let request = ref()
let accessToken = ref<string | null>()
// let accessToken = localStorage.getItem('accessToken')
let refreshToken = ref<string | null>()

// let refreshToken = localStorage.getItem('refreshToken')
let gotAuthCode: string | null = 'false'

let errorState = ref(false)
const errorText = ref('Refresh the page and try again.')

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
  request.value = new Request(handleError)
  load()
})


function updateAddress(acc: string){
  address.value = acc
  router.replace('/view-events')
}

function handleError(error: any){
  console.log(error.message)
  errorText.value = error
  errorState.value = true
  setTimeout(() => {
    errorState.value = false
  },10000)
}

window.ethereum.on('accountsChanged', function (accounts: string[]) {
  address.value = accounts[0]
  // TODO: get events again
})

function reload(addresses: string[]){
  load()
}

</script>

<template>
  <div v-if="address !== '' && (accessToken && refreshToken)">
    <header>
      <nav class="bg-white py-2.5">
        <div class="flex flex-wrap justify-between items-center w-full px-24">
          <a href="http://localhost:8080" class="flex items-center">
              <p class="font-['Shrikhand'] text-[#E43C4A] font-bold text-4xl text-center py-5">Blickets</p>
          </a>
          <div class="hidden w-full md:block w-auto" id="mobile-menu">
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
              <li class="max-w-10">
                <span class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">{{address.substring(0, 4)}}...{{address.substring(39)}}</span>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  </div>
  <body class="relative">
    <RouterView @updateAddress="updateAddress" @errorPopup="handleError"  :request="request" :address="address" :tokens="{accessToken, refreshToken}"  @reload="reload" />
    <div v-if="errorState" class="sticky bottom-2 z-10 flex justify-center">
      <div class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
        <span class="font-medium">Error:</span> {{errorText.response.data.message}}
      </div>
    </div>
  </body>
</template>

