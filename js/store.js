import config from "../config.js"
import { LegoStore } from "./vendors/store.js"
import PocketBase from "/node_modules/pocketbase/dist/pocketbase.es.js"
import page from "/node_modules/page/page.mjs"

const pb = new PocketBase(config.apiUrl)

const state = {
  user: {},
  notification: { type: "danger", message: "" },
}

const actions = {
  init() {
    if(pb.authStore.isValid) {
      this.actions.authenticate(pb.authStore.model)
    }
  },

  authenticate(userData = {}) {
    const deliveries = userData.expand?.["deliveries(contractor)"] || []
    const user = Object.assign({}, userData, {
      projects: userData.expand?.projects || [],
      deliveries,
      totals: {
        deliveries: deliveries.reduce((total, delivery) => total + delivery.amount, 0),
        pending: deliveries.filter(d => d.status == "").reduce((total, d) => total + d.amount, 0),
        paid: deliveries.filter(d => d.status === "paid").reduce((total, d) => total + d.amount, 0),
      }
    })
    this.setState({ user, notification: state.notification /* reset notifications */ })
    this.actions.redirect()
  },

  async login(email, password) {
    if (!email || !password) return

    try {
      const auth = await pb.collection("contractors").authWithPassword(email, password,
        { expand: "projects.client,deliveries(contractor).project" })
      localStorage.setItem("auth", JSON.stringify(auth.record))
      this.actions.authenticate(auth.record)
    }
    catch (error) {
      if (error.response?.code === 400) {
        this.setState({ notification: { type: "danger", message: "Votre nom d'utilisateur ou votre mot de passe est incorrect." } })
      } else throw error
      return
    }
  },

  async logout() {
    pb.authStore.clear()
    this.setState(state)
  },

  redirect(url="/") {
    page.redirect(url)
  }
}

const store = new LegoStore(state, actions)
store.actions.init()

// inject for export
store.page = page

export default store
