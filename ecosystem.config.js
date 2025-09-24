module.exports = {
  apps: [
    {
      name: "backend",
      script: "src/server.js",
      cwd: "D:/Usuarios/Frenos y Servicios/Desktop/Software/Inventory-Alert-System-Frenos-Servicios/backend",
      interpreter: "node"
    },
    {
      name: "frontend",
      script: "npm",
      args: "run dev -- --host",
      cwd: "D:/Usuarios/Frenos y Servicios/Desktop/Software/Inventory-Alert-System-Frenos-Servicios/frontend",
      interpreter: "none"
    }
  ]
};
