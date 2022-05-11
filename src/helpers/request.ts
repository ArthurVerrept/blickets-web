import axios from 'axios'
import {inject} from 'vue'
import router from '../router'

class Request {
    handleError: any
    constructor(handleError: any){
        this.handleError = handleError
    }
    someFunc = inject('errorPopup');
    baseUrl = 'http://localhost:3000'

    async post(endpoint: string, data?: any) {
        const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        try {
            const res = await axios.post(this.baseUrl + endpoint, data, { headers })
            return res.data
        } catch (error: any) {
            console.log(error.response)
            if  (error.response.status == 401 && error.response.data.message.includes("TokenExpiredError")) {
                const newAccessToken = await this.refreshToken()
                if(newAccessToken) {
                    localStorage.setItem('accessToken', newAccessToken)
                    const res = await axios.post(this.baseUrl + endpoint, data, { headers: { Authorization: `Bearer ${newAccessToken}` } })
                    return res.data
                }
            }
            this.handleError(error)
        }
    }   

    async get(endpoint: string) {
        const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        try {
            const res = await axios.get(this.baseUrl + endpoint, { headers })
            return res.data

        } catch (error: any) {
            if  (error.response.status == 401 && error.response.data.message.includes("TokenExpiredError")) {
                const newAccessToken = await this.refreshToken()
                if(newAccessToken) {
                    localStorage.setItem('accessToken', newAccessToken)
                    const res = await axios.get(this.baseUrl + endpoint, { headers: { Authorization: `Bearer ${newAccessToken}` } })
                    return res.data
                }
            }
          
            this.handleError(error)
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




export default Request