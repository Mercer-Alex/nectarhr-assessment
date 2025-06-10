<!-- src/components/UserList.vue -->
 <template>
 <div class="card">
	<H2>User Data</H2>
	<div class="user-table-all">
		<h3 @click="collapsedAll = !collapsedAll" style="cursor: pointer;">
			All Users
        	<span>{{ collapsedAll ? '▸' : '▾' }}</span>
      	</h3>
		<div class="all-users" v-if="!collapsedAll">
			<label>
				Sort by:
				<select v-model="userSortField">
				<option value="first_name">First Name</option>
				<option value="last_name">Last Name</option>
				</select>
			</label>
			<label>
				<input type="checkbox" v-model="filterActiveAll" /> Only Active
			  </label>
			<button @click="fetchUsers">Load All Users</button>
			<ul>
				<li v-for="user in sortedUsers" :key="user.id">
				{{ user.first_name }} {{ user.last_name }} ({{ user.country }}) - {{ user.active ? 'Active' : 'Inactive' }}
				</li>
			</ul>
		</div>
	</div>
	<div class="user-table-duplicates">
		<h3 @click="collapsedDuplicates = !collapsedDuplicates" style="cursor: pointer;">
        	Duplicate User Names (Min Count: {{ minCount }})
        	<span>{{ collapsedDuplicates ? '▸' : '▾' }}</span>
      	</h3>
		<div class="duplicate-users" v-if="!collapsedDuplicates">
			<label>
				Min Count:
				<input type="number" v-model.number="minCount" min="1" />
			</label>
			<label>
				<input type="checkbox" v-model="filterActiveDuplicates" /> Only Active
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
	</div>

	<div class="user-table-country">
		<h3 @click="collapsedCountry = !collapsedCountry" style="cursor: pointer;">
        	Users by Country
        	<span>{{ collapsedCountry ? '▸' : '▾' }}</span>
      	</h3>
		<div class="users-country" v-if="!collapsedCountry">
			<select v-model="selectedCountry">
			  <option disabled value="">Select a country</option>
			  <option v-for="code in countryCodes" :key="code" :value="code">
				{{ code }}
			  </option>
			</select>
			<label>
				<input type="checkbox" v-model="filterActiveCountry" /> Only Active
			</label>
			<button @click="fetchUsersByCountry">Load by Country</button>
			<ul>
			  <li v-for="user in usersByCountry" :key="user.id">
				{{ user.first_name }} {{ user.last_name }}s
			  </li>
			</ul>
		</div>
	</div>
  </div></template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const collapsedAll = ref(false);
const collapsedDuplicates = ref(false);
const collapsedCountry = ref(false);
const users = ref<User[]>([]);
const duplicateNames = ref<DuplicateUser[]>([]);
const usersByCountry = ref<User[]>([]);
const selectedCountry = ref('');
const minCount = ref(2);
const filterActiveAll = ref(false);
const filterActiveDuplicates = ref(false);
const filterActiveCountry = ref(false);
const userSortField = ref<'first_name' | 'last_name'>('first_name');
const duplicateSortField = ref<'name' | 'count'>('name');

interface User {
  id: number,
  first_name: string,
  last_name: string,
  country: string,
  active: boolean,
}

interface DuplicateUser {
	name: string,
	count: number
}

const countryCodes = ref<string[]>([]);

const fetchCountries = async () => {
	try {
    	const res = await fetch('/api/countries');
    	countryCodes.value = await res.json();
  	} catch (err: any) {
   		console.error('Error fetching countries:', err.message);
  	}
};

const sortedUsers = computed(() => {
	return [...users.value].sort((a, b) => {
		return a[userSortField.value].localeCompare(b[userSortField.value]);
	});
})

const sortedDuplicates = computed(() => {
	return [...duplicateNames.value || []].sort((a, b) => {
		if (duplicateSortField.value === 'name') {
			return a.name.localeCompare(b.name)
    	} else {
			return b.count - a.count;
    	}
  	})
})

const fetchUsers = async () => {
	try {
		const res = await fetch(`/api/users?active=${filterActiveAll.value}`);
		users.value = await res.json();
	} catch (err: any) {
		console.error(err.message);
	}
}

const fetchDuplicateUsers = async () => {
	try {
		const query = `/api/users/duplicate-names?count=${minCount.value}&active=${filterActiveDuplicates.value}`;
		const res = await fetch(query);
		const data = await res.json();
		duplicateNames.value = data.duplicates;
	} catch (err: any) {
		console.error(err.message);
	}
}

const fetchUsersByCountry = async () => {
	if (!selectedCountry.value) return;
	try {
		const res = await fetch(`/api/users/by-country/${selectedCountry.value}?active=${filterActiveCountry.value}`)
		usersByCountry.value = await res.json();
	}  catch (err: any) {
		console.error(err.message);
	}
}

onMounted(async () => {
	fetchUsers();
  	fetchDuplicateUsers();
	fetchCountries();
});

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
	border-bottom: 2px solid #eee;
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
