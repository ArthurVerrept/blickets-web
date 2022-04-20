import axios from 'axios'

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
                localStorage.setItem('accessToken', newAccessToken)
                const res = await axios.post(this.baseUrl + endpoint, data, { headers: { Authorization: `Bearer ${newAccessToken}` } })
                return res.data
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
            if  (error.response.data.statusCode == 401 && error.response.data.message == "TokenExpiredError") {
                const newAccessToken = await this.refreshToken()
                localStorage.setItem('accessToken', newAccessToken)
                const res = await axios.get(this.baseUrl + endpoint, { headers: { Authorization: `Bearer ${newAccessToken}` } })
                return res.data
            }
            return error
        }
    }

    async refreshToken() {
        const headers = { Authorization: `Bearer ${localStorage.getItem('refreshToken')}` }
        const res = await axios.post(this.baseUrl + '/user/refresh-token', {}, { headers })
        return res.data.accessToken
    }
}


const request = new Request()

export default request