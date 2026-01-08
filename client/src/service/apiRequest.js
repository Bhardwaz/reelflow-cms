import apiClient from "./apiClient"

export const apiRequest = async ({ method, url, data = undefined, params = null }) => {
    try {
        const response = await apiClient({
             method,
             url,
             data,
             params
        })
        return response 
    } catch (error) {
        console.log(error)
        throw error
    }
}