import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

export const listEvents = (params) => client.get('/events', { params })
export const createEvent = (payload) => client.post('/events', payload)
export const updateEventStatus = (id, status) => client.patch(`/events/${id}/status`, { status })
export const deleteEvent = (id) => client.delete(`/events/${id}`)
export const levelStats = () => client.get('/stats/level')
export const serviceStats = () => client.get('/stats/service')
export const dayStats = () => client.get('/stats/day')
