<script setup>
import { onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import {
  listEvents,
  createEvent,
  updateEventStatus,
  deleteEvent,
  levelStats,
  serviceStats,
  dayStats
} from './api'

const rows = ref([])
const query = reactive({ service: '', status: '' })
const form = reactive({
  service: 'judge-core',
  level: 'medium',
  status: 'open',
  title: '示例告警',
  owner: 'alice',
  event_date: '2026-03-24'
})

let levelChart
let serviceChart
let dayChart

async function fetchEvents() {
  const { data } = await listEvents(query)
  rows.value = data.data || []
}

async function addEvent() {
  await createEvent(form)
  await fetchEvents()
  await loadCharts()
}

async function markResolved(id) {
  await updateEventStatus(id, 'resolved')
  await fetchEvents()
  await loadCharts()
}

async function removeEvent(id) {
  await deleteEvent(id)
  await fetchEvents()
  await loadCharts()
}

async function loadCharts() {
  const [levelRes, serviceRes, dayRes] = await Promise.all([
    levelStats(),
    serviceStats(),
    dayStats()
  ])

  levelChart.setOption({
    title: { text: '告警级别分布' },
    tooltip: {},
    series: [{ type: 'pie', radius: ['35%', '70%'], data: levelRes.data.data || [] }]
  })

  serviceChart.setOption({
    title: { text: '服务告警数量' },
    tooltip: {},
    xAxis: { type: 'category', data: (serviceRes.data.data || []).map(i => i.name) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: (serviceRes.data.data || []).map(i => i.value) }]
  })

  dayChart.setOption({
    title: { text: '每日告警与已解决' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['总告警', '已解决'] },
    xAxis: { type: 'category', data: (dayRes.data.data || []).map(i => i.day) },
    yAxis: { type: 'value' },
    series: [
      { name: '总告警', type: 'line', data: (dayRes.data.data || []).map(i => i.total) },
      { name: '已解决', type: 'line', data: (dayRes.data.data || []).map(i => i.resolved) }
    ]
  })
}

onMounted(async () => {
  levelChart = echarts.init(document.getElementById('levelChart'))
  serviceChart = echarts.init(document.getElementById('serviceChart'))
  dayChart = echarts.init(document.getElementById('dayChart'))

  await fetchEvents()
  await loadCharts()
})
</script>

<template>
  <div class="container">
    <div class="card">
      <h2>Node.js 运维事件中心</h2>
      <div class="grid">
        <div><input v-model="form.service" placeholder="服务名" /></div>
        <div>
          <select v-model="form.level">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </div>
        <div>
          <select v-model="form.status">
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>
        </div>
        <div><input v-model="form.title" placeholder="事件标题" /></div>
        <div><input v-model="form.owner" placeholder="负责人" /></div>
        <div><input v-model="form.event_date" type="date" /></div>
      </div>
      <div style="margin-top: 10px;"><button @click="addEvent">新增事件</button></div>
    </div>

    <div class="card">
      <div style="display:flex; gap:8px; margin-bottom:10px;">
        <input v-model="query.service" placeholder="按服务筛选" />
        <select v-model="query.status">
          <option value="">全部状态</option>
          <option value="open">open</option>
          <option value="in_progress">in_progress</option>
          <option value="resolved">resolved</option>
        </select>
        <button @click="fetchEvents">查询</button>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th><th>服务</th><th>级别</th><th>状态</th><th>标题</th><th>负责人</th><th>日期</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.service }}</td>
            <td>{{ row.level }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.title }}</td>
            <td>{{ row.owner }}</td>
            <td>{{ row.event_date }}</td>
            <td>
              <button class="gray" @click="markResolved(row.id)">置为resolved</button>
              <button class="red" @click="removeEvent(row.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="chart-grid">
      <div class="card"><div id="levelChart" class="chart" /></div>
      <div class="card"><div id="serviceChart" class="chart" /></div>
    </div>
    <div class="card"><div id="dayChart" class="chart" /></div>
  </div>
</template>
