const env = document.location.hostname.includes("localhost") ? "dev" : "prod"

const config = {
  dev: {
    apiUrl: "http://localhost:3000",
  },
  prod: {
    apiUrl: "https://ma.consulterie.fr/api/",
  },
}

export default config[env]
