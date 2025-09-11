<template>
  <div id="app">
    <h1>Weblink to HTML</h1>
    
    <!-- Single URL input -->
    <div class="section">
      <h2>Single URL</h2>
      <input v-model="singleUrl" placeholder="Enter URL" />
      <button @click="fetchHtml">Fetch HTML</button>
      <div v-if="htmlContent">
        <button @click="copyHtml">Copy HTML</button>
        <div v-if="filename">Saved as: {{ filename }}</div>
        <div v-if="downloadUrl">
          <a :href="downloadUrl" target="_blank" download>Download HTML File</a>
        </div>
        <pre>{{ htmlContent }}</pre>
      </div>
    </div>
    
    <!-- Batch URLs input -->
    <div class="section">
      <h2>Batch URLs</h2>
      <textarea v-model="batchUrls" placeholder="Enter multiple URLs, one per line" rows="5"></textarea>
      <button @click="fetchBatchHtml">Fetch Batch HTML</button>
      <div v-if="batchResults.length > 0">
        <h3>Results:</h3>
        <ul>
          <li v-for="(result, index) in batchResults" :key="index">
            <span :class="result.status">{{ result.status.toUpperCase() }}</span>: 
            <a :href="result.url" target="_blank">{{ result.url }}</a>
            <span v-if="result.filename"> - Saved as: {{ result.filename }}</span>
            <span v-if="result.downloadUrl"> - <a :href="`http://localhost:3000${result.downloadUrl}`" target="_blank" download>Download</a></span>
            <span v-if="result.error"> - Error: {{ result.error }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const singleUrl = ref('');
const htmlContent = ref('');
const filename = ref('');
const downloadUrl = ref('');
const batchUrls = ref('');
const batchResults = ref([]);

const fetchHtml = async () => {
  if (!singleUrl.value) {
    alert('Please enter a URL');
    return;
  }

  try {
    const response = await axios.get('http://localhost:3000/api/fetch-html', {
      params: { url: singleUrl.value },
    });
    htmlContent.value = response.data.content;
    filename.value = response.data.filename;
    downloadUrl.value = `http://localhost:3000${response.data.downloadUrl}`;
  } catch (error) {
    console.error('Error fetching HTML:', error);
    htmlContent.value = 'Error fetching HTML. See console for details.';
    filename.value = '';
    downloadUrl.value = '';
  }
};

const copyHtml = async () => {
  try {
    await navigator.clipboard.writeText(htmlContent.value);
    alert('HTML copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy HTML:', err);
    alert('Failed to copy HTML. Please try again or copy manually.');
  }
};

const fetchBatchHtml = async () => {
  const urls = batchUrls.value.split('\n').filter(url => url.trim() !== '');
  
  if (urls.length === 0) {
    alert('Please enter at least one URL');
    return;
  }

  try {
    const response = await axios.post('http://localhost:3000/api/fetch-html-batch', {
      urls: urls
    });
    
    // Update download URLs to include full path
    const results = response.data.results.map(result => {
      if (result.downloadUrl) {
        return {
          ...result,
          downloadUrl: `http://localhost:3000${result.downloadUrl}`
        };
      }
      return result;
    });
    
    batchResults.value = results;
  } catch (error) {
    console.error('Error fetching HTML batch:', error);
    alert('Error fetching HTML batch. See console for details.');
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  padding: 20px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

input, textarea {
  padding: 10px;
  width: 300px;
  margin-right: 10px;
  margin-bottom: 10px;
}

textarea {
  width: 100%;
  max-width: 500px;
}

button {
  padding: 10px 20px;
  margin: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #359c6d;
}

pre {
  text-align: left;
  background-color: #f5f5f5;
  padding: 20px;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-top: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.success {
  color: green;
  font-weight: bold;
}

.error {
  color: red;
  font-weight: bold;
}

ul {
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
}
</style>
