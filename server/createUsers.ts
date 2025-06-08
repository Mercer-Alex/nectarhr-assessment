import axios from 'axios';

const firstNames: string[] = [
	'Allen',
	'Alex',
	'PJ',
	'Brian',
	'Yeti',
	'Brooks',
	'Bob'
];
const lastNames: string[] = [
	'Crassel',
	'Dog',
	'Mercer',
	'Bobbington'
];

const countries: string[] = [
	'UK',
	'US',
	'UA',
	'CA',
	'FR',
	'DE',
	'MX'
];

const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const getRandomBool = () => Math.random() < 0.5;

async function createUsers() {
	for (let i = 0; i < 20; i++) {
		const first_name = getRandomElement(firstNames);
		const last_name = getRandomElement(lastNames);
		const email = `${first_name.toLowerCase()}.${last_name.toLowerCase()}${i}@example.com`;
		const active = getRandomBool();
		const country = getRandomElement(countries);

		const user = {
			first_name,
			last_name,
			email,
			active,
			country
		}

		await axios.post('http://localhost:3001/api/users', user)
		.then(res => console.log(`Created user ${res.data.first_name} ${res.data.last_name}`))
		.catch(err => console.error('Error creating user:', err.response?.data || err.message));
 	}
}

createUsers()