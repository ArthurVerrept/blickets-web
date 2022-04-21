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

const rate = ref('')
const file = ref<any>(null)
const myEvents = ref<any>([])
const checkStatusLoading = ref(false)

const props = defineProps([
  'address',
  'tokens'
])

const coinApiKey = '46E55189-120B-4E56-983F-F59E6B027F20'

onBeforeMount(async () => {
  try {
    let coin = await axios.get('https://rest.coinapi.io/v1/exchangerate/ETH/GBP', { headers:{'X-CoinAPI-Key': coinApiKey }})
    rate.value = coin.data.rate
  } catch (error) {
    rate.value = '2346.58'
  }
  myEvents.value = await request.get('/event/my-created-events')
})

function getTicketEthAmount(ticketPrice: number) {
  ticketPriceEth.value = (ticketPrice / parseInt(rate.value)).toString()
}


function getResaleEthAmount(ticketPrice: number) {
  ticketResalePriceEth.value = (ticketPrice / parseInt(rate.value)).toString()
}

async function submitEvent(name: string, symbol: string, ticketAmount: number, ticketPrice: number, resaleCost: number, date: string) {
  let formData = new FormData();
  formData.append('file', file.value.files[0])

  const imgInfo = await request.post('/blockchain/upload-image', formData)
  console.log('imginfo', imgInfo)
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

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionParameters],
  });

  const eventParams = {
    txHash,
    // here change this to be the image url from the metadata
    imageUrl: imgInfo.imageUrl,
    eventDate: new Date(date).getTime(),
    eventName: name,
    symbol
  }

  console.log(eventParams)
  
  await request.post('/event/create-event', eventParams)

  myEvents.value = await request.get('/event/my-created-events')

  // console.log(txHash)

  // post to event ms to create event with cid, txhash, userId, deployedStatus, createdTime, eventDate

  // upload image & data
  // back end will return the encoded data to send to contract to create event
  // when txn is returned then pay from metamask
  // if complete send complete to back end to keep status as "pending"
  // if any error in sending transaction send to back end to make status "failed"
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
    <div class="flex justify-evenly">
      <div class="ml-3 w-1/3">
        <h1 class="text-4xl my-4">Dashboard</h1>
        
        <h2 class="text-2xl my-4">Create Event: </h2>

        <div class="my-4">
              <!-- TODO: make sure image is a 2:1 ratio -->
          <h2 class="mb-2">Ticket Artwork: (350 x 350 recommended)</h2>
          <input type="file" enctype="multipart/form-data" ref="file" accept="image/jpeg, image/png, image/gif" id="img" name="img">
        </div>

        <div class="my-4">
          <h2 class="mb-2">Event Name: </h2>
          <input class="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Boomtown Chapter 13"  v-model="name">
        </div>

        <div class="my-4">
          <h2 class="mb-2">Event Symbol: </h2>
          <input class="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="BOOM"  v-model="symbol">
        </div>

        <div class="my-4">
          <h2 class="mb-2">Ticket Amount: </h2>
          <input class="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="number" placeholder="60000" v-model="ticketAmount">
        </div>

        <div class="my-4">
          <p>1 eth ~ £{{parseInt(rate)}}</p>
          <div class="flex">
            <div>
              <h2 class="mb-2">Ticket Price: </h2>
              <input class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="number" placeholder="£250" v-model="ticketPrice" @keyup="getTicketEthAmount(ticketPrice)">
            </div>
            <div>
              <h2 class="mb-2">in eth: </h2>
              <input class="shadow appearance-none border rounded pointer-events-none py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="number" :value="ticketPriceEth">
            </div>
          </div>
        </div>

        <div class="my-4">
          <div class="flex">
            <div>
              <!-- TODO: add tooltip explaining how the resale cost works -->
              <h2 class="mb-2">Resale Price: </h2>
              <input class="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="number" placeholder="£250" v-model="ticketResalePrice" @keyup="getResaleEthAmount(ticketResalePrice)">
            </div>
            <div>
              <h2 class="mb-2">in eth: </h2>
              <input class="shadow appearance-none border rounded pointer-events-none py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="number" :value="ticketResalePriceEth"/>
            </div>
          </div>
        </div>

        <div class="my-4">
          <h2 class="mb-2">Date: </h2>
          <input class="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="date" v-model="eventDate">
        </div>

        <div class="my-4">
          <button class="mb-2" @click="submitEvent(name, symbol, ticketAmount, ticketPriceEth, ticketResalePriceEth, eventDate)">Create Event: </button>
        </div>
        
      </div>
      <div class="w-2/3 p-10">
        <div v-for="event in myEvents.events" :class="getColor(event.deployedStatus)" class="flex mt-2 rounded-lg">
          <div class="w-1/6 overflow-hidden mx-4">
            <p class="w-24">{{event.eventName}} </p>
            <p class="truncate">({{event.symbol}})</p>
          </div>
          <div class="w-1/6 overflow-hidden mx-4">
            <p class="w-24">image url: </p>
            <p class="truncate"><a :href="`${event.imageUrl}`">{{event.imageUrl}}</a></p>
          </div>

          <div class="w-1/6 overflow-hidden mx-4">
            <p> Contract Address: </p>
            <p class="truncate">{{event.contractAddress}}</p>
          </div>

          <div class="w-1/6 mx-4 ">
            <p>Deployed Status:</p>
            <p><b>{{event.deployedStatus}}</b></p>
          </div>

          <div class="w-1/6 mx-4">
              <p>Event Date: </p>
              <p class="truncate">{{event.eventDate}}</p>
          </div>


          <div v-if="checkStatusLoading && event.deployedStatus !== 'success'">
              <button class="disabled pointer-events-none">Loading...</button>
            </div>
            <div v-if="!checkStatusLoading && event.deployedStatus === 'pending'">
              <button @click="checkStatus(event.txHash)">Refresh Status</button>
            </div>
            <div v-if="event.deployedStatus === 'success'">
              <p>info</p>
            </div>
        </div>
      </div>
    </div>
  </main>
</template>
