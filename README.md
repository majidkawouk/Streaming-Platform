<img width="2486" height="2901" alt="Untitled-2026-01-07-1933" src="https://github.com/user-attachments/assets/b65efd28-d405-434e-96d3-bd1c4cd7e091" />

# Real-Time Live Streaming Platform (WebRTC + mediasoup)

A production-ready, low-latency live streaming architecture. This platform allows broadcasters to stream high-quality video/audio to multiple viewers using an **SFU (Selective Forwarding Unit)** approach, featuring real-time chat and VOD (Video on Demand) capabilities.

---

## 🏗️ System Architecture

The project is built on a strict separation of concerns to ensure maximum scalability and performance.

### 1. Streamer (Broadcaster)
The streamer is the "Producer" of the media.
* **Media Handling:** Captures camera or screen-share via `getUserMedia` / `getDisplayMedia`.
* **RTP Production:** Uses `mediasoup-client` to create a `SendTransport`. It produces separate Audio and Video tracks.
* **VOD Recording:** Records the session locally using the `MediaRecorder` API. 
* **Persistence:** Once the stream ends, the client requests a **Signed URL** from the backend to upload the recorded blob directly to **S3/Supabase Storage**.

### 2. Backend (Node.js + mediasoup SFU)
The central hub for media routing and signaling.
* **Selective Forwarding Unit (SFU):** Instead of mixing video (which is CPU intensive), the server forwards RTP packets from the producer to multiple consumers.
* **Signaling:** Uses `Socket.IO` to negotiate WebRTC connections (DTLS/ICE parameters).
* **Worker/Router Management:** Manages mediasoup workers and creates one router per room to isolate media traffic.

### 3. Viewer
The "Consumer" of the media.
* **Dynamic Discovery:** Queries the `/producers` endpoint to find active streams.
* **RTP Consumption:** Creates a `RecvTransport` to pull media from the SFU.
* **Playback:** Intelligently handles unmuting and fullscreen via a custom React player interface.

### 4. Real-Time Chat (Socket.IO + Redis)
A high-performance chat system decoupled from the main database.
* **Room-Based Chat:** Uses `socket.join("stream-" + streamerSocketId)` to isolate chat to specific broadcasts.
* **Redis Persistence:** Chat history is stored in **Redis Lists**. This allows new viewers to fetch the last 100 messages instantly upon joining via `lRange`.

---

## 🔄 Detailed Stream Lifecycle



### Phase 1: Going Live
1. **Streamer** establishes a signaling connection.
2. **Backend** creates a mediasoup `Router`.
3. **Database** updates the stream status to `is_live: true`.

### Phase 2: Media & Interaction
1. **Streamer** begins sending RTP packets. 
2. **Viewers** connect, join the **Socket.IO room**, and fetch **Redis-cached chat history**.
3. **SFU** clones the incoming packets and forwards them to all connected viewers.

### Phase 3: Ending & VOD
1. **Streamer** stops the broadcast. 
2. **MediaRecorder** finalizes the local file.
3. The file is uploaded to **S3/Supabase** via a secure Signed URL.
4. **Database** updates `is_live: false` and saves the `Stream_Url`.

---

## 📺 VOD & User Profiles

The architecture transitions seamlessly from live to recorded content:
* **User Profiles:** Once a stream is finished, the metadata and the S3 link are persisted in the SQL database.
* **Viewing VODs:** Any user can visit a **Broadcaster's Profile** to view previous recordings.
* **VOD Player:** A dedicated player handles recorded playback with custom controls (Seek, Volume, Fullscreen) fetching data from the stored `Stream_Url`.

---

## 📡 Signaling vs. Media Transport

| Component | Protocol | Responsibility |
| :--- | :--- | :--- |
| **Signaling** | Socket.IO (WebSockets) | Connection handshakes, Room joins |
| **Media** | WebRTC (UDP/RTP) | Low-latency Video/Audio delivery |
| **Chat Cache** | Redis | Storing/Retrieving recent messages |
| **Persistence** | TypeORM / S3 | User metadata and VOD storage |

---

## 🚀 Technical Highlights

* **No Media over WebSockets:** Keeps the signaling server fast by routing binary data through UDP.
* **Scale-Out Ready:** Redis ensures that chat can remain synchronized even if signaling is scaled across multiple Node.js instances.
* **Storage Efficient:** Browser-side recording removes the need for expensive server-side transcoding and recording.
