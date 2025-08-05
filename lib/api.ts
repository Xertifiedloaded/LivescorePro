import axios from "axios"

const API_BASE_URL = "/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: (credentials: { username: string; password: string }) => api.post("/auth/login", credentials),
  register: (userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
}

export const matchesApi = {
  getMatches: (params?: {
    league?: string
    status?: string
    limit?: number
    offset?: number
    dateFrom?: string
    dateTo?: string
  }) => api.get("/matches", { params }),
  getMatchById: (id: string) => api.get(`/matches/${id}`),
  getLiveMatches: () => api.get("/matches/live"),
  getTodayMatches: () => api.get("/today"),
  getWeekMatches: () => api.get("/public/matches/week"),
  getPopularMatches: () => api.get("/public/matches/popular"),
  getLeagues: () => api.get("/matches/leagues/all"),
  getCompetitionMatches: (
    code: string,
    params?: {
      limit?: number
      offset?: number
      status?: string
    },
  ) => api.get(`/matches/competition/${code}`, { params }),
}

export const predictionsApi = {
  createPrediction: (data: {
    matchId: number
    predictionType: "HOME" | "DRAW" | "AWAY"
    stakeAmount: number
  }) => {
    const payload = {
      matchId: Number(data.matchId),
      predictionType: data.predictionType,
      stakeAmount: Number(data.stakeAmount),
    }
    console.log("Sending prediction payload:", payload)
    return api.post("/predictions", payload)
  },
  getMyPredictions: (params?: {
    status?: string
    limit?: number
    offset?: number
  }) => api.get("/predictions/my", { params }),
  getMyStats: () => api.get("/predictions/stats"),
  getMatchPrediction: (matchId: number) => api.get(`/predictions/match/${matchId}`),
}

export const usersApi = {
  getBalance: () => api.get("/users/balance"),
  addFunds: (amount: number) => api.post("/users/add-funds", { amount }),
  updateProfile: (data: {
    firstName?: string
    lastName?: string
    email?: string
  }) => api.put("/users/profile", data),
}

export default api
