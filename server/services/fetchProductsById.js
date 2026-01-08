const JoonWebApi = require("./joonwebApi");
const productsCache = require("./cacheStore")

const fetchProductsByIds = async (id) => {
  try {
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const site = process.env.SITE;
    const api_version = process.env.API_VERSION;

    const api = new JoonWebApi(ACCESS_TOKEN, site, api_version);
    
    // starting with this ID
    console.log(`Fetching product: ${id}...`);
    
    const data  = await api.request(`products/${id}.json`);
    
    if (data && data.product) {
       productsCache.set(id, data.product);
       return data.product;
    }
  } catch (error) {
    console.log(error)
    console.error(`Failed ID ${id}: ${error.response ? error.response.status : error.message}`);
    productsCache.set(id, null);
  }
};

module.exports = fetchProductsByIds