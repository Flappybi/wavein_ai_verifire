import React, { useState, useEffect } from "react";
import { WalletKitProvider, useWalletKit, ConnectButton } from "@mysten/wallet-kit";
import { analyzeText } from "./services/aiService";
import { saveVerification } from "./verifyAI";
import waveinLogo from "./assets/wavein-logo.png";

// SplashScreen component: visually enhanced with animation and your Wavein logo
function SplashScreen() {
  return (
    <>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.9); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow:
              0 0 10px #7efaff,
              0 0 20px #76b5ff,
              0 0 30px #5a99ff;
          }
          50% {
            box-shadow:
              0 0 20px #7efaff,
              0 0 30px #76b5ff,
              0 0 40px #5a99ff;
          }
        }

        .splash-wrapper {
          height: 100vh;
          width: 100vw;
          background-color: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          animation: fadeInOut 2.5s ease forwards;
        }

        .logo-container {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          animation: glowPulse 2.5s ease infinite;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }

        .logo-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 5px solid;
          border-image-slice: 1;
          border-image-source: linear-gradient(45deg, #6bc9ff, #b46aff);
          animation: rotateRing 4s linear infinite;
          box-sizing: border-box;
          top: 0;
          left: 0;
          z-index: 1;
        }

        @keyframes rotateRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .logo-image {
          width: 140px;
          height: 140px;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 4px rgba(120, 180, 255, 0.7));
          user-select: none;
        }

        .splash-text {
          color: white;
          font-weight: 700;
          font-size: 2rem;
          text-align: center;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          text-shadow: 0 0 5px rgba(110, 160, 255, 0.8);
        }
      `}</style>

      <div className="splash-wrapper" aria-label="Loading Wavein AI Verifier">
        <div className="logo-container" aria-hidden="true">
          <div className="logo-ring" />
          <img
            src={waveinLogo}
            alt="Wavein AI Verifier logo"
            className="logo-image"
            draggable={false}
          />
        </div>
        <div className="splash-text">Wavein AI Verifier</div>
      </div>
    </>
  );
}

function AppContent() {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToVerifier = () => {
    document.getElementById('verifier-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return alert("Masukkan teks dulu!");
    setLoading(true);
    setResult(null);

    try {
      const hasil = await analyzeText(text);
      setResult(hasil);

      setHistory(prev => [...prev, {
        id: Date.now(),
        text: text.trim(),
        result: hasil,
        timestamp: new Date()
      }]);

      if (currentAccount) {
        await saveVerification(currentAccount, text, hasil, signAndExecuteTransactionBlock);
        alert("✅ Hasil analisis disimpan ke blockchain!");
      } else {
        alert("⚠️ Hubungkan wallet dulu sebelum menyimpan ke blockchain!");
      }
    } catch (err) {
      console.error(err);
      const errorResult = { label: "ERROR", confidence: 0, reason: "Gagal menganalisis teks" };
      setResult(errorResult);
      setHistory(prev => [...prev, {
        id: Date.now(),
        text: text.trim(),
        result: errorResult,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, #000000 0%, #add8e6 100%)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      overflow: "auto",
      scrollBehavior: "smooth"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#000000",
        padding: "20px 40px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <img
            src={waveinLogo}
            alt="Wavein AI Verifier logo"
            style={{
              width: "50px",
              height: "50px",
              filter: "drop-shadow(0 0 4px rgba(173, 216, 230, 0.7))"
            }}
          />
          <h1 style={{
            margin: 0,
            color: "#add8e6",
            fontSize: "2rem",
            fontWeight: "bold",
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
          }}>
            Wavein AI Verifier
          </h1>
        </div>
        <ConnectButton />
      </header>

      {/* Introduction Section */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #add8e6 100%)",
        position: "relative"
      }}>
        <div style={{
          maxWidth: "800px",
          textAlign: "center",
          color: "#fff"
        }}>
          <h1 style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px 10px rgba(173, 216, 230, 0.5)",
            background: "linear-gradient(90deg, #add8e6, #fff, #add8e6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
            animation: "shimmer 3s linear infinite"
          }}>
            Welcome to Wavein AI Verifier
          </h1>
          <style>
            {`
              @keyframes shimmer {
                0% { background-position: 0% center; }
                100% { background-position: 200% center; }
              }
            `}
          </style>
          
          <p style={{
            fontSize: "1.3rem",
            marginBottom: "30px",
            color: "#add8e6",
            lineHeight: "1.8"
          }}>
            Detect AI-generated content with confidence using blockchain-powered verification. 
            Our advanced AI analyzes text to determine whether it's human-written or AI-generated, 
            storing results securely on the blockchain for transparency and trust.
          </p>
          
          <div style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            marginBottom: "40px",
            flexWrap: "wrap"
          }}>
            <div style={{
              backgroundColor: "rgba(173, 216, 230, 0.1)",
              padding: "20px",
              borderRadius: "12px",
              border: "2px solid #add8e6",
              flex: "1",
              minWidth: "200px",
              maxWidth: "250px"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🔍</div>
              <h3 style={{ color: "#add8e6", marginBottom: "10px" }}>AI Detection</h3>
              <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
                Advanced analysis to identify AI-generated content
              </p>
            </div>
            
            <div style={{
              backgroundColor: "rgba(173, 216, 230, 0.1)",
              padding: "20px",
              borderRadius: "12px",
              border: "2px solid #add8e6",
              flex: "1",
              minWidth: "200px",
              maxWidth: "250px"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>⛓️</div>
              <h3 style={{ color: "#add8e6", marginBottom: "10px" }}>Blockchain</h3>
              <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
                Secure and transparent verification on-chain
              </p>
            </div>
            
            <div style={{
              backgroundColor: "rgba(173, 216, 230, 0.1)",
              padding: "20px",
              borderRadius: "12px",
              border: "2px solid #add8e6",
              flex: "1",
              minWidth: "200px",
              maxWidth: "250px"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📊</div>
              <h3 style={{ color: "#add8e6", marginBottom: "10px" }}>History</h3>
              <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
                Track all your verifications in one place
              </p>
            </div>
          </div>
          
          <button
            onClick={scrollToVerifier}
            style={{
              padding: "18px 40px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              backgroundColor: "#add8e6",
              color: "#000",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 6px 20px rgba(173, 216, 230, 0.4)",
              animation: "pulse 2s ease-in-out infinite"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#fff";
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "0 10px 30px rgba(173, 216, 230, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#add8e6";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 6px 20px rgba(173, 216, 230, 0.4)";
            }}
          >
            🚀 Start Verifying
          </button>
          
          <div style={{
            position: "absolute",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2s ease-in-out infinite"
          }}>
            <style>
              {`
                @keyframes bounce {
                  0%, 100% { transform: translateX(-50%) translateY(0); }
                  50% { transform: translateX(-50%) translateY(10px); }
                }
              `}
            </style>
            <div style={{
              fontSize: "2rem",
              color: "#add8e6",
              opacity: 0.7
            }}>
              ↓
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Verifier Section */}
      <div id="verifier-section" style={{
        minHeight: "100vh",
        display: "flex",
        overflow: "hidden"
      }}>
        {/* History Chat Section */}
        <div style={{
          flex: 1,
          backgroundColor: "#1a1a1a",
          padding: "20px",
          overflowY: "auto",
          borderRight: "1px solid #add8e6"
        }}>
          <h2 style={{
            marginTop: 0,
            color: "#add8e6",
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "20px"
          }}>
            📜 History Chat
          </h2>
          {history.length === 0 ? (
            <p style={{
              textAlign: "center",
              color: "#add8e6",
              fontStyle: "italic"
            }}>
              There has been no previous analysis.
            </p>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              {history.slice().reverse().map((item) => (
                <div key={item.id} style={{
                  backgroundColor: "#333",
                  borderRadius: "8px",
                  padding: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  border: "1px solid #add8e6"
                }}>
                  <div style={{
                    fontSize: "0.8rem",
                    color: "#add8e6",
                    marginBottom: "8px"
                  }}>
                    {item.timestamp.toLocaleString()}
                  </div>
                  <div style={{
                    marginBottom: "8px",
                    fontWeight: "bold",
                    color: "#ffffff"
                  }}>
                    Teks: "{item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text}"
                  </div>
                  <div style={{
                    padding: "8px",
                    borderRadius: "6px",
                    backgroundColor:
                      item.result.label === "AI"
                        ? "#ffe6e6"
                        : item.result.label === "HUMAN"
                        ? "#e6ffe6"
                        : "#f5f5f5",
                    border: `1px solid ${
                      item.result.label === "AI"
                        ? "#ff6b6b"
                        : item.result.label === "HUMAN"
                        ? "#4ecdc4"
                        : "#add8e6"
                    }`
                  }}>
                    <strong style={{ color: "#333" }}>Label:</strong> <span style={{
                      color: item.result.label === "AI" ? "#ff6b6b" : item.result.label === "HUMAN" ? "#4ecdc4" : "#333"
                    }}>{item.result.label}</span><br />
                    <strong style={{ color: "#333" }}>Confidence:</strong> {item.result.confidence}%<br />
                    <strong style={{ color: "#333" }}>Reason:</strong> {item.result.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Verifier Section */}
        <div style={{
          flex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          overflowY: "auto"
        }}>
          <div style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            padding: "40px",
            maxWidth: "600px",
            width: "100%",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              background: "linear-gradient(90deg, #add8e6, #000000, #add8e6)",
              backgroundSize: "400% 400%",
              animation: "gradientShift 4s ease infinite"
            }}></div>
            <style>
              {`
                @keyframes gradientShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}
            </style>

            <div style={{
              marginBottom: "20px"
            }}>
              <label style={{
                display: "block",
                marginBottom: "10px",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#333"
              }}>
                Enter Text for Analysis:
              </label>
              <textarea
                rows="5"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text for analysis..."
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "16px",
                  border: "2px solid #add8e6",
                  borderRadius: "12px",
                  outline: "none",
                  resize: "vertical",
                  transition: "border-color 0.3s ease",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff"
                }}
                onFocus={(e) => e.target.style.borderColor = "#000000"}
                onBlur={(e) => e.target.style.borderColor = "#add8e6"}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                marginTop: "10px",
                padding: "15px 30px",
                fontSize: "18px",
                fontWeight: "bold",
                backgroundColor: loading ? "#666" : "#000000",
                color: "#add8e6",
                border: "none",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: loading ? "none" : "0 4px 15px rgba(0, 0, 0, 0.3)",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#add8e6";
                  e.target.style.color = "#000000";
                  e.target.style.boxShadow = "0 6px 20px rgba(173, 216, 230, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#000000";
                  e.target.style.color = "#add8e6";
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
                }
              }}
            >
              {loading ? "🔄 Analyze..." : "🚀 Analyze & Save"}
            </button>

            {result && (
              <div
                style={{
                  marginTop: "30px",
                  padding: "20px",
                  borderRadius: "12px",
                  backgroundColor:
                    result.label === "AI"
                      ? "#ffe6e6"
                      : result.label === "HUMAN"
                      ? "#e6ffe6"
                      : "#f5f5f5",
                  border: `2px solid ${
                    result.label === "AI"
                      ? "#ff6b6b"
                      : result.label === "HUMAN"
                      ? "#4ecdc4"
                      : "#add8e6"
                  }`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  animation: "fadeIn 0.5s ease-in"
                }}
              >
                <style>
                  {`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(20px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}
                </style>
                <h3 style={{
                  marginTop: 0,
                  color: "#333",
                  fontSize: "1.5rem",
                  display: "flex",
                  alignItems: "center"
                }}>
                  🧠 Analysis Results
                </h3>
                <div style={{ marginBottom: "10px" }}>
                  <strong style={{ color: "#555" }}>Label:</strong>{" "}
                  <span style={{
                    fontWeight: "bold",
                    color: result.label === "AI" ? "#ff6b6b" : result.label === "HUMAN" ? "#4ecdc4" : "#333"
                  }}>
                    {result.label}
                  </span>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong style={{ color: "#555" }}>Confidence:</strong>{" "}
                  <span style={{ fontWeight: "bold" }}>{result.confidence}%</span>
                </div>
                <div>
                  <strong style={{ color: "#555" }}>Reason:</strong>{" "}
                  <span>{result.reason}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
  backgroundColor: "#000",
  color: "#add8e6",
  textAlign: "center",
  padding: "20px 0",
  fontSize: "0.9rem",
  borderTop: "1px solid #add8e6"
}}>
  <div style={{ marginBottom: "15px" }}>
    © 2025 Wavein AI Verifier — Built by Samuel Pudjo Prabowo 🚀
  </div>
  <div style={{
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    alignItems: "center"
  }}>
    {/* Instagram */}
    <a
      href="https://www.instagram.com/wavein.ai"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#add8e6",
        textDecoration: "none",
        fontSize: "1.5rem",
        transition: "all 0.3s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <img
        src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg"
        alt="Instagram"
        style={{
          width: "24px",
          height: "24px",
          filter: "invert(80%) sepia(20%) saturate(300%) hue-rotate(180deg)"
        }}
      />
      Instagram
    </a>

    {/* YouTube */}
    <a
      href="https://www.youtube.com/@wavein.ai"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#add8e6",
        textDecoration: "none",
        fontSize: "1.5rem",
        transition: "all 0.3s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <img
        src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg"
        alt="YouTube"
        style={{
          width: "26px",
          height: "26px",
          filter: "invert(80%) sepia(20%) saturate(300%) hue-rotate(180deg)"
        }}
      />
      YouTube
    </a>
  </div>
</footer>
    </div>
  );
}

function App() {
  return (
    <WalletKitProvider>
      <AppContent />
    </WalletKitProvider>
  );
}

export default App;
