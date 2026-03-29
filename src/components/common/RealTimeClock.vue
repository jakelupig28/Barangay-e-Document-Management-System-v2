<template>
  <div class="real-time-clock">
    <div class="date-text">{{ currentDate }}</div>
    <div class="time-text">{{ currentTime }}</div>
  </div>
</template>

<script>
export default {
  name: 'RealTimeClock',
  data() {
    return {
      currentDate: '',
      currentTime: '',
      timer: null
    }
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      this.currentTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  }
}
</script>

<style scoped>
.real-time-clock {
  background: white;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border: 1px solid #eef2f7;
  text-align: right;
  min-width: 160px;
}
.date-text {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 4px;
}
.time-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}
</style>
