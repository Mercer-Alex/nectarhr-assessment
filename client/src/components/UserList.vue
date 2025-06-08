<!-- src/components/UserList.vue -->
 <template>
 <div class="card">
	<H2>User Data</H2>
	<div class="user-table-all">
		<h3>All Users</h3>
		<label>
			Sort by:
			<select v-model="userSortField">
			<option value="first_name">First Name</option>
			<option value="last_name">Last Name</option>
			</select>
		</label>
		<button @click="fetchUsers">Load All Users</button>
		<ul>
			<li v-for="user in sortedUsers" :key="user.id">
			{{ user.first_name }} {{ user.last_name }} ({{ user.country }}) - {{ user.active ? 'Active' : 'Inactive' }}
			</li>
		</ul>
	</div>
	<div class="user-table-duplicates">
		<h3>Duplicate User Names (Min Count: {{ minCount }})</h3>
		<label>
			Min Count:
			<input type="number" v-model.number="minCount" min="1" />
		</label>
		<label>
    		<input type="checkbox" v-model="filterActive" /> Only Active
  		</label>
  		<label>
    		Sort by:
    		<select v-model="duplicateSortField">
				<option value="name">Name</option>
      			<option value="count">Count</option>
    		</select>
  		</label>
		<button @click="fetchDuplicateUsers">Load Duplicates</button>
		<ul>
			<li v-for="user in sortedDuplicates" :key="user.name">
				{{ user.name }} — Appeared {{ user.count }} time<span v-if="user.count > 1">s</span>
			</li>
		</ul>
	</div>

	<div class="user-table-country">
		<h3>Users by Country</h3>
		<select v-model="selectedCountry" @change="fetchUsersByCountry">
		  <option disabled value="">Select a country</option>
		  <option v-for="code in countryCodes" :key="code" :value="code">
			{{ code }}
		  </option>
		</select>
		<ul>
		  <li v-for="user in usersByCountry" :key="user.id">
			{{ user.first_name }} {{ user.last_name }}s
		  </li>
		</ul>
	</div>
  </div></template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const users = ref<User[]>([])
const duplicateNames = ref([])
const usersByCountry = ref([])
const selectedCountry = ref('')
const minCount = ref(2)
const filterActive = ref(false)
const userSortField = ref<'first_name' | 'last_name'>('first_name')
const duplicateSortField = ref<'name' | 'count'>('name')

interface User {
  id: number
  first_name: string
  last_name: string
  country: string
  active: boolean
}
const countryCodes = ["US", "CA", "UK", "UA", "DE", "MX"] // Add relevant country codes used in your DB

const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    return a[userSortField.value].localeCompare(b[userSortField.value])
  })
})

const sortedDuplicates = computed(() => {
  return [...duplicateNames.value].sort((a, b) => {
    if (duplicateSortField.value === 'name') {
      return a.name.localeCompare(b.name)
    } else {
      return b.count - a.count
    }
  })
})

const fetchUsers = async () => {
  const res = await fetch('/api/users')
  users.value = await res.json()
}

const fetchDuplicateUsers = async () => {
  const query = `/api/users/duplicate-names?count=${minCount.value}&active=${filterActive.value}`
  const res = await fetch(query)
  const data = await res.json()
  console.log(duplicateNames);
  duplicateNames.value = data.duplicates
}

const fetchUsersByCountry = async () => {
  if (!selectedCountry.value) return
  const res = await fetch(`/api/users/by-country/${selectedCountry.value}`)
  usersByCountry.value = await res.json()
}

onMounted(async () => {
  fetchUsers()
  fetchDuplicateUsers()
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  margin: 2rem auto;
  font-family: 'Inter', sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.user-table-all,
.user-table-duplicates,
.user-table-country {
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

ul {
  list-style-type: none;
  padding-left: 0;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.5rem;
}

li {
  padding: 0.4rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
  color: #444;
}

button {
  background-color: forestgreen;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

button:hover {
  background-color: #379f6b;
}

input[type="number"],
select {
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-left: 0.5rem;
  margin-right: 1rem;
}

label {
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  margin-right: 1rem;
  margin-top: 0.5rem;
}
</style>
