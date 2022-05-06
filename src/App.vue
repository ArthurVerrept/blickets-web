<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import router from './router'
import Request from './helpers/request'

const address = ref('')
const route = useRoute()
let request = ref()
let accessToken = ref<string | null>()
// let accessToken = localStorage.getItem('accessToken')
let refreshToken = ref<string | null>()
let hidden = ref( true )

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

watch(() => route.fullPath, async() => {
  const navLinks = document.querySelectorAll('.navText')
  navLinks.forEach((link) => {
    link.classList.remove(`font-['Shrikhand']`)
    link.classList.remove(`text-[#E43C4A]`)
  })
  console.log(navLinks)
  if(route.fullPath === '/') {
    document.querySelector('#homeNavText')?.classList.add(`font-['Shrikhand']`)
    document.querySelector('#homeNavText')?.classList.add(`text-[#E43C4A]`)
  }
  if(route.fullPath === '/account') {
    document.querySelector('#accountNavText')?.classList.add(`font-['Shrikhand']`)
    document.querySelector('#accountNavText')?.classList.add(`text-[#E43C4A]`)
  }

  if(route.fullPath === '/dashboard') {
    document.querySelector('#hostsNavText')?.classList.add(`font-['Shrikhand']`)
    document.querySelector('#hostsNavText')?.classList.add(`text-[#E43C4A]`)
    document.querySelector('#dashboardNavText')?.classList.add(`font-['Shrikhand']`)
    document.querySelector('#dashboardNavText')?.classList.add(`text-[#E43C4A]`)
  }

  //   if(route.fullPath === '/analytics') {
  //   document.querySelector('#hostsNavText')?.classList.add(`font-['Shrikhand']`)
  //   document.querySelector('#hostsNavText')?.classList.add(`text-[#E43C4A]`)
  //   document.querySelector('#analyticsNavText')?.classList.add(`font-['Shrikhand']`)
  //   document.querySelector('#analyticsNavText')?.classList.add(`text-[#E43C4A]`)
  // }
});

onMounted(async () => {
  request.value = new Request(handleError)
  load()
})


function updateAddress(acc: string){
  address.value = acc
  router.replace('/')
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
  console.log(accounts)
  if(!accounts.length) {
    router.replace('/metamask')
  }
  address.value = accounts[0]
  // TODO: get events again
})

function reload(addresses: string[]){
  load()
}

function showNav(){
  if(hidden.value) {
    document.getElementById('dropdown')?.classList.remove('hidden')
    hidden.value = false
  } else {
    document.getElementById('dropdown')?.classList.add('hidden')
    hidden.value = true
  }
  
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
                <RouterLink to="/" class="block homeNav py-2 pr-4 pl-3 text-stone-800 bg-blue-700 rounded bg-transparent md:p-0 dark:text-white"><p id="homeNavText" class="navText">Home</p></RouterLink>
              </li>
              <li>
                <RouterLink to="/account" id="account" class="block py-2 pr-4 pl-3 text-stone-800 bg-blue-700 rounded bg-transparent md:p-0 dark:text-white"><p id="accountNavText" class="navText">Account</p></RouterLink>
              </li>
              <li class="relative">
                <button @click="showNav" class="block text-sm font-medium text-stone-800 flex items-center"> <p id="hostsNavText" class="navText">Hosts</p><svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
                <div id="dropdown" class="z-20 absolute hidden bg-white divide-y divide-gray-100 right-[-40px] top-6 rounded shadow w-36 dark:bg-gray-700 dark:divide-gray-600">
                    <ul :class="`py-1 text-sm text-gray-700 dark:text-gray-400`" aria-labelledby="dropdownLargeButton">
                      <li>
                        <RouterLink @click="showNav" to="/dashboard" class="block px-4 py-2 text-stone-800 bg-blue-700 rounded bg-transparent"> <p id="dashboardNavText" class="navText">Dashboard</p></RouterLink>
                      </li>
                      <!-- <li>
                        <RouterLink @click="showNav" to="/analytics" class="block px-4 py-2 text-stone-800 bg-blue-700 rounded bg-transparent"> <p id="analyticsNavText" class="navText">Analytics</p></RouterLink>
                      </li> -->

                    </ul>
                    <div class="py-1">
                      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white">Sign out</a>
                    </div>
                </div>
              </li>
              <li>
                
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
  <body class="relative mainBody">
    <RouterView @updateAddress="updateAddress" @errorPopup="handleError"  :request="request" :address="address" :tokens="{accessToken, refreshToken}"  @reload="reload" />
    <div v-if="errorState" class="sticky bottom-2 z-10 flex justify-center">
      <div class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
        <span class="font-medium">Error:</span> {{errorText.response.data.message}}
      </div>
    </div>
  </body>
</template>

<style scoped>
.mainBody::-webkit-scrollbar {
  display: none;
}
</style>