<template>
  <div id="app">
    <h1>My Bookmarks</h1>
    <form @submit.prevent="addBookmark">
      <input type="text" v-model="newBookmark.name" placeholder="Name" required>
      <input type="url" v-model="newBookmark.url" placeholder="URL" required>
      <button type="submit">Add Bookmark</button>
    </form>
    <ul>
      <li v-for="bookmark in bookmarks" :key="bookmark.id">
        <a :href="bookmark.url" target="_blank">{{ bookmark.name }}</a>
        <button @click="deleteBookmark(bookmark.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/bookmarks';

export default {
  setup() {
    const bookmarks = ref([]);
    const newBookmark = ref({ name: '', url: '' });

    const fetchBookmarks = async () => {
      try {
        const response = await axios.get(API_URL);
        bookmarks.value = response.data;
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    };

    const addBookmark = async () => {
      try {
        const response = await axios.post(API_URL, newBookmark.value);
        bookmarks.value.push(response.data);
        newBookmark.value.name = '';
        newBookmark.value.url = '';
      } catch (error) {
        console.error('Error adding bookmark:', error);
      }
    };

    const deleteBookmark = async (id) => {
      try {
        await axios.delete(`${API_URL}/${id}`);
        bookmarks.value = bookmarks.value.filter(bookmark => bookmark.id !== id);
      } catch (error) {
        console.error('Error deleting bookmark:', error);
      }
    };

    onMounted(fetchBookmarks);

    return {
      bookmarks,
      newBookmark,
      addBookmark,
      deleteBookmark,
    };
  },
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

form {
  margin-bottom: 20px;
}

input {
  padding: 8px;
  margin-right: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

a {
  color: #42b983;
  text-decoration: none;
}

button {
  padding: 5px 10px;
  cursor: pointer;
}
</style>