<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { onBeforeMount } from "@vue/runtime-core"
import { ref } from "vue"
import { useRoute } from "vue-router"

const event = ref()

const newAdminEmail = ref('')

const loading = ref(true)

const rate = ref()

const route = useRoute()

const props = defineProps([
  'address',
  'request'
])

onBeforeMount(async () => {
  await getData()
  loading.value = false
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

async function withdraw() {
  console.log('withdraw')
  const params = await props.request.post('/blockchain/withdraw', { contractAddress: route.params.contractAddress, address: props.address })

  const transactionParameters = {
      ...params,
      from: props.address
  }
  // @ts-ignore
  const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
  });
}

</script>

<template>
  <main>
    <div class="px-24 pb-24">
        <!-- <p class="text-4xl mb-8">Analytics</p> -->
      <div v-if="!loading" class="flex justify-space">
        <div class="w-2/3 pr-4">
          <div class="flex justify-between">
            <div class="px-2 w-2/3">
              <p class="text-4xl font-bold mb-4">{{event.eventName}}</p>
              <!-- {{route.params.contractAddress}} -->
              <p>Tickets sold: </p>
              <p class="font-bold">{{event.ticketsSold}} of {{event.ticketAmount}}</p>
              <p>Percentage sold:</p>
              <p class="font-bold">{{(parseInt(event.ticketsSold) / parseInt(event.ticketAmount) * 100).toFixed(2)}}%</p>
              <p>Revenue:</p>
              <p class="font-bold text-lime-600"> ${{getUsdValue(event.currentBalance)}} </p>

              <p>Ticket price:</p>
              <p class="font-bold"> ${{getUsdValue(event.ticketPrice)}} </p>

              <p>Event date:</p>
              <p class="font-bold"> {{ new Date(parseInt(event.eventDate)).getDate() }} {{ new Date(parseInt(event.eventDate)).toLocaleString('default', { month: 'short' }) }} {{ new Date(parseInt(event.eventDate)).getFullYear() }} at {{ new Date(parseInt(event.eventDate)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) }} 
              </p>

              <p>Contract Address:</p>
              <p class="font-bold"> {{ route.params.contractAddress }} </p>
              
              <div class="relative flex my-8">
                <a @click="withdraw()" @mouseenter="openTooltip('withdraw')"  @mouseleave="closeTooltip('withdraw')" class="inline-flex mt-2 h-12 p-4 items-center px-3 text-sm font-medium text-center text-white bg-stone-800 hover:bg-stone-900 focus:outline-none cursor-pointer">
                  <p class="font-bold text-lg"> withdraw </p>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                  </svg>
                </a>
                <p class="text-sm ml-2 flex">
                <svg class="w-14 h-14 ml-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Withdrawals are paid to the deployer wallet used to create the event. This event was deployed by {{event.deployerAddress}}
                </p>
                <div id="withdraw" role="tooltip" class="text-center inline-block transition-opacity absolute top-[-30px] left-[150px] invisible z-10 py-2 px-3 text-sm font-medium text-white bg-stone-800 rounded-lg shadow-sm duration-300 tooltip dark:bg-gray-700">
                    You can withdraw as many times as you want from your event, however, every withdrawal has a blockchain processing fee. For this reason we recommend you do not withdraw until the event has finished.
                </div>
              </div>
            </div>
            <div class="px-2 flex flex-col justify-evenly">
              <div class="relative">
                <a :href="'https://rinkeby.etherscan.io/address/' + route.params.contractAddress" target="_blank">
                  <img @mouseenter="openTooltip('etherscan')"  @mouseleave="closeTooltip('etherscan')" class="w-12 ring rounded-full ring-offset-2 hover:ring-offset-4 ring-stone-800 mr-28" src="../assets/etherscan-logo-circle.png" alt="">
                </a>
                <div id="etherscan" role="tooltip" class="inline-block absolute top-[-45px] left-[-85px] invisible z-10 py-2 px-3 text-sm font-medium text-white bg-stone-800 rounded-lg shadow-sm tooltip dark:bg-gray-700">
                    View contract on etherscan
                </div>
              </div>
              <!-- TODO -->
              <div class="relative">
                <a :href="'https://testnets.opensea.io/get-listed/step-two'" target="_blank">
                  <img @mouseenter="openTooltip('opensea')"  @mouseleave="closeTooltip('opensea')" class="w-12 ring rounded-full ring-offset-2 hover:ring-offset-4 ring-stone-800" src="../assets/Logomark-Blue.png" alt="">
                </a>
                <div id="opensea" role="tooltip" class="text-center inline-block transition-opacity absolute top-[-45px] left-[-105px] invisible z-10 py-2 px-3 text-sm font-medium text-white bg-stone-800 rounded-lg shadow-sm duration-300 tooltip dark:bg-gray-700">
                    Add your collections on opensea
                </div>
              </div>

              <div class="relative">
                <a class="w-12" :href="'https://rinkeby.rarible.com/collection/' + route.params.contractAddress + '/items'" target="_blank">
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
      <div v-else class="h-[80vh] relative">
        <svg role="status" class="mr-2 absolute top-[46%] left-[46%] w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-[#E43C4A]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
      </div>
    </div>
  </main>
</template>
