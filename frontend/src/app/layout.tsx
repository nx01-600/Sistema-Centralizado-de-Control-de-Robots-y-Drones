import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Sistema de Gestión de Robots y Drones - PUJ Cali",
  description: "Demo - Sistema centralizado para gestión de robots y drones universitarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {/* Header */}
        <header className="main-header">
          <div className="main-header-container">
            <h1>Sistema de Gestión de Robots y Drones</h1>
            <p>Pontificia Universidad Javeriana Cali</p>
          </div>
        </header>

        {/* Main content */}
        <main className="main-content">
          {children}
        </main>

        {/* REQNF.4: Footer con información del sistema */}
        <footer className="system-footer">
          <div className="system-footer-container">
            <div className="system-footer-grid">
              <div>
                <h4>Desarrolladores</h4>
                <ul>
                  <li>Daniel Felipe Barrera Zapata</li>
                  <li>Nicolás Carreño Tascón</li>
                  <li>María Camila Guzmán Bolaños</li>
                </ul>
              </div>
              <div>
                <h4>Institución</h4>
                <ul>
                  <li>Pontificia Universidad Javeriana Cali</li>
                  <li>Facultad de Ingeniería y Ciencias</li>
                  <li>Ingeniería de Sistemas y Computación</li>
                  <li>Cali, Colombia</li>
                </ul>
              </div>
              <div>
                <h4>Sistema</h4>
                <ul>
                  <li><strong>Usuario previsto:</strong> Administrativo PUJ Cali</li>
                  <li><strong>Versión:</strong> 1.0.0</li>
                  <li><strong>Fecha:</strong> Octubre 2025</li>
                </ul>
                <div className="prototipo-badge">
                  ⚠️ Este es un prototipo académico desarrollado con fines educativos.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
