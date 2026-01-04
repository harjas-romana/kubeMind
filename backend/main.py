from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import edge_tts
import asyncio
from groq import AsyncGroq  # <--- CHANGED to AsyncGroq
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Async Client
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

class MetricRequest(BaseModel):
    cpu: int
    current_pods: int

class VoiceRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_metrics(data: MetricRequest):
    # System Prompt: Strict JSON enforcement
    system_prompt = (
        f"You are a Kubernetes Autoscaler. Current CPU: {data.cpu}%. "
        f"Max Safe CPU: 60%. Current Replicas: {data.current_pods}. "
        "Decide the new replica count to stabilize the system. "
        "Return a JSON object with keys: 'replicas' (int) and 'reason' (string). "
        "Example: {\"replicas\": 5, \"reason\": \"High load detected\"}"
    )

    try:
        # Await the async client
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt}
            ],
            response_format={"type": "json_object"}
        )
        # Parse string to JSON object
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Groq Error: {e}")
        # Fallback if AI fails
        return {"replicas": data.current_pods, "reason": "AI Error, holding state."}

@app.post("/speak")
async def generate_speech(data: VoiceRequest):
    try:
        communicate = edge_tts.Communicate(data.text, "en-US-AriaNeural")
        out_file = "alert.mp3"
        # Await the file save
        await communicate.save(out_file)
        return FileResponse(out_file, media_type="audio/mpeg", filename="alert.mp3")
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail="TTS Generation Failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)