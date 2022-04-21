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

function getImageUrl(event){
  return `background-image: url(${event.imageUrl})`
}

</script>

<template>
  <main>   
    <div class="">
      <div class="ml-3 w-1/3">
        <h1 class="text-4xl my-4">Events</h1>
        
      </div>
    </div> 
  </main>
</template>
