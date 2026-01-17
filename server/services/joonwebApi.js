const axios = require("axios")

class JoonWebApi {
  constructor(access_token = null, site = null, api_version, exchangeToken) {
    this.access_token = access_token
    this.site = site
    this.api_version = api_version
    this.timeout = 30000
    this.exchangeToken = exchangeToken
  }

  setAccessToken(access_token) {
    this.access_token = access_token
    return this
  }

  async setExchangeToken(code, siteDomain) {
    const endpoint = "oauth/access_token"    
    const url = `https://${siteDomain}.myjoonweb.com/api/admin/${this.api_version}/${endpoint}`
    console.log(url)

    const payload = {
      client_id: '',
      client_secret: '' ,
      code
    }

    const response = await axios.post(url, {
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": `${process.env.APP_NAME}/v${process.env.APP_VERSION}`,
      }, 
      data:payload,     
    })

    return response
  }

  setSite(site) {
    this.site = site
    return this
  }

  setApiVersion(api_version) {
    this.api_version = api_version
    return this
  }

  request = async (endpoint, method = "GET", data = {}) => {
    console.log(this, "this object which contains token")
    if (!this.site) throw new Error("site is not set")
    if (!this.access_token) throw new Error("accessToken is not set")
    if (!this.api_version) throw new Error("api_version is not set")

    const site = this.site.replace(/\/$/, "")
    const url = `https://${site}/api/admin/${this.api_version}/${endpoint}`;
    
    console.log(url, 'generateddddd url')

    const response = await axios({
      url,
      method,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": `${process.env.APP_NAME}/v${process.env.APP_VERSION}`,
        "X-JoonWeb-Access-Token": this.access_token
      },
      data: ["POST", "PUT", "PATCH"].includes(method) ? data : undefined
    })

    return response.data
  }
}

module.exports = JoonWebApi
