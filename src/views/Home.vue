<script setup lang="ts">
import { onBeforeMount } from '@vue/runtime-core';
import { ref } from 'vue';

const events = ref<any>([])
const eventsLoading = ref(true)

const myEvents = ref<any>([])
const myEventsLoading = ref(true)
const rate = ref('')
const ethPriceUSD = ref('0')

const props = defineProps([
  'address',
  'tokens',
  'request'
])

onBeforeMount(async () => {
  const priceRes = await props.request.get('/blockchain/eth-price')
  events.value = await getAllEvents()
  myEvents.value = await getMyEvents()
  ethPriceUSD.value = priceRes.ethPriceUSD
})

async function getAllEvents() {
  const res =  await props.request.get('/event/all-events')
  eventsLoading.value = false
  return res 
}

async function getMyEvents() {
  const res =  await props.request.get('/blockchain/my-events')
  myEventsLoading.value = false
  return res 
}

async function buyTicket(contractAddress: string) {
  const params = await  props.request.post('/blockchain/buy-tickets-params', {contractAddress, purchaseAmount: 1})
  console.log(params)
  const transactionParameters = {
      ...params,
      from: props.address
    }

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    console.log(txHash)
} 

function getPercetage(event: any) {
  return `width: ${(event.ticketIdCounter / event.ticketAmount) * 100}%`
}

</script>

<template>
  <main>  
    <div class="px-24 pb-24">
      <div class="flex justify-evenly">
        <div class="w-2/3 pr-4">
          <div class="px-6 pb-6 h-[40rem] overflow-auto bg-white border border-gray-200">

            <div class="sticky top-0 z-10 py-3 bg-white">
              <h1 class="text-4xl mt-4">Events</h1>
              <h1 class="text-sm">Upcoming</h1>
            </div>
            
            <div class="grid grid-cols-3 gap-2">
              <div v-if="!eventsLoading && events.events" v-for="event in events.events" class="my-2">
                <div class="relative bg-whites border">
                  <div class="w-full">
                    <img class="w-full h-full w-full md:rounded-none" :src="event.imageUrl" alt="">
                    <div class="px-4 col-span-2 bg-[]">
                      <div class="flex ">
                        <div class="flex flex-col mt-4 leading-normal justify-start">
                            <h5 class="text-xl font-bold tracking-tight text-stone-800">{{event.eventName}}</h5>
                            <h5 class="mb-2 text-md font-bold tracking-tight text-stone-800">({{event.symbol}})</h5>
                            <div class="flex">
                              <svg class="w-4 h-4 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              <p class="mb-1 font-normal text-stone-800">{{ new Date(parseInt(event.eventDate)).getDate() }} {{ new Date(parseInt(event.eventDate)).toLocaleString('default', { month: 'short' }) }} {{ new Date(parseInt(event.eventDate)).getFullYear() }}</p>
                            </div>
                            <div class="flex">
                              <svg class="w-4 h-4 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              <p class="mb-1 font-normal text-stone-800">{{ new Date(parseInt(event.eventDate)).toLocaleTimeString().split(':', 2)[0] }}:{{new Date(parseInt(event.eventDate)).toLocaleTimeString().split(':', 2)[1]}} </p>
                            </div>
                        </div>
                      </div>
                    <a @click="buyTicket(event.contractAddress)" class="mb-4 inline-flex items-center py-2 px-2 text-sm font-medium text-center text-white bg-stone-800 hover:bg-stone-900 cursor-pointer">
                        Buy Ticket
                        <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                      </a>
                    </div>
                  </div>
                  <div  class="border-b-2 w-full bg-gray-200 h-3 dark:bg-gray-700">
                    <div class="ml-px bg-[#E43C4A] h-3" :style="getPercetage(event)"></div>
                  </div>
                </div>
              </div>

              <div v-else-if="!eventsLoading && !events.events">
                <p>No events have been created.</p>
              </div>
            </div>
            <div v-if="eventsLoading" class="w-full flex justify-center">
              <svg  role="status" class="mr-2 mt-56 w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-[#E43C4A]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
            </div>
          </div>
        </div>


        <div class="block px-6 pb-6 w-1/3 bg-white border border-gray-200 h-[40rem] overflow-auto">

          <div class="sticky top-0 z-10 py-3 bg-white">
            <h1 class="text-4xl my-4">My Events</h1>
          </div>
          
          <div v-if="!myEventsLoading && myEvents.events" v-for="event in events.events" class="my-2">
            <div class="relative flex bg-whites border max-w-xl">
              <!-- <img class="w-full md:h-auto md:w-48 md:rounded-none" :src="event.imageUrl" alt="">
              <div class="ml-4 col-span-2 bg-[]">
                <div class="flex ">
                  <div class="flex flex-col mt-4 leading-normal justify-start">
                      <h5 class="text-xl truncate font-bold tracking-tight text-stone-800">{{event.eventName}}</h5>
                      <h5 class="mb-1 text-md truncate font-bold tracking-tight text-stone-800">{{event.symbol}}</h5>
                      <p class="mb-1 font-normal text-stone-800 truncate">Event Date: {{ new Date(parseInt(event.eventDate)).getDate() }} {{ new Date(parseInt(event.eventDate)).toLocaleString('default', { month: 'short' }) }} {{ new Date(parseInt(event.eventDate)).getFullYear() }}</p>
                      <p class="mb-1 font-normal text-stone-800 truncate">Start Time: {{ new Date(parseInt(event.eventDate)).toLocaleTimeString().split(':', 2)[0] }}:{{new Date(parseInt(event.eventDate)).toLocaleTimeString().split(':', 2)[1]}} </p>
                      <p>{{ event.ticketAmount }} Tickets</p>
                  </div>
                </div>
                <a @click="buyTicket(event.contractAddress)" class="absolute right-4 bottom-4 inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-stone-800 hover:bg-stone-900 cursor-pointer">
                  Buy Ticket
                  <svg class="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </a>
              </div>
            </div>
            <div data-tooltip-target="tooltip-default" class="border-b">
              <div  class="border-b-2 w-full bg-gray-200 h-3 dark:bg-gray-700">
                <div class="ml-px bg-[#E43C4A] h-3" :style="getPercetage(event)"></div>
              </div> -->
            </div>
          </div>
          <div v-else-if="!myEventsLoading && !myEvents.events" class="mt-56">
            <div>
              <p class="w-full text-center">You have not bought any event tickets.</p>
              <p class="w-full text-center">Buy some from the events window!</p>
            </div>
          </div>
          <div v-else class="w-full flex justify-center">
            <svg  role="status" class="mr-2 mt-56 w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-[#E43C4A]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
          </div>
        </div>
      </div> 
    </div>
  </main>
</template>
