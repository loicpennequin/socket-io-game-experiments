import '@/ui/styles/reset.css';
import '@/ui/styles/global.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import router from './router';

import App from './ui/components/App.vue';

createApp(App).use(createPinia()).use(router).mount('#app');
