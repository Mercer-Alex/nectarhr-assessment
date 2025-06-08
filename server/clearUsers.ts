import axios from "axios";

async function clearUsers() {
	try {
      await axios.delete('http://localhost:3001/api/users')
	} catch (err: any) {
		console.error(`Failed to delete users ${err.response?.data?.error || err.message}`)
	} 
}

clearUsers();