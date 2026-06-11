import axiosClient from './axiosClient.js'

export async function login(credentials) {
  const payload = await axiosClient.post('/auth/login', credentials)
  return payload
}

export async function register(payload) {
  const postData = {
    fullname: payload.name || payload.fullname,
    email: payload.email,
    password: payload.password,
  }

  const response = await axiosClient.post('/auth/signup', postData)
  return response
}
