<script setup lang="ts">
import { onBeforeMount } from "@vue/runtime-core"
import { ref } from "vue"
import { useRoute } from "vue-router"

const event = ref()

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
  event.value = await props.request.get('/event/event-info?contractAddress=' + route.params.contractAddress + '&address=' + props.address)
}

</script>

<template>
  <main class="ml-10">
    <input type="text" placeholder="add admins email">
  <p>admins: {{event.admins}}</p>
  <button @click="getData()">get data</button>
   <p>analytics {{route.params.contractAddress}}</p>
   <p class="font-bold">add admins!!!</p>
   <p> 'https://rinkeby.etherscan.io/tx' + txhash get deployed txHash</p>
   <p>get amount of tickets sold</p>
   <p>get amount of money made</p>
   <p>get money made off resale</p>
   <p>show link to add collection to rarible/opensea</p>
   <p>have option to set contract as open to trade on opensea</p>
   <br>
   <p>{{event}}</p>
  </main>
</template>
