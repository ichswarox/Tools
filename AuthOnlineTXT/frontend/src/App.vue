<script setup>
import { ref, onMounted } from 'vue'

const password = ref('Loading...')
const timeLeft = ref(20)

// Function to fetch the password from the backend API
async function fetchPassword() {
  try {
    const response = await fetch('/api/password')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    password.value = data.password
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    password.value = 'Failed to load'
  }
}

// Function to handle the countdown timer
function startTimer() {
  setInterval(() => {
    if (timeLeft.value > 1) {
      timeLeft.value--
    } else {
      fetchPassword()
      timeLeft.value = 20
    }
  }, 1000)
}

// Fetch password and start timer when the component is first mounted
onMounted(() => {
  fetchPassword()
  startTimer()
})

// Manual refresh function
function manualRefresh() {
    fetchPassword();
    timeLeft.value = 20;
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
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

h1 {
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

.download-link {
    margin-top: 1rem;
}

.download-link a {
    color: #3498db;
    text-decoration: none;
}

.download-link a:hover {
    text-decoration: underline;
}
</style>
