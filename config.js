const env = document.location.hostname.includes("localhost") ? "dev" : "prod"

const config = {
  dev: {
    // apiUrl: "http://localhost:3000",
    apiUrl: "https://ma.consulterie.fr/api/",
  },
  prod: {
    apiUrl: "https://ma.consulterie.fr/api/",
  },
}

export default config[env]
