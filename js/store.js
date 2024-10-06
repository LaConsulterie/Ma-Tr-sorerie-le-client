import config from "../config.js"
import { LegoStore } from "./vendors/store.js"
import page from "/node_modules/page/page.mjs"

function api(url, options = {}) {
  const apiToken = localStorage.getItem("token") || ""
  let queryParams = ""
  if (!options.method || options.method.toLowerCase() === "get") {
    queryParams = "?" + new URLSearchParams(options.body)
    delete options.body
  }
  if (options.body) options.body = JSON.stringify(options.body)

  options = {
    ...{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiToken,
      },
    },
    ...options,
  }

  return fetch(`${config.apiUrl}${url}`, options)
}

class User {
  constructor(userData = {}) {
    Object.assign(this, userData)
  }

  get isAuthenticated() {
    return !!this.Email
  }
}

const state = {
  user: new User(),
  notification: { type: "danger", message: "" },
  financial: {
    totals: [0, 0, 0],
    deliveries: [],
    transfers: [],
  },
}

const actions = {
  init() {
    const token = localStorage.getItem("token")
    if (token) this.actions.authenticate()
  },

  async authenticate() {
    const response = await api("/me")
    if (!response.ok) return this.actions.logout()
    const user = await response.json()

    this.setState({
      user: new User(user),
      // reset notifications
      notification: state.notification,
    })

    this.actions.redirect()
  },

  async login(email, password) {
    if (!email || !password) return
    const response = await api("/login", {
      method: "POST",
      body: { email, password },
    })
    if (!response.ok) {
      console.error(response.status, await response.text())
      this.setState({
        notification: { type: "danger", message: "Votre nom d'utilisateur ou votre mot de passe est incorrect." },
      })
    }

    const { token } = await response.json()
    localStorage.setItem("token", token)
    this.actions.authenticate()
  },

  async logout() {
    localStorage.removeItem("token")
    this.setState(state)
  },

  redirect(url = "/") {
    page.redirect(url)
  },

  async loadFinancialData() {
    const response = await api("/financial")
    const data = await response.json()
    this.setState({ financial: data })
  },
}

const store = new LegoStore(state, actions)
store.actions.init()

// inject for export
store.page = page

// Globally available in the browser for convenience
window.store = store

export default store
