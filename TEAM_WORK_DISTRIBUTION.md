# 🚀 SOCIALSCOPE — 3-PERSON TEAM WORK DISTRIBUTION PLAN
**SIH Problem Statement 26152 — Multi-Platform Social Media Analytics & Audience Intelligence System**

---

## 📌 Executive Summary

SocialScope is a multi-dimensional social intelligence platform designed to ingest public social data across 6 platforms (X, Telegram, Reddit, Instagram, YouTube, Facebook), normalize it into a canonical schema, compute multi-dimensional sentiment/emotion/stance, discover topics, calculate trend velocity forecasts, map network topology/communities, and provide evidence-grounded AI explanations (RAG).

To maximize productivity and avoid code conflicts during the hackathon, the project is divided into **3 distinct, parallel roles with clear integration interfaces**.

---

## 👥 3-Developer Role Assignment Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TEAM LEADERSHIP                                      │
├───────────────────────────┬────────────────────────────┬───────────────────────────────┤
│    DEVELOPER 1 (DEV-1)    │    DEVELOPER 2 (DEV-2)     │      DEVELOPER 3 (DEV-3)      │
│  Frontend & UI/UX Lead    │  Backend & Data Ingestion  │   AI/ML, NLP & Graph Science   │
├───────────────────────────┼────────────────────────────┼───────────────────────────────┤
│ • React + TS & Tailwind   │ • Fast-API / Express Server│ • Sentiment, Emotion & Stance │
│ • Tactile/Clay Design Sys │ • Multi-Platform Scraping  │ • Topic Modeling & Embeddings │
│ • Recharts Data Visuals   │ • Canonical Schema Engine  │ • TrendScore & Forecasting    │
│ • State & Routing         │ • PostgreSQL / MongoDB     │ • Graph DB & Network Science  │
│ • Evidence Drawer & Views │ • WebSocket / SSE Stream   │ • RAG AI Analyst Engine       │
└───────────────────────────┴────────────────────────────┴───────────────────────────────┘
```

---

## 🎯 Detailed Developer Responsibilities

### 👤 DEVELOPER 1: Frontend & UI/UX Lead
**Primary Focus:** Client-side interface, data visualizations, design system, and user experience.

#### Core Modules Owned:
1. **Design System & Component Library (`src/components/ui/`)**
   - Maintain the *Tactile Intelligence / Soft-Industrial* theme (`ClayCard`, `MetricCard`, `PlatformBadge`, `ConfidenceBadge`, `DataFreshnessBadge`, `PartialResultBanner`).
   - Ensure responsive layout across Desktop (1440px), Tablet, and Mobile.
2. **Page Views (`src/pages/`)**
   - **Public Portal Landing Page:** Editorial hero, pipeline flowchart, tactical telemetry preview.
   - **Intelligence Overview Dashboard:** Summary KPIs, 24h sentiment shift area chart, live platform feeds.
   - **Data Collection Setup:** Query configuration forms, multi-platform checkboxes, item-count sliders.
   - **Topic Explorer & Trend Hub:** Topic cluster cards, trend rank list, prediction forecast badges.
   - **Network & Propagation Visualizer:** Interactive network topology canvas, community cards, temporal propagation stepper.
   - **Evidence Vault & Drawer:** Searchable canonical event list, slide-out drawer with JSON syntax highlighter.
   - **AI Analyst Workspace:** Structured non-ChatGPT response workspace with confidence indicators.
   - **Executive Report Builder:** Printable executive briefing layout with methodology notices.
3. **Frontend API Integration**
   - Replace mock data services (`src/services/mockData.ts`) with live REST/WebSocket calls to DEV-2's API server.

---

### 👤 DEVELOPER 2: Backend, Data Ingestion & System Infrastructure
**Primary Focus:** Platform connectors, data collection, normalization, database persistence, and API endpoints.

#### Core Modules Owned:
1. **Multi-Platform Data Collector Engine**
   - Implement connectors for:
     - **Essentials:** X (Twitter API / Scraper), Telegram (Telethon / Bot API).
     - **Desirable:** Instagram, Facebook.
     - **Appreciable:** Reddit (PRAW), YouTube (YouTube Data API v3).
   - Implement rate-limiting, error handling, retries, and target item-count cap logic (e.g. 1500 X items, 2000 Telegram messages).
2. **Canonical Event Normalization Pipeline**
   - Convert raw platform JSON payloads into the standardized `CanonicalSocialEvent` schema.
   - Perform deduplication based on content hashes and source IDs.
3. **Database Architecture & REST/WebSocket Server**
   - **PostgreSQL / MongoDB:** Schema setup for storing raw events, normalized canonical events, and collection job logs.
   - **FastAPI / Express Server:** Provide REST endpoints:
     - `POST /api/collection/start` — Launch collection job.
     - `GET /api/collection/status` — SSE/WebSocket stream of live item counts.
     - `GET /api/events` — Query normalized events with filtering.
     - `GET /api/platforms` — Data freshness & platform connector health.

---

### 👤 DEVELOPER 3: AI/ML, NLP, Trend Forecasting & Network Science Lead
**Primary Focus:** Machine learning models, NLP inference, topic discovery, network graph algorithms, and RAG engine.

#### Core Modules Owned:
1. **Multi-Dimensional Sentiment & Emotion Pipeline**
   - Fine-tuned BERT / RoBERTa model for multi-class sentiment (Positive, Negative, Neutral).
   - Emotion classification model (Joy, Anger, Fear, Anxiety, Excitement, Sadness, Surprise).
   - Policy stance detection (Supportive, Against, Neutral) and Sarcasm/Irony detection model.
2. **Topic Discovery & Embedding Clustering**
   - Generate embeddings using `SentenceTransformers` (`all-MiniLM-L6-v2`).
   - Cluster topics dynamically using HDBSCAN / BERTopic and extract top keywords.
3. **TrendScoring & Time-Series Forecasting Engine**
   - Implement the `TrendScore` heuristic formula:
     $$\text{TrendScore} = 0.35 \times \text{GrowthRate} + 0.25 \times \text{Velocity} + 0.20 \times \text{UserGrowth} + 0.10 \times \text{Spread} + 0.10 \times \text{Recency}$$
   - Predict +1h, +6h, +24h trend trajectory vectors.
4. **Network Graph & Community Detection (Neo4j / NetworkX)**
   - Construct graph topology from user mentions, replies, and reposts.
   - Compute node centrality metrics: **PageRank**, **Betweenness Centrality**, and **Degree**.
   - Execute **Louvain Modularity Community Detection** to identify key user clusters.
   - Track temporal information propagation path between communities.
5. **Evidence-Grounded RAG AI Analyst Engine**
   - Store event embeddings in vector database (ChromaDB / FAISS / Qdrant).
   - Build RAG pipeline: User Query → Retrieve Structured DB Metrics + Vector Evidence → Gemini / OpenAI LLM → Synthesized Response with Grounding Pointers.

---

## 🤝 Integration Contracts (API Handshakes)

To ensure seamless integration, the 3 developers will adhere to these exact schemas:

### 1. Canonical Social Event Contract (DEV-2 → DEV-1 & DEV-3)
```json
{
  "event_id": "evt_1001",
  "platform": "x",
  "event_type": "post",
  "source": { "source_id": "182947192", "url": "https://x.com/status/...", "collector": "x_api" },
  "author": { "user_id": "u_101", "username": "tech_analyst", "display_name": "Rajesh S." },
  "content": { "text": "AI regulation is essential...", "language": "en", "hashtags": ["AIRegulation"] },
  "engagement": { "likes": 1420, "comments": 184, "shares": 312, "views": 48000 },
  "timestamps": { "created_at": "2026-08-31T10:05:00Z", "collected_at": "2026-08-31T10:07:15Z" }
}
```

### 2. Analytical Inference Contract (DEV-3 → DEV-2 & DEV-1)
```json
{
  "event_id": "evt_1001",
  "analysis": {
    "sentiment": { "label": "positive", "score": 0.88 },
    "emotion": { "label": "joy", "score": 0.72 },
    "stance": { "label": "support", "score": 0.91 },
    "sarcasm": { "detected": false, "score": 0.04 }
  }
}
```

---

## 🗓️ Hackathon Execution Timeline

### ⏱️ Phase 1: Setup & Foundational Mocking (Hours 0 – 4)
- **DEV-1:** Setup React + TS frontend framework & design tokens (DONE ✅). Verify mock data rendering.
- **DEV-2:** Setup FastAPI project structure, DB schemas, and basic scraper scripts for X and Telegram.
- **DEV-3:** Setup HuggingFace/BERT pipelines, test sentence transformers, and setup ChromaDB instance.

### ⏱️ Phase 2: Core Feature Implementation (Hours 4 – 16)
- **DEV-1:** Build detailed interactive views for Sentiment, Topics, Trends, Networks, and AI Analyst.
- **DEV-2:** Connect all 6 platform scrapers, build canonical normalizer, and expose API endpoints.
- **DEV-3:** Run sentiment/emotion classification on ingested streams, construct Neo4j graph, and build RAG engine.

### ⏱️ Phase 3: Integration & End-to-End Testing (Hours 16 – 20)
- **DEV-1 + DEV-2:** Replace mock services with live API endpoints (`http://localhost:8000/api/...`).
- **DEV-2 + DEV-3:** Connect live data streams to NLP models and graph database.
- **DEV-1 + DEV-3:** Connect AI Analyst workspace to RAG API endpoint.

### ⏱️ Phase 4: Polish, Testing & Pitch Demo Preparation (Hours 20 – 24)
- Run full system end-to-end tests.
- Prepare live demo scenario (e.g. Monitoring "AI Regulation" across X, Telegram, and Reddit).
- Generate Executive Intelligence Report PDF export for jury presentation.
