<script setup lang="ts">
import { onBeforeMount } from "@vue/runtime-core"
import { ref } from "vue"
import { useRoute } from "vue-router"

const event = ref()

const newAdminEmail = ref('')

const rate = ref()

const route = useRoute()

const props = defineProps([
  'address',
  'request'
])

onBeforeMount(async () => {
  console.log(props)
  await getData()
}) 

async function getData() {
  const priceRes = await props.request.get('/blockchain/eth-price')
  rate.value = priceRes.ethPriceUSD
  event.value = await props.request.get('/event/event-info?contractAddress=' + route.params.contractAddress + '&address=' + props.address)
}

async function addAdmin(email: string) {
  event.value = await props.request.post('/event/add-admin',{ contractAddress: route.params.contractAddress, address: props.address, email: email })
}

function getUsdValue(eth: number) {
  return (eth * parseInt(rate.value)).toFixed(2).toString()
}

function openTooltip(element: string) {
  document.getElementById(element)?.classList.remove('invisible')
}

function closeTooltip(element: string) {
  document.getElementById(element)?.classList.add('invisible')
}



</script>

<template>
  <main>
    <div class="px-24 pb-24">
        <!-- <p class="text-4xl mb-8">Analytics</p> -->
      <div class="flex justify-space">
        <div class="w-2/3 pr-4">
          <div class="flex justify-between">
            <div class="px-2 w-2/3">
              <p class="text-4xl font-bold mb-4">{{event.eventName}}</p>
              <!-- {{route.params.contractAddress}} -->
              <p>Tickets sold: </p>
              <p class="font-bold">{{event.ticketsSold}} of {{event.ticketAmount}}</p>
              <p>Percentage sold:</p>
              <p class="font-bold">{{parseInt(event.ticketsSold) / parseInt(event.ticketAmount) * 100}}%</p>
              <p>Revenue:</p>
              <p class="font-bold text-lime-600"> ${{getUsdValue(event.currentBalance)}} </p>

              <p>Ticket price:</p>
              <p class="font-bold mb-4"> ${{getUsdValue(event.ticketPrice)}} </p>

              <p>Event date:</p>
              <p class="font-bold mb-4"> {{ new Date(parseInt(event.eventDate)).getDate() }} {{ new Date(parseInt(event.eventDate)).toLocaleString('default', { month: 'short' }) }} {{ new Date(parseInt(event.eventDate)).getFullYear() }} at {{ new Date(parseInt(event.eventDate)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) }} 
              </p>
              
            </div>
            <div class="px-2 flex flex-col justify-evenly">
              <div class="relative">
                <a :href="'https://rinkeby.etherscan.io/tx/' + event.txHash" target="blank">
                  <img @mouseenter="openTooltip('etherscan')"  @mouseleave="closeTooltip('etherscan')" class="w-12 ring rounded-full ring-offset-2 hover:ring-offset-4 ring-stone-800 mr-28" src="../assets/etherscan-logo-circle.png" alt="">
                </a>
                <div id="etherscan" role="tooltip" class="inline-block absolute top-[-45px] left-[-100px] invisible z-10 py-2 px-3 text-sm font-medium text-white bg-stone-800 rounded-lg shadow-sm tooltip dark:bg-gray-700">
                    View transaction on etherscan
                </div>
              </div>
              <!-- TODO -->
              <div class="relative">
                <a :href="'https://testnets.opensea.io/get-listed/step-two'" target="blank">
                  <img @mouseenter="openTooltip('opensea')"  @mouseleave="closeTooltip('opensea')" class="w-12 ring rounded-full ring-offset-2 hover:ring-offset-4 ring-stone-800" src="../assets/Logomark-Blue.png" alt="">
                </a>
                <div id="opensea" role="tooltip" class="text-center inline-block transition-opacity absolute top-[-45px] left-[-110px] invisible z-10 py-2 px-3 text-sm font-medium text-white bg-stone-800 rounded-lg shadow-sm duration-300 tooltip dark:bg-gray-700">
                    Add your collections on opensea
                </div>
              </div>

              <div class="relative">
                <a class="w-12" :href="'https://rinkeby.rarible.com/collection/' + route.params.contractAddress + '/items'" target="blank">
                  <img @mouseenter="openTooltip('rarible')"  @mouseleave="closeTooltip('rarible')" class="w-12 ring rounded-lg ring-offset-2 hover:ring-offset-4 ring-stone-800" src="../assets/rarible.png" alt="">
                </a>
                <div id="rarible" role="tooltip" class="inline-block transition-opacity absolute top-[-45px] left-[-80px] invisible z-10 py-2 px-3 text-sm font-medium text-white bg-stone-800 rounded-lg shadow-sm duration-300 tooltip dark:bg-gray-700">
                    view collection on rarible
                </div>
              </div>


              <!-- <p>have option to set contract as open to trade on opensea</p> -->

              
            </div>
          </div>
          <!-- <p>{{event}}</p> -->
          <div class="flex mb-4">
            <div class="h-56 w-full relative border overflow-auto">
              <p class="sticky pb-2 mb-2 text-2xl top-3 bg-white px-4">Admins:</p>
              <div class="px-4" v-for="admin in event.admins"> 
                <p>{{admin}}</p>
              </div>
              <div class="absolute bottom-0 w-full flex justify-center">
                <input class="w-2/3" type="text" placeholder="johnwest@mail.com" v-model="newAdminEmail">
                <a @click="addAdmin(newAdminEmail)" class="inline-flex w-1/3 justify-center items-center py-2 px-3 text-sm font-medium text-center text-white bg-stone-800 hover:bg-stone-900 focus:outline-none cursor-pointer">
                    add admin
                    <svg class="ml-2 mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </a>
              </div>
            </div>
          </div>
        </div>
        <div class="w-2/5 pr-4">
          <img :src="event.imageUrl" alt="nft collection image">
        </div>
      </div>
    </div>
  </main>
</template>
