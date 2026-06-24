import google.generativeai as genai
import logging
from app.core.config import settings
from PIL import Image

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.model = None
        self.is_configured = False
        try:
            if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "placeholder_key_if_not_set":
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-1.5-pro')
                self.is_configured = True
                logger.info("Gemini 1.5 Pro Vision configured successfully.")
            else:
                logger.warning("GEMINI_API_KEY not set. Gemini service will run in mock mode.")
        except Exception as e:
            logger.error(f"Failed to configure Gemini: {e}")

    async def analyze_civic_issue(self, image: Image.Image, location: str = None, weather: str = None) -> str:
        if not self.is_configured:
            return "Mock Gemini Analysis: The image shows a moderate infrastructure issue requiring civic attention. Severity is estimated at 6/10."
            
        prompt = (
            "You are an AI civic infrastructure inspector. Analyze this image of a reported issue.\n"
            "Use Chain-of-Thought reasoning to:\n"
            "1. Identify the core problem (e.g., pothole, broken streetlight, illegal dumping).\n"
            "2. Estimate the severity and potential danger to the public.\n"
            "3. Suggest remediation steps for the local authority.\n"
        )
        
        if location:
            prompt += f"\nLocation Context: {location}"
        if weather:
            prompt += f"\nWeather Context: {weather}"

        try:
            response = await self.model.generate_content_async([prompt, image])
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return f"Analysis failed due to an error: {str(e)}"

gemini_service = GeminiService()
