<template>
  <div id="app">
    <h1>YouTube Thumbnail Extractor</h1>
    <input v-model="youtubeUrl" placeholder="Enter YouTube URL" />
    <button @click="getThumbnail">Get Thumbnail</button>
    <div v-if="thumbnailUrl">
      <img :src="thumbnailUrl" alt="YouTube Thumbnail" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      youtubeUrl: '',
      thumbnailUrl: ''
    };
  },
  methods: {
    async getThumbnail() {
      try {
        const response = await fetch(`http://localhost:3000/getThumbnail?url=${this.youtubeUrl}`);
        const data = await response.json();
        this.thumbnailUrl = data.thumbnailUrl;
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

input {
  padding: 10px;
  margin-right: 10px;
}

button {
  padding: 10px;
}

img {
  margin-top: 20px;
  max-width: 100%;
}
</style>