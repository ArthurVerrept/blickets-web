<script setup lang="ts">
import { onMounted } from '@vue/runtime-core';
import { ref, watch } from 'vue';
import QRious from 'qrious'

const qrCode = new QRious({ size: 300 })

const events = ref<any>([])
const user = ref<any>([])
const masterKey = ref<any>()
const myInterval = ref<any>()
const qrCodeVar = ref<any>()
const qrLoading = ref(true)
const qrReloading = ref(false)
const eventsLoading = ref(true)
const qrCodeTimeLeft = ref(100)
const toggleViewTicket = ref(false)

const myTickets = ref<any>([])
const currentTicket = ref<any>()
const myTicketsLoading = ref(true)
const buyTicketLoading = ref(false)
const buyTicketLoadingText = ref('')
// const ethPriceUSD = ref('0')

const props = defineProps([
  'address',
  'tokens',
  'request'
])

watch(() => props.address, async() => {
  myTicketsLoading.value = true
  myTickets.value = await getMyTickets()
  myTicketsLoading.value = false
});

// watch(() => toggleViewTicket.value, async() => {
//   console.log(toggleViewTicket.value)
//   if(toggleViewTicket.value){
//     qrLoading.value = true
//     const urlNewMasterCodeUrl = '/event/master-key?contractAddress=' + currentTicket.value.contractAddress + '&address=' + props.address
//     const urlNewMasterCode = await props.request.get(urlNewMasterCodeUrl)
//     masterKey.value = urlNewMasterCode
//     qrLoading.value = false
//   }
// });



onMounted(async () => {
  user.value = await props.request.get('/user/me')
  // const priceRes = await props.request.get('/blockchain/eth-price')
  events.value = await getAllEvents()
  myTickets.value = await getMyTickets()
  // ethPriceUSD.value = priceRes.ethPriceUSD
})

async function getAllEvents() {
  const res =  await props.request.get('/event/all-events')
  eventsLoading.value = false
  return res 
}

async function getMyTickets() {
  const tickets =  await props.request.post('/blockchain/my-events', { walletAddress: props.address })
  myTicketsLoading.value = false

  return tickets 
}

async function buyTicket(contractAddress: string) {
  buyTicketLoading.value = true
  buyTicketLoadingText.value = 'Preparing your personal one of one ticket...'
  const params = await  props.request.post('/blockchain/buy-tickets-params', {contractAddress, walletAddress: props.address, purchaseAmount: 1})

  const transactionParameters = {
      ...params,
      from: props.address
    }

  buyTicketLoadingText.value = 'Waiting for metamask confirmation...'

    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      // TODO show modal to explain how the ticket may take time to show in site
      // link to etherscan where ticket will be shown as pending
    } catch (error) {
      console.log('User rejected ticket purchase request')
    }

  buyTicketLoading.value = false
} 

function getPercetage(event: any) {
  return `width: ${(event.ticketIdCounter / event.ticketAmount) * 100}%`
}

async function viewTicket(ticket: any){
  currentTicket.value = ticket
  toggleViewTicket.value = !toggleViewTicket.value
  clearInterval(myInterval.value)
  getMasterKey()
}

async function getMasterKey() {
  if(toggleViewTicket.value) {
    qrLoading.value = true
    const urlNewMasterCodeUrl = '/event/master-key?contractAddress=' + currentTicket.value.contractAddress + '&address=' + props.address
    const urlNewMasterCode = await props.request.get(urlNewMasterCodeUrl)
    masterKey.value = urlNewMasterCode
    qrLoading.value = false
    newQRCode()
    let expireMS = parseInt(urlNewMasterCode.expiryTime) + 2000
    myInterval.value = setInterval(async () => {
      const currMS = new Date().getTime()
      const timeLeftMS = expireMS - currMS

      const timeLeftPercent = (timeLeftMS / 32000) * 100
      // console.log(timeLeftPercent)
      qrCodeTimeLeft.value = timeLeftPercent
      if(qrCodeTimeLeft.value <= 15){
        qrReloading.value = true
        if(qrCodeTimeLeft.value <= 0){
        qrCodeTimeLeft.value = 0
        const newExpiry = await props.request.get(urlNewMasterCodeUrl)
        masterKey.value = newExpiry
        expireMS = parseInt(newExpiry.expiryTime) + 2000
        newQRCode()
        }
      }
    }, 200)
  } 
}

function newQRCode() {
  qrCode.value = masterKey.value.masterKey + currentTicket.value.contractAddress
  qrCodeVar.value = qrCode.toDataURL();
  qrReloading.value = false
}

</script>

<template>
  <main>  
    <div class="px-24 pb-24">
      <div v-if="!toggleViewTicket">
        <div class="flex justify-evenly">
          <div class="w-1/2 pr-4">
            <div class="px-6 pb-6 h-[40rem] overflow-auto bg-white border rounded-2xl border-gray-200">

              <div class="sticky top-0 z-10 py-3 bg-white">
                <h1 class="text-4xl mt-4">Events</h1>
                <h1 class="text-sm">Upcoming</h1>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div v-if="!eventsLoading && !buyTicketLoading && events.events" v-for="event in events.events" class="my-2">
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
                                <p class="mb-1 font-normal text-stone-800">{{ new Date(parseInt(event.eventDate)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) }} </p>
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

                <div v-else-if="!eventsLoading && !buyTicketLoading && !events.events">
                  <p>No events have been created.</p>
                </div>
              </div>
              <div v-if="eventsLoading" class="w-full flex justify-center">
                <svg  role="status" class="mr-2 mt-56 w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-[#E43C4A]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
              </div>
              <div v-if="buyTicketLoading" class="w-full flex justify-center">
                <div class="flex flex-col">
                  <div class="flex justify-center pb-6">
                    <svg role="status" class="mr-2 w-full justify-center mt-56 w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-[#E43C4A]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                  </div>
                  <p>{{buyTicketLoadingText}}</p>
                </div>
              </div>
            </div>
          </div>


          <div class="block px-6 pb-6 w-1/2 bg-white border rounded-2xl border-gray-200 h-[40rem] overflow-auto">

            <div class="sticky top-0 z-10 py-3 bg-white">
              <h1 class="text-4xl my-4">My Tickets</h1>
            </div>
            
              <div v-if="!myTicketsLoading && myTickets.events" v-for="ticket in myTickets.events" class="my-2">
                <div @click="viewTicket(ticket)" class="relative flex mb-[-170px] hover:mb-0 transition-all">
                  <img class="w-full object-cover h-72 rounded-2xl" :src="ticket.media" alt="">
                  <div class="absolute p-5 h-full w-full">
                    <div class="h-full w-full relative">
                    <p class="text-4xl drop-shadow-lg font-extrabold text-white stroke-black">{{ticket.eventName}}</p>
                    <p class="text-lg font-bold text-white stroke-black">({{ticket.symbol}})</p>
                    <p class="font-bold text-white truncate">Event Date: {{ new Date(parseInt(ticket.eventDate)).getDate() }} {{ new Date(parseInt(ticket.eventDate)).toLocaleString('default', { month: 'short' }) }} {{ new Date(parseInt(ticket.eventDate)).getFullYear() }}</p>
                    <p class="font-bold text-white truncate">Start Time:  {{ new Date(parseInt(ticket.eventDate)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) }} </p>
                    <p class="absolute w-full text-center mb-1 font-bold text-white bottom-6">Ticket Number</p>
                    <p class="absolute w-full text-center mb-1 font-bold text-white bottom-0">#{{ticket.ticketNumber}} of {{ticket.ticketAmount}}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="!myTicketsLoading && !myTickets.events" class="mt-56">
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
      <div v-else>
        <div class="grid grid-cols-2 drop-shadow-md hover:drop-shadow-2xl transition-all">
          <button class="absolute top-8 left-8 z-10 text-2xl mb-6 bg-gray-200 p-2 rounded-xl" @click="viewTicket(currentTicket)">
              <svg class="w-8 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
          <div class="w-full">
            <img class="w-full border-l-2 border-t-2 border-b-2 rounded-l-2xl border-slate-400" :src="currentTicket.media" alt="Ticket image">
          </div>
          <div class="w-full flex flex-col justify-center border-r-4 border-t-2 border-b-2 rounded-r-2xl border-slate-400 px-10 bg-white">
            <div class="flex">
              <div>
                <div v-if="qrLoading" class="w-56 h-56 flex justify-center">
                    <svg role="status" class="mr-2 mt-20 w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-[#E43C4A]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                  </div>
                  <div v-else-if="qrReloading">
                    <img class="animate-pulse w-56" :src="qrCodeVar" alt="QRCode" />
                  </div>
                  <div v-else>
                    <img class="w-56 h-full" :src="qrCodeVar" alt="QRCode" />
                  </div>
                  <div class="w-56 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                    <div class="bg-[#E43C4A] rounded-full h-2.5 w-56 transition-all" :style="`width: ${qrCodeTimeLeft}%`"></div>
                  </div>
                </div>
                <div class="ml-5">
                  <p class="font-bold text-xl mt-4">{{currentTicket.eventName}}</p>
                  <p class="mt-4">name:</p>
                  <p class="font-bold">{{user.name}}</p>
                  <p class="mt-2">date:</p>
                  <p class="font-bold">{{ new Date(parseInt(currentTicket.eventDate)).getDate() }} {{ new Date(parseInt(currentTicket.eventDate)).toLocaleString('default', { month: 'short' }) }} {{ new Date(parseInt(currentTicket.eventDate)).getFullYear() }} - {{ new Date(parseInt(currentTicket.eventDate)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) }}</p>
                  <p class="mt-2">ticket number:</p>
                  <p class="font-bold">{{currentTicket.ticketNumber}} of {{currentTicket.ticketAmount}} </p>
                </div>
              </div>
              <p class="mt-12">{{currentTicket.description}} </p>
          </div>
        </div> 
      </div>
    </div>
  </main>
</template>
