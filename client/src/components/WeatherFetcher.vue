<!-- src/components/WeatherFetcher.vue -->
<template>
  <div class="card">
    <h2>Weather Forecast</h2>
    <form @submit.prevent="getForecast">
      <input v-model="stateCode" placeholder="Enter state code (e.g., UT)" />
      <button type="submit">Get Forecast</button>
    </form>
	<div v-if="error" class="error">
      {{ error }}
    </div>
    <div v-if="forecast">
      <h3>{{ forecast.properties.periods[0].name }}</h3>
      <p>{{ forecast.properties.periods[0].detailedForecast }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const stateCode = ref('')
const forecast = ref<any>(null)
const error = ref<string | null>(null)

const getForecast = async () => {
	error.value = null;
	forecast.value = null;
	try {
		const res = await fetch(`/api/weather/${stateCode.value}`);
		const data = await res.json();

		if (!res.ok) {
			error.value = data.error || 'Unknown error occurred, please try again';
		} else {
			forecast.value = data;
		}
	} catch (err: any) {
		error.value = 'Failed to fetch weather, please try again later.'
    	console.error(err)
	}
	}
</script>

<style scoped>
.error {
	color: red;
	margin: 4px;
}
.card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 500px;
  margin: 2rem auto;
}
input {
  padding: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 175px;
}
button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: forestgreen;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
</style>
