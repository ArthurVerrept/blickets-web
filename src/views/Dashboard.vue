<script setup lang="ts">
import { onBeforeMount } from '@vue/runtime-core';
import axios from 'axios'
import { ref } from 'vue';

let ticketPrice: number
const ticketPriceEth = ref('')
let ticketResalePrice: number
const ticketResalePriceEth = ref('')

let ticketAmount: number
let eventName: string
let brandName: string
let eventDate: string

const rate = ref('')
const file = ref<any>(null)

const props = defineProps([
  'address',
  'tokens'
])

const coinApiKey = '46E55189-120B-4E56-983F-F59E6B027F20'

onBeforeMount(async () => {
  console.log('asdasda')
  try {
    let coin = await axios.get('https://rest.coinapi.io/v1/exchangerate/ETH/GBP', { headers:{'X-CoinAPI-Key': coinApiKey }})
    rate.value = coin.data.rate
  } catch (error) {
    rate.value = '2346.58'
  }
})

function getTicketEthAmount(ticketPrice: number) {
  ticketPriceEth.value = (ticketPrice / parseInt(rate.value)).toString()
}


function getResaleEthAmount(ticketPrice: number) {
  ticketResalePriceEth.value = (ticketPrice / parseInt(rate.value)).toString()
}

async function submitEvent(name: string, eventName: string, ticketAmount: number, ticketPrice: number, resaleCost: number, date: string) {
    console.log(name, eventName, ticketAmount, ticketPrice, resaleCost, date)
    let formData = new FormData();
    formData.append('file', file.value.files[0])

    
    // const imgInfo = await axios.post('http://localhost:3000/blockchain/upload-image', formData)
    
    const params = await axios.post('http://localhost:3000/blockchain/event-deploy-parameters', { 
      file: {
        cid: 'bafyreigfkbbcwihrtcq3bc2ny3m53zotqjdlnogw7j2goqpte4fqkt76bq',
        url: 'ipfs://bafyreigfkbbcwihrtcq3bc2ny3m53zotqjdlnogw7j2goqpte4fqkt76bq/metadata.json'
      },
      name, eventName, ticketAmount, ticketPrice, resaleCost, date 
    })

  
  const transactionParameters = {
    ...params.data,
    from: props.address
  }

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionParameters],
  });
  console.log(txHash)
    // upload image & data
    // back end will return the encoded data to send to contract to create event
    // when txn is returned then pay from metamask
    // if complete send complete to back end to keep status as "pending"
    // if any error in sending transaction send to back end to make status "failed"
}

</script>

<template>
  <main>   
    <div class="ml-3">
      <h1 class="text-4xl my-4">Dashboard</h1>
      
      <h2 class="text-2xl my-4">Create Event: </h2>

      <div class="my-4">
            <!-- TODO: make sure image is a 2:1 ratio -->
        <h2 class="mb-2">Ticket Artwork: (2000 x 1000 px only)</h2>
        <input type="file" enctype="multipart/form-data" ref="file" accept="image/jpeg, image/png, image/gif" id="img" name="img">
      </div>

      <div class="my-4">
        <h2 class="mb-2">Event Company Name: </h2>
        <input class="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Boomtown"  v-model="name">
      </div>

      <div class="my-4">
        <h2 class="mb-2">Event Name: </h2>
        <input class="shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Chapter 8"  v-model="eventName">
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
        <button class="mb-2" @click="submitEvent(name, eventName, ticketAmount, ticketPriceEth, ticketResalePriceEth, eventDate)">Create Event: </button>
      </div>
      
    </div>
  </main>
</template>
