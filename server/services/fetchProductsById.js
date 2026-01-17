const JoonWebApi = require("./joonwebApi");
const productsCache = require("./cacheStore")

const fetchProductsByIds = async (id, site, access_token) => {
  console.log(id, site, access_token, "alll threee")
  try {
    console.log("fetch products is working")
    const api_version = process.env.API_VERSION;

    console.log(site, "site that is coming")

    const api = new JoonWebApi(access_token, site, api_version);
    
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