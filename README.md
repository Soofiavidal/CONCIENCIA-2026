FloodMirror AI 🌊


Flood risk visualization platform for urban areas with limited data — built in 48 hours at the Urban Resilience Hackathon.




🧠 What it does

FloodMirror AI predicts flood risk in urban zones using spatial variables and terrain characteristics. It displays real-time risk data on an interactive map, helping communities and institutions make informed decisions even in data-scarce environments.


✨ Key Features


🗺️ Interactive risk map — real-time flood risk visualization by urban zone
🤖 Mirror Algorithm — AI-powered predictive model using spatial and terrain features
🔒 Privacy by Design — geolocation processed client-side only, no mandatory user registration, aligned with Mexican data protection law (LFPDPPP)
⚡ High availability — 100% uptime during the hackathon demo window
🚀 CI/CD pipeline — automated deployments via GitHub Actions + Vercel



🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Mapping | Mapbox GL JS |
| Styling | Tailwind CSS |
| AI Model | Mirror Algorithm (custom) |
| DevOps | GitHub Actions, Vercel |
| Data Privacy | LFPDPPP-compliant architecture |

🏗️ Architecture

src/
├── components/        # Reusable UI components
├── pages/             # App views
├── hooks/             # Custom React hooks
├── services/          # API calls and AI model integration
├── utils/             # Helper functions
└── types/             # TypeScript type definitions


🚀 Getting Started

bash# Clone the repository
git clone https://github.com/Soofiavidal/CONCIENCIA-2026.git

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build


👩‍💻 Built by

Sofia Vidal Vázquez — Frontend Lead & Data Governance

LinkedIn · https://www.linkedin.com/in/sofiavidal-/


📅 Context

Built at the Urban Resilience Hackathon · June 2025

48-hour intensive development sprint under high-pressure conditions.
