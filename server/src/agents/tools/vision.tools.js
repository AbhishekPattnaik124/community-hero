const { DynamicTool } = require("@langchain/core/tools");

const compareBeforeAfterImagesTool = new DynamicTool({
  name: "compare_before_after_images",
  description: "Compares a 'before' image of a civic issue with an 'after' (Street View or authority uploaded) image to determine if the issue was actually resolved. Input should be a JSON string with { originalImageUrl, currentImageUrl, issueDescription }.",
  func: async (input) => {
    try {
      const payload = JSON.parse(input);
      // MOCK IMPLEMENTATION FOR HACKATHON:
      // In a real scenario, this would call Gemini 1.5 Pro Vision API
      console.log(`[CivicMind] Vision AI analyzing before/after for issue...`);
      return JSON.stringify({
        isResolved: true,
        confidence: 0.95,
        analysis: `The 'before' image showed a massive pothole. The 'after' image from ${payload.currentImageUrl} shows a newly paved and level surface. Resolution confirmed.`
      });
    } catch (e) {
      return "Failed to parse input. Ensure input is valid JSON.";
    }
  },
});

const fetchStreetViewImageTool = new DynamicTool({
  name: "fetch_street_view_image",
  description: "Fetches the most recent Google Street View image for a given latitude and longitude. Input should be a JSON string with { lat, lng }.",
  func: async (input) => {
    try {
      const { lat, lng } = JSON.parse(input);
      // MOCK
      return `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=MOCK_KEY`;
    } catch (e) {
      return "Failed to parse input.";
    }
  }
});

module.exports = { compareBeforeAfterImagesTool, fetchStreetViewImageTool };
