<script setup lang="ts">
import { onBeforeMount } from '@vue/runtime-core';
import axios from 'axios'
import { ref } from 'vue';
import request from '../helpers/request';

let ticketPrice: number
const ticketPriceEth = ref('')
let ticketResalePrice: number
const ticketResalePriceEth = ref('')

let ticketAmount: number
let symbol: string
let name: string
let eventDate: string
let eventTime: string

const rate = ref('')
const file = ref<any>(null)
const myEvents = ref<any>([])
const checkStatusLoading = ref(false)
const createEventLoading = ref(false)

const props = defineProps([
  'address',
  'tokens'
])

const coinApiKey = '46E55189-120B-4E56-983F-F59E6B027F20'

onBeforeMount(async () => {
  const priceRes = await request.get('/blockchain/eth-price')
  rate.value = priceRes.ethPriceUSD
  myEvents.value = await request.get('/event/my-created-events')
})

function getTicketEthAmount(ticketPrice: number) {
  ticketPriceEth.value = (ticketPrice / parseInt(rate.value)).toFixed(9).toString()
}


function getResaleEthAmount(ticketPrice: number) {
  ticketResalePriceEth.value = (ticketPrice / parseInt(rate.value)).toFixed(9).toString()
}

async function submitEvent(name: string, symbol: string, ticketAmount: number, ticketPrice: number, resaleCost: number, date: string, time: string) {
  createEventLoading.value = true

  let formData = new FormData();
  formData.append('file', file.value.files[0])

  const imgInfo = await request.post('/blockchain/upload-image', formData)

  if(imgInfo.imageUrl) {
    const params = await request.post('/blockchain/event-deploy-parameters', { 
      name, 
      symbol, 
      ticketAmount, 
      ticketPrice, 
      resaleCost 
    })

    const transactionParameters = {
      ...params,
      from: props.address
    }

    const txHash = `await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });`

    const eventParams = {
      txHash,
      // here change this to be the image url from the metadata
      imageUrl: imgInfo.imageUrl,
      eventDate: new Date(date + ' ' + time + ':00').getTime().toString(),
      eventName: name,
      symbol
    }

    console.log(eventParams)
    
    await request.post('/event/create-event', eventParams)

    myEvents.value = await request.get('/event/my-created-events')
  }
  createEventLoading.value = false
}

async function checkStatus(txHash: string) {
  checkStatusLoading.value = true
  await request.post('/blockchain/transaction-status', {txHash})
  checkStatusLoading.value = false
  myEvents.value = await request.get('/event/my-created-events')
}

function getColor(eventStatus: string) {
  console.log(eventStatus)
  let color = 'bg-gradient-to-r from-orange-300 to-amber-300'
  if(eventStatus === 'success') {
    color = 'bg-gradient-to-r bg-green-300  bg-lime-300'
  } 
  if (eventStatus === 'failed') {
    color = 'bg-gradient-to-r bg-red-300 bg-rose-300'
  }
  return color + ' p-5 relative'
}

</script>

<template>
  <main>   
    <div class="px-24">
      <div class="flex justify-evenly">
        <div class="w-1/3 pr-12">
          <h1 class="text-4xl text-gray-900 my-4">Create event</h1>
          <form>
            <label class="block mb-2 text-sm font-medium text-gray-900" for="user_avatar">Upload Ticket Image</label>
            <input class="block w-full text-sm text-gray-900 bg-stone-200  cursor-pointer focus:outline-none focus:border-transparent" aria-describedby="user_avatar_help" id="user_avatar" type="file" enctype="multipart/form-data" ref="file" accept="image/jpeg, image/png, image/gif" name="img">
            <div class="mt-1 text-sm text-gray-500 mb-6" id="user_avatar_help">350px x 350px recommended</div>

            <div class="mb-6">
              <label for="text" class="block mb-2 text-sm font-medium text-gray-900">Event Name</label>
              <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  focus:ring-stone-700 block w-full p-2.5" placeholder="Boomtown Chapter 13 - 2022" v-model="name" required>
            </div>
            <div class="mb-6">
              <label for="text" class="block mb-2 text-sm font-medium text-gray-900">Event Symbol</label>
              <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  focus:ring-stone-700 block w-full p-2.5"  placeholder="BOOM" v-model="symbol" required>
            </div>
            <div class="mb-6">
              <label for="text" class="block mb-2 text-sm font-medium text-gray-900">Ticket Amount</label>
              <input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  focus:ring-stone-700 block w-full p-2.5"  placeholder="1000" v-model="ticketAmount" required>
            </div>


            <div class="grid xl:grid-cols-2 xl:gap-6">
              <div class="mb-6">
                <label for="number" class="block mb-2 text-sm font-medium text-gray-900">Ticket Price £</label>
                <input type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  focus:ring-stone-700 block w-full p-2.5"  placeholder="250" v-model="ticketPrice" @keyup="getTicketEthAmount(ticketPrice)" required>
              </div>
              <div class="mb-6">
                <label for="number" class="block mb-2 text-sm font-small text-gray-900">Ethereum</label>
                <input type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  pointer-events-none disabled block w-full p-2.5"  :value="ticketPriceEth" required>
              </div>
            </div>

            <div class="grid xl:grid-cols-2 xl:gap-6">
              <div class="mb-6">
                <label for="number" class="block mb-2 text-sm font-medium text-gray-900">Resale Price</label>
                <input type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  focus:ring-stone-700 block w-full p-2.5"  placeholder="300" v-model="ticketResalePrice" @keyup="getResaleEthAmount(ticketResalePrice)" required>
              </div>
              <div class="">
                <label for="number" class="block mb-2 text-sm font-small text-gray-900 mt-7"/>
                <input type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  pointer-events-none disabled block w-full p-2.5"  :value="ticketResalePriceEth" required>
              </div>
            </div>

            <div class="grid xl:grid-cols-2 xl:gap-6">
                <div>
                  <label for="number" class="block mb-2 text-sm font-medium text-gray-900">Date</label>
                  <input type="date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  focus:ring-stone-700 block w-full p-2.5"  v-model="eventDate" required>
                </div>
                <div class="mb-6">
                  <label for="number" class="block mb-2 text-sm font-medium text-gray-900">Time</label>
                  <input type="time" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm  focus:ring-stone-700 block w-full p-2.5"  v-model="eventTime" required>
                </div>
            </div>
            <div v-if="!createEventLoading" class="grid xl:grid-cols-2 xl:gap-6">
              <a @click="submitEvent(name, symbol, ticketAmount, ticketPriceEth, ticketResalePriceEth, eventDate, eventTime)" class="inline-flex w-full justify-center items-center py-2 px-3 text-sm font-medium text-center text-white bg-stone-800 hover:bg-stone-900 focus:outline-none cursor-pointer">
                Create Event
                <svg class="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </a>
            </div>
            <div v-else class="grid xl:grid-cols-2 xl:gap-6">
              <a class="inline-flex w-full justify-center items-center py-2 px-3 text-sm font-medium text-center text-white bg-stone-800 focus:outline-none cursor-default">
                Loading...
                <svg class="ml-2 -mr-1 w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </a>
            </div>
          </form>
        </div>
        
      
        <div class="w-2/3">
          <h1 class="text-4xl my-4 text-gray-900">My events</h1>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="event in myEvents.events" class="my-2">
              <div class="max-w-sm bg-white  border border-gray-200">
                <img :src="event.imageUrl" alt="" />
                <div class="p-5">
                  <h5 class="text-xl truncate font-bold tracking-tight text-stone-800">{{event.eventName}}</h5>
                  <h5 class="mb-2 text-md truncate font-bold tracking-tight text-stone-800">({{event.symbol}})</h5>
                  <p class="mb-3 font-normal text-stone-800 truncate">Contract Address: {{event.contractAddress}}</p>
                  <p class="mb-3 font-normal text-stone-800 truncate">Deployed Status: <b>{{event.deployedStatus}}</b></p>
                  <p class="mb-3 font-normal text-stone-800 truncate">Event Date: {{ new Date(parseInt(event.eventDate)).getDate() }} {{ new Date(parseInt(event.eventDate)).toLocaleString('default', { month: 'short' }) }} {{ new Date(parseInt(event.eventDate)).getFullYear() }}</p>
                  <p class="mb-3 font-normal text-stone-800 truncate">Start Time: {{ new Date(parseInt(event.eventDate)).toLocaleTimeString() }} </p>
                  
                  <div v-if="checkStatusLoading && event.deployedStatus !== 'success'">
                    <a class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-stone-800 cursor-default">
                      Loading...
                      <svg class="ml-2 -mr-1 w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </a>
                  </div>
                  <div v-if="!checkStatusLoading && event.deployedStatus === 'pending'">
                    <a @click="checkStatus(event.txHash)" class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-stone-800 hover:bg-stone-900 cursor-pointer">
                      Refresh Status
                      <svg class="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </a>
                  </div>
                  <div v-if="event.deployedStatus === 'success'">
                    <a class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-stone-800 hover:bg-stone-900 focus:outline-none cursor-pointer">
                      View Event
                      <svg class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
