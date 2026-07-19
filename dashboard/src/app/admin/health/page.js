"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function SiteHealthPage() {
  const router = useRouter();
  
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cpuHistory, setCpuHistory] = useState([]);
  
  // RBAC
  const [canRead, setCanRead] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cs_rbac_permissions");
    if (stored) {
      try {
        const perms = JSON.parse(stored);
        if (perms.site_health && perms.site_health.read) {
          setCanRead(true);
        }
      } catch (err) {}
    }
    
    // Initial fetch
    fetchMetrics();
    
    // Poll every 3 seconds for live dashboard effect
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/health/metrics`, {
        credentials: "include"
      });
      const data = await res.json();
      
      if (data.success) {
        setMetrics(data.data);
        setError(null);
        
        // Update CPU History for the live chart (keep last 20 data points)
        setCpuHistory(prev => {
          const newPoint = { 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            cpu: parseFloat(data.data.system.cpu.usagePercent) 
          };
          const newHistory = [...prev, newPoint];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
      } else {
        if (res.status === 403 || res.status === 401) {
          setCanRead(false);
        } else {
          setError(data.message || "Failed to load metrics");
        }
      }
    } catch (err) {
      console.error("Health API Error:", err);
      setError("Network error connecting to health API");
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'var(--success-color)' : 'var(--danger-color)';
  };

  if (!canRead && !loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view the Site Health module.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "16px", flexWrap: "wrap", animation: "fadeIn 0.5s ease" }}>
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "700", color: "var(--text-color)" }}>Site Health & Monitoring</h2>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>Real-time server metrics, database performance, and audit logs.</p>
        </div>
      </div>

      {loading && !metrics ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div style={{ padding: "20px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "8px" }}>
          <strong>Error:</strong> {error}
        </div>
      ) : metrics && (
        <>
          {/* TOP METRICS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            
            {/* Server Status Card */}
            <div className="card" style={{ padding: "24px", borderLeft: "4px solid var(--primary-color)" }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>SERVER PLATFORM</div>
              <div style={{ fontSize: "24px", fontWeight: "700" }}>{metrics.system.os.platform} / {metrics.system.os.distro}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                Uptime: {Math.floor(metrics.system.os.uptime / 3600)}h {Math.floor((metrics.system.os.uptime % 3600) / 60)}m
              </div>
            </div>

            {/* DB Status Card */}
            <div className="card" style={{ padding: "24px", borderLeft: `4px solid ${getStatusColor(metrics.database.status)}` }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>DATABASE (MySQL)</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: getStatusColor(metrics.database.status) }}></div>
                <span style={{ fontSize: "24px", fontWeight: "700", textTransform: "capitalize" }}>{metrics.database.status}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>Ping: {metrics.database.responseTimeMs}ms • Size: {formatBytes(metrics.database.databaseSize)}</span>
                <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>{metrics.database.activeConnections} Connections</span>
              </div>
              {metrics.database.error && (
                <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace" }}>
                  {metrics.database.error}
                </div>
              )}
            </div>

            {/* Cloudinary Status Card */}
            <div className="card" style={{ padding: "24px", borderLeft: `4px solid ${getStatusColor(metrics.services.cloudinary.status)}` }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>CLOUDINARY STORAGE</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: getStatusColor(metrics.services.cloudinary.status) }}></div>
                <span style={{ fontSize: "24px", fontWeight: "700", textTransform: "capitalize" }}>{metrics.services.cloudinary.status}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                Ping: {metrics.services.cloudinary.responseTimeMs}ms
              </div>
              {metrics.services.cloudinary.error && (
                <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace" }}>
                  {metrics.services.cloudinary.error}
                </div>
              )}
            </div>

            {/* Frontend Status Card */}
            <div className="card" style={{ padding: "24px", borderLeft: `4px solid ${getStatusColor(metrics.services.frontend.status)}` }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>PUBLIC FRONTEND</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: getStatusColor(metrics.services.frontend.status) }}></div>
                <span style={{ fontSize: "24px", fontWeight: "700", textTransform: "capitalize" }}>{metrics.services.frontend.status}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                Ping: {metrics.services.frontend.responseTimeMs}ms
              </div>
              {metrics.services.frontend.error && (
                <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace" }}>
                  {metrics.services.frontend.error}
                </div>
              )}
            </div>

            {/* Email Service Status Card */}
            <div className="card" style={{ padding: "24px", borderLeft: `4px solid ${getStatusColor(metrics.services.email.status)}` }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>EMAIL SERVICE (RESEND)</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: getStatusColor(metrics.services.email.status) }}></div>
                <span style={{ fontSize: "24px", fontWeight: "700", textTransform: "capitalize" }}>{metrics.services.email.status}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                Ping: {metrics.services.email.responseTimeMs}ms
              </div>
              {metrics.services.email.error && (
                <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace" }}>
                  {metrics.services.email.error}
                </div>
              )}
            </div>

            {/* Backup Watchdog Status Card */}
            <div className="card" style={{ padding: "24px", borderLeft: `4px solid ${getStatusColor(metrics.services.watchdog.status)}` }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>BACKUP WATCHDOG</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: getStatusColor(metrics.services.watchdog.status) }}></div>
                <span style={{ fontSize: "24px", fontWeight: "700", textTransform: "capitalize" }}>{metrics.services.watchdog.status}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                Last Backup: {metrics.services.watchdog.lastBackup ? new Date(metrics.services.watchdog.lastBackup).toLocaleString() : 'None'}
              </div>
              {metrics.services.watchdog.error && (
                <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace" }}>
                  {metrics.services.watchdog.error}
                </div>
              )}
            </div>

            {/* Security Radar Status Card */}
            <div className="card" style={{ padding: "24px", borderLeft: `4px solid ${getStatusColor(metrics.services.security.status)}` }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>SECURITY RADAR</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: getStatusColor(metrics.services.security.status) }}></div>
                <span style={{ fontSize: "24px", fontWeight: "700", textTransform: "capitalize" }}>{metrics.services.security.status}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                Failed Logins (24h): {metrics.services.security.totalFailed24h}
              </div>
              {metrics.services.security.error && (
                <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "var(--danger-light)", color: "var(--danger-color)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace" }}>
                  {metrics.services.security.error}
                </div>
              )}
            </div>

            {/* Node Process RAM */}
            <div className="card" style={{ padding: "24px", borderLeft: "4px solid var(--primary-color)" }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>NODE.JS API MEMORY</div>
              <div style={{ fontSize: "24px", fontWeight: "700" }}>{formatBytes(metrics.nodeProcess.rss)}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                Heap Used: {formatBytes(metrics.nodeProcess.heapUsed)} / {formatBytes(metrics.nodeProcess.heapTotal)}
              </div>
            </div>

          </div>

          {/* CHARTS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
            
            {/* CPU Chart */}
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 20px 0" }}>Live CPU Usage ({metrics.system.cpu.cores} Cores)</h3>
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickMargin={10} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} unit="%" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "var(--surface-color)", borderColor: "var(--border-color)", borderRadius: "8px", color: "var(--text-color)" }}
                      itemStyle={{ color: "var(--primary-color)", fontWeight: "600" }}
                    />
                    <Area type="monotone" dataKey="cpu" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Memory & Disk */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="card" style={{ padding: "24px", flex: 1 }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 20px 0" }}>Memory (RAM)</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Used: {formatBytes(metrics.system.memory.used)}</span>
                  <span style={{ fontWeight: "600" }}>{metrics.system.memory.usagePercent}%</span>
                </div>
                <div style={{ width: "100%", height: "12px", backgroundColor: "var(--border-color)", borderRadius: "6px", overflow: "hidden", marginBottom: "8px" }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${metrics.system.memory.usagePercent}%`, 
                    backgroundColor: metrics.system.memory.usagePercent > 85 ? "var(--danger-color)" : "var(--primary-color)",
                    transition: "width 0.5s ease"
                  }}></div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "right" }}>Total: {formatBytes(metrics.system.memory.total)}</div>
              </div>

              <div className="card" style={{ padding: "24px", flex: 1 }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 20px 0" }}>Disk Space</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Used: {formatBytes(metrics.system.disk.used)}</span>
                  <span style={{ fontWeight: "600" }}>{metrics.system.disk.usagePercent}%</span>
                </div>
                <div style={{ width: "100%", height: "12px", backgroundColor: "var(--border-color)", borderRadius: "6px", overflow: "hidden", marginBottom: "8px" }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${metrics.system.disk.usagePercent}%`, 
                    backgroundColor: metrics.system.disk.usagePercent > 90 ? "var(--danger-color)" : "var(--success-color)",
                    transition: "width 0.5s ease"
                  }}></div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "right" }}>Free: {formatBytes(metrics.system.disk.available)}</div>
              </div>
            </div>

          </div>


        </>
      )}

      <style jsx global>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
