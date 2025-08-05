export const logServerRestart = () => {
  if (process.env.NODE_ENV === "development") {
    console.log("\n" + "=".repeat(50))
    console.log("🔄 SERVER RESTARTED")
    console.log("⏰ Time:", new Date().toLocaleString())
    console.log("🌍 Environment:", process.env.NODE_ENV)
    console.log("📡 Port:", process.env.PORT || 3000)
    console.log("=".repeat(50) + "\n")
  }
}

export const logFileChange = (filename) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`📝 File changed: ${filename}`)
  }
}

export const setupDevLogging = () => {
  if (process.env.NODE_ENV === "development") {
    process.once("SIGUSR2", () => {
      logServerRestart()
      process.kill(process.pid, "SIGUSR2")
    })
  }
}
