<template>
  <div class="flex flex-col justify-center items-center space-y-4 py-4">
    <div class="flex flex-wrap justify-center items-center space-x-4">
      <div v-for="(filter, index) in filters" :key="index" class="relative">
        <button
          ref="filterButtons"
          @click.stop
          @click="togglePopup(index)"
          :class="{
            'bg-blue-500 text-white': showPopup === index,
            'bg-gray-200': showPopup !== index
          }"
          class="px-3 py-2 rounded transition duration-150 ease-in-out mx-2 my-2"
        >
          {{ filter.name }}
        </button>
        <transition name="fade">
          <div
            v-if="showPopup === index"
            v-click-outside="closePopup"
            ref="popup"
            class="absolute bg-white shadow-lg p-4 mt-2 rounded z-10 w-48 -ml-8 leading-6"
          >
            <div
              v-for="(option, optionIndex) in filter.options"
              :key="optionIndex"
              class="flex items-center space-x-2 py-1"
            >
              <input
                type="checkbox"
                v-model="selectedFilters[filter.key]"
                :value="option"
                :id="`${filter.key}-${optionIndex}`"
                class="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400 transition duration-150 ease-in-out"
              />
              <label
                :for="`${filter.key}-${optionIndex}`"
                :class="{ 'font-bold': isSelected(filter.key, option) }"
                class="text-gray-700"
              >
                {{ option }}
              </label>
            </div>
            <button @click="togglePopup(null)" class="mt-2 text-sm close-button">Close</button>
          </div>
        </transition>
      </div>
    </div>
    <div class="flex justify-center items-center space-x-4 mt-4">
      <button
        @click="applyFilters"
        class="shadow-xl transition-colors transform bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2 mb-2 transform active:scale-75 transition-transform"
      >
        Submit
      </button>
      <button
        @click="clearFilters"
        class="w-10 h-10 bg-white rounded-lg flex items-center justify-center border mb-2 transition-colors transform hover:bg-red-200 hover:text-gray-100 shadow-lg transform active:scale-75 transition-transform"
      >
        <img src="/clearF.png" alt="Clear Filter" class="w-8 h-8" />
      </button>
    </div>
  </div>
  <div class="flex flex-wrap justify-center">
    <div class="flex flex-wrap justify-center">
      <div
        v-for="job in jobs"
        :key="job._id.$oid"
        class="bg-white border border-slate-200 rounded-3xl px-5 py-5 transition hover:-translate-y-1 hover:shadow-xl w-80 m-5 h-96 flex flex-col justify-between"
      >
        <div>
          <h1 class="text-3xl font-bold overflow-hidden whitespace-nowrap overflow-ellipsis">
            {{ job.Job_title }}
          </h1>
          <div class="flex items-center mt-2">
            <h2 class="text-lg font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis">
              {{ job.Company_name }}
            </h2>
          </div>
          <p class="mt-4 line-clamp-[7]">{{ job.description }}</p>
        </div>
        <div class="flex">
          <router-link
            :to="'/Jobs/' + job.id"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transform active:scale-75 transition-transform"
          >
            See more
          </router-link>
          <button @click="likeJob(job._id.$oid)" class="h-9 w-9 ml-5">
            <div
              :class="{
                'bg-[url(\'/Like1.svg\')]': !job.liked,
                'bg-[url(\'/Like2.svg\')]': job.liked
              }"
              class="bg-cover w-9 h-9 transform active:scale-75 transition-transform"
            ></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const jobs = ref([])
const userEmail = localStorage.getItem('userEmail') // Get the user's email from localStorage

const fetchJobs = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/jobs') // Replace with your actual jobs endpoint
    jobs.value = response.data
  } catch (error) {
    console.error('Error fetching jobs:', error)
  }
}

const seeMore = (jobId) => {
  router.push({ name: 'JobDetail', params: { id: jobId } })
}

const likeJob = (jobId) => {
  axios
    .post('http://127.0.0.1:5000/add-favorite', { jobId, userEmail })
    .then(() => {
      const jobIndex = jobs.value.findIndex((job) => job._id.$oid === jobId)
      if (jobIndex !== -1) {
        jobs.value[jobIndex].liked = true
      }
      console.log({ jobId, userEmail })
    })
    .catch((error) => {
      console.error('Error adding job to favorites:', error)
    })
}

onMounted(() => {
  fetchJobs()
})

const buildQueryString = () => {
  const queryParams = new URLSearchParams()
  for (const key in selectedFilters.value) {
    if (selectedFilters.value[key].length > 0) {
      queryParams.append(key, selectedFilters.value[key].join(','))
    }
  }
  return queryParams.toString()
}

const togglePopup = (index) => {
  clearTimeout(closeTimer.value)
  if (showPopup.value === index) {
    closePopup()
  } else {
    showPopup.value = index
  }
}

const applyFilters = async () => {
  const queryString = buildQueryString()
  try {
    const response = await axios.get(`http://127.0.0.1:5000/jobs?${queryString}`)
    jobs.value = response.data
  } catch (error) {
    console.error('Error applying filters:', error)
  }
  showPopup.value = null
}

const clearFilters = async () => {
  selectedFilters.value = {
    worktype: [],
    profession: [],
    typeOfwork: [],
    city: [],
    workTime: []
  }
  showPopup.value = null
  try {
    const response = await axios.get('http://127.0.0.1:5000/jobs') // Fetch all jobs without filters
    jobs.value = response.data
  } catch (error) {
    console.error('Error clearing filters:', error)
  }
}

const closePopup = () => {
  showPopup.value = null
}

const isSelected = (filterKey, option) => {
  return selectedFilters.value[filterKey].includes(option)
}

let selectedFilters = ref({
  worktype: [],
  profession: [],
  typeOfwork: [],
  city: [],
  workTime: []
})

let showPopup = ref(null)
let closeTimer = ref(null)

const filters = ref([
  { name: 'Work Type', key: 'worktype', options: ['Part-time', 'Full-time', 'One-time'] },
  {
    name: 'Profession',
    key: 'profession',
    options: [
      'Programmer',
      'Biotechnology',
      'DevOps',
      'AI',
      'Engineering',
      'Networking',
      'Educator',
      'Cybersecurity',
      'VR',
      'Management'
    ]
  },
  { name: 'Type Of Work', key: 'typeOfwork', options: ['Online', 'In-office'] },
  {
    name: 'City',
    key: 'city',
    options: ['Liepaja', 'Ogre', 'Bauska', 'Jurmala', 'Tukums', 'Ventspils']
  },
  { name: 'workTime', key: 'workTime', options: ['Workdays', 'Weekend', 'Schedule'] }
])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.form-checkbox {
  appearance: none;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  background-clip: content-box;
  height: 1rem;
  width: 1rem;
}
.form-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
.close-button {
  background-color: #f9fafb;
  color: #1f2937;
  border: 1px solid #d1d5db;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 700;
}
.close-button:hover {
  background-color: #3b82f6;
  color: white;
}
</style>
