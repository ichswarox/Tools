<script setup>
import { ref, onMounted } from 'vue'

const password = ref('Loading...')
const timeLeft = ref(30)
const downloads = ref([])
let timer = null
let nextRefreshTime = Date.now() + 30000

// Function to fetch the password from the backend API
async function fetchPassword() {
  try {
    const response = await fetch('/api/password')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    password.value = data.password
    // Update the next refresh time
    nextRefreshTime = data.nextRefresh
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    password.value = 'Failed to load'
  }
}

// Function to fetch available downloads
async function fetchDownloads() {
  try {
    const response = await fetch('/api/downloads')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    downloads.value = data.files
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    downloads.value = []
  }
}

// Function to handle the countdown timer
function startTimer() {
  // Clear any existing timer
  if (timer) {
    clearInterval(timer)
  }
  
  timer = setInterval(() => {
    // Calculate time left based on next refresh time
    const timeRemaining = Math.floor((nextRefreshTime - Date.now()) / 1000)
    timeLeft.value = Math.max(0, timeRemaining)
    
    // If time has expired, fetch new password
    if (timeRemaining <= 0) {
      fetchPassword()
    }
  }, 1000)
}

// Fetch password and downloads, start timer when the component is first mounted
onMounted(() => {
  fetchPassword()
  fetchDownloads()
  startTimer()
})

// Manual refresh function
function manualRefresh() {
    fetchPassword().then(() => {
        // Reset the timer when manually refreshing
        nextRefreshTime = Date.now() + 30000;
        timeLeft.value = 30;
    });
}
</script>

<template>
  <div class="container">
    <h1>Current Password</h1>
    <div class="password-display">
      <code>{{ password }}</code>
    </div>
    <p>New password in: <span class="timer">{{ timeLeft }}</span> seconds</p>
    <button class="refresh-button" @click="manualRefresh">Refresh Now</button>
    <div class="download-link">
        <a href="/auth/auth.txt" download>Download auth.txt</a>
    </div>
    
    <div class="downloads-section" v-if="downloads.length > 0">
      <h2>Available Downloads</h2>
      <ul class="downloads-list">
        <li v-for="file in downloads" :key="file.name">
          <a :href="`/downloads/${file.name}`" :download="file.name">{{ file.name }}</a>
          <span class="file-size">({{ Math.ceil(file.size / 1024) }} KB)</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

h1, h2 {
  color: #2c3e50;
  margin-bottom: 0;
}

.password-display {
  background-color: #ecf0f1;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  border: 1px solid #bdc3c7;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}

.password-display code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.5rem;
  color: #34495e;
  word-wrap: break-word;
}

p {
  margin: 0;
  color: #7f8c8d;
}

.timer {
  font-weight: bold;
  color: #2980b9;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}

.download-link, .downloads-section {
    margin-top: 1rem;
    width: 100%;
}

.download-link a, .downloads-list a {
    color: #3498db;
    text-decoration: none;
}

.download-link a:hover, .downloads-list a:hover {
    text-decoration: underline;
}

.downloads-list {
  list-style-type: none;
  padding: 0;
  width: 100%;
}

.downloads-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.file-size {
  color: #7f8c8d;
  font-size: 0.9rem;
}
</style>
