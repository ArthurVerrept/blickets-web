import axios from 'axios'
import router from '../router'

class Request {
    baseUrl = 'http://localhost:3000'
    async post(endpoint: string, data?: any) {
        const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        try {
            const res = await axios.post(this.baseUrl + endpoint, data, { headers })
            return res.data
        } catch (error: any) {
            if  (error.response.data.statusCode == 401 && error.response.data.message == "TokenExpiredError") {
                const newAccessToken = await this.refreshToken()
                if(newAccessToken) {
                    localStorage.setItem('accessToken', newAccessToken)
                    const res = await axios.post(this.baseUrl + endpoint, data, { headers: { Authorization: `Bearer ${newAccessToken}` } })
                    return res.data
                }
            }
  
            return error
        }
    }   

    async get(endpoint: string) {
        const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        try {
            const res = await axios.get(this.baseUrl + endpoint, { headers })
            return res.data

        } catch (error: any) {
            console.log(error)
            if  (error.response.data.statusCode == 401 && error.response.data.message == "TokenExpiredError") {
                const newAccessToken = await this.refreshToken()
                if(newAccessToken) {
                    localStorage.setItem('accessToken', newAccessToken)
                    const res = await axios.get(this.baseUrl + endpoint, { headers: { Authorization: `Bearer ${newAccessToken}` } })
                    return res.data
                }
            }
            return error
        }
    }

    async refreshToken() {
        const headers = { Authorization: `Bearer ${localStorage.getItem('refreshToken')}` }
        try {
            const res = await axios.post(this.baseUrl + '/user/refresh-token', {}, { headers })
            return res.data.accessToken
        } catch (error: any) {
            console.log(error.response.data)
            if  (error.response.data.statusCode == 401) {
                console.log('relog')
                localStorage.removeItem('gotAuthCode')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                await router.replace('/sign-in')
            } 
        }
    }
}


const request = new Request()

export default request