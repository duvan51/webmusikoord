import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://api.musikoord.com/api',
  timeout: 15000, // Aumentado a 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
})

export default instance