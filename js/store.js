import config from "../config.js"
import { LegoStore } from "./vendors/store.js"
import PocketBase from "/node_modules/pocketbase/dist/pocketbase.es.js"
import page from "/node_modules/page/page.mjs"

const pb = new PocketBase(config.apiUrl)

class User {
  constructor(userData = {}) {
    const deliveries = userData.expand?.["deliveries(contractor)"] || []
    deliveries.sort((a, b) => a.end > b.end ? -1 : 1)
    Object.assign(this, userData, {
      projects: userData.expand?.projects || [],
      transfers: [],
      deliveries,
      totals: {
        deliveries: deliveries.reduce((total, delivery) => total + delivery.amount, 0) * .95,
        pending: deliveries.filter(d => d.status == "pending").reduce((total, d) => total + d.amount, 0) * .95,
        validated: deliveries.filter(d => d.status === "validated").reduce((total, d) => total + d.amount, 0) * .95,
      }
    })
  }
}

const state = {
  user: new User(),
  notification: { type: "danger", message: "" },
}

const actions = {
  init() {
    if(pb.authStore.isValid) {
      this.actions.authenticate(pb.authStore.model)
    }
  },

  async authenticate() {
    const contractorExpands = { expand: "projects.client,deliveries(contractor).project" }
    
    const userData = await pb.collection('contractors').authRefresh(contractorExpands)
    this.setState({ user: new User(userData.record), notification: state.notification /* reset notifications */ })
    
    pb.collection('contractors').subscribe("*", (e) => {
      this.setState({ user: new User(e.record) })
    }, contractorExpands)
    
    this.actions.redirect()
  },

  async login(email, password) {
    if (!email || !password) return

    try {
      const auth = await pb.collection("contractors").authWithPassword(email, password)
      this.actions.authenticate()
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
