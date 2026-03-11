const express = require("express");
const cors = require("cors");
const path = require("path");

// Load .env if present (for local dev)
try { require("dotenv").config(); } catch(e) {}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const RETELL_API_KEY = process.env.RETELL_API_KEY;

// Agent configuration
const AGENTS = {
  david: {
    agent_id: "agent_a4b75ab72a78e2a9f8645512d4",
    name: "Persiana Costa del Sol",
    owner: "David"
  },
  jose: {
    agent_id: "agent_09e3051589777b0e445f1fba8f",
    name: "Telecomunicaciones Caballero",
    owner: "Jose Antonio"
  }
};

// API endpoint: create a web call and return the access token
app.post("/api/create-call", async (req, res) => {
  const { agent } = req.body;
  const agentConfig = AGENTS[agent];

  if (!agentConfig) {
    return res.status(400).json({ error: "Invalid agent. Use 'david' or 'jose'." });
  }

  try {
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agent_id: agentConfig.agent_id
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Retell API error:", response.status, errorText);
      return res.status(response.status).json({ error: "Failed to create call", details: errorText });
    }

    const data = await response.json();
    res.json({
      access_token: data.access_token,
      call_id: data.call_id,
      agent_name: agentConfig.name
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error creating call" });
  }
});

// Serve agent pages
app.get("/david", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "call.html"));
});

app.get("/jose", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "call.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Retell Voice Demo running on http://localhost:${PORT}`);
  console.log(`  David:        http://localhost:${PORT}/david`);
  console.log(`  Jose Antonio: http://localhost:${PORT}/jose`);
});
