import axios from "axios"

export const fetchProducts = async () => {
     const url = apiBuilder.buildUrl('reels/getProducts')
     const res = await axios.get(url)
     const { data } = res.data
     return data?.products || []
}