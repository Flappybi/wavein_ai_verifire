export async function analyzeText(text) {
  try {
    const response = await fetch("http://localhost:3001/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    console.log("📦 Data dari server:", data);
    return data;
  } catch (err) {
    console.error("❌ Gagal fetch:", err);
    return { label: "ERROR", confidence: 0, reason: "Tidak bisa terhubung ke server" };
  }
}
