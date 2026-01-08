const axios = require("axios")

class JoonWebApi {
  constructor(accessToken = null, site = null, api_version, exchangeToken) {
    this.accessToken = accessToken
    this.site = site
    this.api_version = api_version
    this.timeout = 30000
    this.exchangeToken = exchangeToken
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken
    return this
  }

  async setExchangeToken(code, siteDomain) {
    const endpoint = "oauth/access_token"
    const url = `https://${siteDomain}.myjoonweb.com/api/admin/${this.api_version}/${endpoint}`

    const payload = {
      client_id: '',
      client_secret: '',
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
    if (!this.site) throw new Error("site is not set")
    if (!this.accessToken) throw new Error("accessToken is not set")
    if (!this.api_version) throw new Error("api_version is not set")

    const url = `https://${this.site}.myjoonweb.com/api/admin/${this.api_version}/${endpoint}`

    const response = await axios({
      url,
      method,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": `${process.env.APP_NAME}/v${process.env.APP_VERSION}`,
        "X-JoonWeb-Access-Token": this.accessToken
      },
      data: ["POST", "PUT", "PATCH"].includes(method) ? data : undefined
    })

    return response.data
  }
}

module.exports = JoonWebApi
