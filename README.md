# VICSTA Hackathon – Grand Finale
**VIT College, Kondhwa Campus | 5th – 6th March**

---

## Team Details

# 🎯 Project Rio — ThreatSense AI-DVR

> *"The world is not enough — but it is such a perfect place to start."* — James Bond

**A full-stack AI surveillance system built on ₹720 hardware that delivers enterprise-grade behavioural threat intelligence — with face recognition, real-time alerts, and a cinematic ops-center dashboard.**

---

## 🏴‍☠️ Team Pirate2Pirate — VICSTA HackArena '26

| | |
|---|---|
| **Team** | Pirate2Pirate |
| **Members** | Prashant Sandeep Gharge, Sweeta Gitte, Archit Jedge, Deven Kumbhar |
| **Problem** | PS-01 — ThreatSense AI-DVR |
| **Theme** | Productivity & Security |
| **Venue** | VIT College, Kondhwa Campus · 5–6 March 2026 |

---

## 📸 System Overview

```
HC-SR04 Sensor ──► ESP32-CAM ──► HTTP POST ──► Python AI Hub ──► Flask Dashboard
                                                      │                   │
                                               Telegram Alerts      ngrok (Web)
                                               (.mp4 video clips)   (Public URL)
```

The system works in two modes:
- **Webcam mode** — plug and play for development (`python main.py`)
- **ESP32 mode** — deploy on physical hardware, triggered by proximity sensor

---

## ⚡ Features

### 👤 Face Recognition
- Drop photos in `known_faces/PersonName.jpg` — auto-loaded on startup
- **Green box + name** → known person (no alert, SDP blur applied)
- **Yellow box + TRESPASSER** → unrecognised face (10s clip + Telegram)
- Face cache per track ID — CPU optimised, runs every 4 frames

### 🚨 4-Level Threat Classification

| Level | Trigger | Clip | Alert |
|-------|---------|------|-------|
| 🔴 **RED** | Gang / Night intruder / Running / Repeat offender | 15s | 🚨🚨🚨 URGENT |
| 🟠 **HIGH** | Masked face or loitering unknown (>3s) | 10s | 🚨 Alert |
| 🟡 **YELLOW** | Unrecognised face detected | 10s | ⚠️ Warning |
| 🟢 **LOW** | Known recognised person | — | ✅ No alert |

### ⚡ RED Alert — 4 Automatic Escalations
1. 🌑 **Night Intruder** — unknown person in dark environment (luminance < 55)
2. 👥 **Gang Detection** — 2+ unknown persons simultaneously in frame
3. 🏃 **Running** — subject bounding box velocity > 18px/frame
4. 🔁 **Repeat Offender** — same unknown face returns 3+ times in session

### 🎭 Software Defined Privacy (SDP)
- Known persons: face region **Gaussian-blurred** in real time
- Unknown / threat subjects: **full HD** maintained for evidence
- Zero storage of authorised individuals

### 📱 Telegram Alerts
- Rich markdown messages with icons and threat details
- `.mp4` video clips via ffmpeg (inline playback in Telegram)
- 60-second per-level Intelligence Buffer (no spam)
- RED, HIGH, YELLOW cooldowns operate independently

### 🌐 Cinematic Dashboard
- Full-bleed live feed — no sidebars, no cards, data floats as overlays
- Animated scan lines, corner targeting brackets, classified ticker
- Boot sequence on load, red screen flash on new alerts
- ngrok public URL — share with anyone, access from anywhere
- `⚠ THREAT DETECTED` overlay fires **only** for actual threats, not known faces

---

## 🛠️ Hardware

| Component | Part | Notes |
|-----------|------|-------|
| Microcontroller | ESP32-CAM-MB (AI-Thinker) | Built-in USB programmer |
| Proximity Sensor | HC-SR04 Ultrasonic | 150cm trigger range |
| Camera | OV2640 (built-in) | VGA JPEG streaming |
| Hub | Any Python 3.10+ PC | Runs all AI inference |

### HC-SR04 Wiring
```
HC-SR04 VCC  → ESP32 5V
HC-SR04 GND  → ESP32 GND
HC-SR04 Trig → GPIO 12
HC-SR04 Echo → GPIO 13
```

---

## 🚀 Setup & Installation

### 1. Clone & Install Python dependencies
```bash
cd D:\Rio\rio
python setup.py
pip install face_recognition pyngrok requests ultralytics flask
```

### 2. Configure `.env`
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
NGROK_AUTHTOKEN=your_ngrok_token_here
VIDEO_SOURCE=0
THREAT_CONFIDENCE=0.50
LOITER_SECONDS=3
ALERT_COOLDOWN_SECONDS=60
KNOWN_FACES_DIR=known_faces/
```

### 3. Add known faces
```
known_faces/
├── Prashant.jpg
├── Sweeta.jpg
└── YourName.jpg
```
One clear, front-facing photo per person. File name = person's name.

### 4. Install ffmpeg (for mp4 clips on Telegram)
Download from https://ffmpeg.org/download.html → extract → add `bin/` to PATH.

### 5. Run
```bash
python main.py
```
Dashboard live at → `http://localhost:5000`

---

## 📡 ESP32 Firmware Setup

### Arduino IDE Setup
1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board URL in Preferences:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Tools → Board → **AI Thinker ESP32-CAM**

### Flash the sketch
1. Open `esp32_cam_rio.ino`
2. Fill in your credentials:
   ```cpp
   const char* WIFI_SSID  = "YourWiFiName";
   const char* WIFI_PASS  = "YourWiFiPassword";
   const char* HUB_IP     = "192.168.x.x";   // your PC IP (run ipconfig)
   ```
3. Upload via ESP32-CAM-MB USB

### Behaviour
- Polls HC-SR04 every 200ms at 5fps (idle)
- Person within 150cm → streams frames at ~20fps via HTTP POST to `/frame`
- No presence for 10 seconds → returns to standby

---

## 📁 Project Structure

```
D:\Rio\rio\
├── main.py                          # Entry point / orchestrator
├── esp32_cam_rio.ino                # ESP32 Arduino firmware
├── known_faces/                     # Drop face photos here
├── clips/                           # Auto-saved threat clips (.mp4)
├── logs/                            # System logs
├── .env                             # Credentials (never commit!)
│
├── app/
│   ├── core/
│   │   ├── analyzer.py              # YOLOv8 + face rec + motion pipeline
│   │   ├── face_recognizer.py       # Face DB loading + live recognition
│   │   ├── motion_analyzer.py       # Speed, night, repeat visit tracking
│   │   ├── alert_manager.py         # Clip recording + alert dispatch
│   │   ├── fps_controller.py        # Adaptive FPS (MONITOR / EVIDENCE)
│   │   ├── capture.py               # Webcam + ESP32 frame source
│   │   └── hud.py                   # Frame HUD overlay
│   │
│   ├── api/
│   │   ├── server.py                # Flask app factory
│   │   ├── stream.py                # MJPEG live stream endpoint
│   │   ├── ingest.py                # /frame — ESP32 POST receiver
│   │   ├── status.py                # /api/status JSON
│   │   └── dashboard.py             # / route → spy thriller UI
│   │
│   ├── models/
│   │   ├── threat.py                # ThreatLevel enum (RED/HIGH/YELLOW/LOW)
│   │   ├── detection.py             # Detection dataclass
│   │   └── app_state.py             # Shared state between threads
│   │
│   ├── services/
│   │   ├── telegram_notifier.py     # Telegram rich alerts + video
│   │   └── ngrok_tunnel.py          # Public URL tunnel
│   │
│   └── templates/
│       └── index.html               # Cinematic spy-thriller dashboard
│
└── config/
    └── settings.py                  # All configuration / env loading
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Spy thriller dashboard |
| `/stream` | GET | MJPEG live camera feed |
| `/frame` | POST | ESP32-CAM frame ingestion |
| `/api/status` | GET | System status JSON |
| `/api/events` | GET | Recent alert log JSON |

---

## ⚙️ Configuration Reference

| Key | Default | Description |
|-----|---------|-------------|
| `THREAT_CONFIDENCE` | `0.50` | Minimum YOLO detection confidence |
| `LOITER_SECONDS` | `3` | Seconds before unknown triggers HIGH |
| `ALERT_COOLDOWN_SECONDS` | `60` | Intelligence Buffer duration |
| `TRIGGER_DISTANCE_CM` | `150` | HC-SR04 wake distance |
| `KNOWN_FACES_DIR` | `known_faces/` | Face database directory |
| `SPEED_THRESHOLD` | `18.0` | px/frame to flag as running |
| `NIGHT_BRIGHTNESS_THRESHOLD` | `55.0` | Mean luminance for night mode |
| `REPEAT_VISIT_THRESHOLD` | `3` | Visits before repeat offender RED |
| `INFER_WIDTH` | `480` | Frame width for YOLO inference (latency) |

---

## 📦 Attribution

| Library | License | Purpose |
|---------|---------|---------|
| [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) | AGPL-3.0 | Person detection + pose estimation |
| [face_recognition](https://github.com/ageitgey/face_recognition) | MIT | Face encoding and matching |
| [OpenCV](https://opencv.org) | Apache 2.0 | Frame processing and MJPEG encoding |
| [Flask](https://flask.palletsprojects.com) | BSD-3-Clause | Web server and dashboard API |
| [requests](https://requests.readthedocs.io) | Apache 2.0 | Telegram API calls |
| [pyngrok](https://github.com/alexdlaird/pyngrok) | MIT | Public tunnel for remote access |
| [PyTorch](https://pytorch.org) | BSD-3-Clause | YOLOv8 inference backend |
| [NumPy](https://numpy.org) | BSD-3-Clause | Array operations |
| [ffmpeg](https://ffmpeg.org) | LGPL 2.1+ | AVI → MP4 conversion |
| [Arduino ESP32 Core](https://github.com/espressif/arduino-esp32) | LGPL-2.1 | ESP32 firmware |
| [Google Fonts](https://fonts.google.com) (VT323, Bebas Neue) | OFL-1.1 | Dashboard typography |

---

## 💰 Cost Comparison

| | Enterprise AI-CCTV | Project Rio |
|--|--|--|
| **Cost per node** | ₹50,000+ | ₹720 |
| **Privacy** | Records everyone raw | SDP — known persons blurred |
| **Detection** | Simple motion | Behavioural AI + face recognition |
| **Alerts** | Delayed / manual review | Real-time Telegram + video clip |
| **Remote access** | Proprietary app | ngrok public URL |

**98.6% cheaper. 100% smarter.**

---

> Built with ❤️ by Team Pirate2Pirate at VICSTA HackArena '26
---

## Rules to Remember

- All development must happen **during** the hackathon only
- Push code **regularly** — commit history is monitored
- Use only open-source libraries with compatible licenses and **credit them**
- Only **one submission** per team
- All members must be present **both days**

---

## Attribution

List any external libraries, APIs, or datasets used here.

---

> *"The world is not enough — but it is such a perfect place to start."* — James Bond
>
> All the best to every team. Build something great. 🚀
