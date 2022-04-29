<script setup lang="ts">
import axios from 'axios'
import { onBeforeMount } from 'vue'

const emit = defineEmits(['setTokens'])

onBeforeMount(async () => {
  localStorage.setItem('gotAuthCode', 'false')
})

async function getUrl() {
  let res = await axios.get("http://localhost:3000/user/auth-url")
  console.log(res.data)
  localStorage.setItem('gotAuthCode', 'true')
  window.location.replace(res.data.url)
} 
</script>

<template>
  <main>
    <div class="mx-48 mt-12">
      <div class="flex justify-evenly border-[#E43C4A]">
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

          <p class="text-sm ml-2">Step 1:</p>
          <h1 class="text-sm pb-4 ml-2 bod">
            Log in with Google
          </h1>
        </div>
        
        <div class="flex">
          <svg
            class="fill-neutral-300 mt-1.5 mr-1"
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

          <p class="text-sm ml-2 text-neutral-500">Step 2:</p>
          <h1 class="text-sm pb-4 ml-2 text-neutral-500">
            Link Metamask
          </h1>
        </div>
      </div>
    </div>
     <p class="font-['Shrikhand'] text-[#E43C4A] font-bold text-7xl text-center pt-20">Blickets</p>
     <p class="text-center mt-10 text-lg font-bold">Why do you need to create a Blickets account?</p>
     <div class="w-full flex justify-center">
      <p class=" mt-3 text-lg font-normal max-w-2xl text-center">By creating an account we can link tickets on the blockchain tickets to you. On the next step you connect a wallet to your account, If you wish for your wallet to <b>remain anonymous</b>, it is recommended to setup a new wallet</p>
     </div>
     <div class="flex justify-center mt-12">
      <button @click="getUrl" class="cursor-pointer bg-[#E43C4A] flex p-5">  
        <img src="../../assets/google.png" alt="google icon" class="w-10">
        <p class="text-2xl mt-1 font-bold text-white ml-2">sign in with google</p>
      </button>
    </div>
  </main>
</template>
