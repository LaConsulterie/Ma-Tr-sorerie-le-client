const env = document.location.hostname.includes("localhost")
  ? "dev"
  : "prod"

const config = {
  "dev": {
    // "apiUrl": "http://127.0.0.1:8090",
    "apiUrl": "https://ma.consulterie.fr",
  },
  "prod": {
    "apiUrl": "",
  }
}

export default config[env]
