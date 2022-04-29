<script setup lang="ts">
import { defineEmits, onBeforeMount, defineProps, ref } from 'vue'

let user = ref<any>()
let userLoading = ref<any>(true)

const emit = defineEmits(['updateAddress'])
const props = defineProps(['addresses', 'request'])

onBeforeMount(async () => {
  user.value = await props.request.get('/user/me')
  userLoading.value = false
  const account = await getAndUpdateAccount()
  emit('updateAddress', account)
})

async function openMeta() {
    const account = await getAndUpdateAccount()
    emit('updateAddress', account)
}

async function getAndUpdateAccount() {
  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
 
  return account
}
</script>

<template>
  <main>
    <div class="mx-48 mt-12">
      <div class="flex justify-evenly border-[#E43C4A]">
        <div class="flex">
          <svg
          width="18"
          height="18"
          viewBox="0 0 58 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="29"
            cy="29"
            r="29"
            fill="#E43C4A"
            fill-opacity="0.5"
          />
          <circle
            cx="29"
            cy="29"
            r="17"
            fill="#E43C4A"
          />
        </svg>
          <p class="text-sm ml-2">Step 1:</p>
          <h1 class="text-sm pb-4 ml-2 bod">
            Log in with Google
          </h1>
        </div>
        <div class="flex">
          <svg
            class="fill-[#E43C4A] animate-ping mt-1 mr-1"
            width="11"
            height="11"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="17"
              cy="17"
              r="17"
            />
          </svg>

          <p class="text-sm ml-2">Step 2:</p>
          <h1 class="text-sm pb-4 ml-2 bod">
            Link metamask
          </h1>
        </div>
      </div>
    </div>
    <div class="flex justify-center">
      <div class="flex flex-col">
        <p class="font-['Shrikhand'] text-[#E43C4A] font-bold text-7xl mb-10 text-center pt-20">Blickets</p>
        <div class="mb-10 flex justify-center">
          <div v-if="!userLoading">
            <img class="w-16 h-16 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500" :src="user.picture" alt="Bordered avatar">
          </div>
          <div v-else>
            <svg class="w-16 h-16 p-1 rounded-full ring-2 fill-gray-400 ring-gray-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
          </div>
          <svg class="w-10 h-10 mt-3 mx-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          <img src="../../assets/eth-glyph-colored.png" class="h-16" alt="ethereum logo">
        </div>
          <p class="font-['Montserrat'] text-3xl font-bold mb-8 text-center ">Connect with metamask to move on</p>
          <p class="font-['Montserrat'] text-md text-center max-w-2xl text-center">By connecting with metamask you link your address to this account, an ethereum address is required to buy tickets, check in to events, and more.</p>
          <div class="w-full flex justify-center my-5">
            <a href="https://codehs.com/tutorial/jkeesh/how-to-set-up-an-ethereum-wallet-on-metamask" target="blank"><button type="button" class="py-2.5 px-5 w-42 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white border border-gray-200 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">How to setup metamask</button></a>
          </div>
        <!-- <div class="flex">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          <a href="https://codehs.com/tutorial/jkeesh/how-to-set-up-an-ethereum-wallet-on-metamask" class="text-center mb-12">how to setup metamask</a>
        </div> -->
        <div class="flex justify-center">
          <button @click="openMeta()" class="cursor-pointer bg-[#E43C4A] flex p-5"> 
            
            <p class="flex flex-col justify-center text-2xl font-bold text-white ml-2">open metamask</p>
            
          </button>
        </div>
      </div>
    </div>
    <div class="flex text-sm justify-center">
      <div class="mt-12">
        <p class="flex flex-col justify-center">powered by metamask</p>
      </div>    
    </div>
    <div class="flex justify-center">
      <div class="mt-3">
        <svg class="flex flex-col justify-center" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 212 189"><g fill="none" fill-rule="evenodd"><polygon fill="#CDBDB2" points="60.75 173.25 88.313 180.563 88.313 171 90.563 168.75 106.313 168.75 106.313 180 106.313 187.875 89.438 187.875 68.625 178.875"/><polygon fill="#CDBDB2" points="105.75 173.25 132.75 180.563 132.75 171 135 168.75 150.75 168.75 150.75 180 150.75 187.875 133.875 187.875 113.063 178.875" transform="matrix(-1 0 0 1 256.5 0)"/><polygon fill="#393939" points="90.563 152.438 88.313 171 91.125 168.75 120.375 168.75 123.75 171 121.5 152.438 117 149.625 94.5 150.188"/><polygon fill="#F89C35" points="75.375 27 88.875 58.5 95.063 150.188 117 150.188 123.75 58.5 136.125 27"/><polygon fill="#F89D35" points="16.313 96.188 .563 141.75 39.938 139.5 65.25 139.5 65.25 119.813 64.125 79.313 58.5 83.813"/><polygon fill="#D87C30" points="46.125 101.25 92.25 102.375 87.188 126 65.25 120.375"/><polygon fill="#EA8D3A" points="46.125 101.813 65.25 119.813 65.25 137.813"/><polygon fill="#F89D35" points="65.25 120.375 87.75 126 95.063 150.188 90 153 65.25 138.375"/><polygon fill="#EB8F35" points="65.25 138.375 60.75 173.25 90.563 152.438"/><polygon fill="#EA8E3A" points="92.25 102.375 95.063 150.188 86.625 125.719"/><polygon fill="#D87C30" points="39.375 138.938 65.25 138.375 60.75 173.25"/><polygon fill="#EB8F35" points="12.938 188.438 60.75 173.25 39.375 138.938 .563 141.75"/><polygon fill="#E8821E" points="88.875 58.5 64.688 78.75 46.125 101.25 92.25 102.938"/><polygon fill="#DFCEC3" points="60.75 173.25 90.563 152.438 88.313 170.438 88.313 180.563 68.063 176.625"/><polygon fill="#DFCEC3" points="121.5 173.25 150.75 152.438 148.5 170.438 148.5 180.563 128.25 176.625" transform="matrix(-1 0 0 1 272.25 0)"/><polygon fill="#393939" points="70.313 112.5 64.125 125.438 86.063 119.813" transform="matrix(-1 0 0 1 150.188 0)"/><polygon fill="#E88F35" points="12.375 .563 88.875 58.5 75.938 27"/><path fill="#8E5A30" d="M12.3750002,0.562500008 L2.25000003,31.5000005 L7.87500012,65.250001 L3.93750006,67.500001 L9.56250014,72.5625 L5.06250008,76.5000011 L11.25,82.1250012 L7.31250011,85.5000013 L16.3125002,96.7500014 L58.5000009,83.8125012 C79.1250012,67.3125004 89.2500013,58.8750003 88.8750013,58.5000009 C88.5000013,58.1250009 63.0000009,38.8125006 12.3750002,0.562500008 Z"/><g transform="matrix(-1 0 0 1 211.5 0)"><polygon fill="#F89D35" points="16.313 96.188 .563 141.75 39.938 139.5 65.25 139.5 65.25 119.813 64.125 79.313 58.5 83.813"/><polygon fill="#D87C30" points="46.125 101.25 92.25 102.375 87.188 126 65.25 120.375"/><polygon fill="#EA8D3A" points="46.125 101.813 65.25 119.813 65.25 137.813"/><polygon fill="#F89D35" points="65.25 120.375 87.75 126 95.063 150.188 90 153 65.25 138.375"/><polygon fill="#EB8F35" points="65.25 138.375 60.75 173.25 90 153"/><polygon fill="#EA8E3A" points="92.25 102.375 95.063 150.188 86.625 125.719"/><polygon fill="#D87C30" points="39.375 138.938 65.25 138.375 60.75 173.25"/><polygon fill="#EB8F35" points="12.938 188.438 60.75 173.25 39.375 138.938 .563 141.75"/><polygon fill="#E8821E" points="88.875 58.5 64.688 78.75 46.125 101.25 92.25 102.938"/><polygon fill="#393939" points="70.313 112.5 64.125 125.438 86.063 119.813" transform="matrix(-1 0 0 1 150.188 0)"/><polygon fill="#E88F35" points="12.375 .563 88.875 58.5 75.938 27"/><path fill="#8E5A30" d="M12.3750002,0.562500008 L2.25000003,31.5000005 L7.87500012,65.250001 L3.93750006,67.500001 L9.56250014,72.5625 L5.06250008,76.5000011 L11.25,82.1250012 L7.31250011,85.5000013 L16.3125002,96.7500014 L58.5000009,83.8125012 C79.1250012,67.3125004 89.2500013,58.8750003 88.8750013,58.5000009 C88.5000013,58.1250009 63.0000009,38.8125006 12.3750002,0.562500008 Z"/></g></g></svg>
      </div>    
    </div>
  </main>
  
</template>