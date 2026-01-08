import axios from "axios"

export const fetchLibrary = async () => {
    return [
    { id: 101, title: 'Summer Sale', thumb: '...' },
    { id: 102, title: 'New Arrival', thumb: '...' },
  ];
    const url = apiBuilder.buildUrl('library')
    const res = await axios.get(url)
    const { data } = res.data
    return data?.reels || []
}

// export const editReel = async ({ _id, payload }) => {
//     const url = apiBuilder.buildUrl('reels', _id)
//     const res = await axios.patch(url, payload);
//     return res.data
// }

// export const deleteReel = async ({ _id }) => {
//     const url = apiBuilder.buildUrl('reels', _id)

//     const res = await axios.delete(url)
//     return res.data
// }
