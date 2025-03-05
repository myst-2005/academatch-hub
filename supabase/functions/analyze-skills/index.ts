
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key");
    }

    // Call the Gemini API for enhanced NLP analysis with prompt engineering
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
                Analyze the following skills for a job candidate and provide a comprehensive assessment:
                
                Skills: ${text}
                
                Provide analysis in this format:
                1. Market Demand: Rate each skill on a scale of 1-10 for current market demand
                2. Skill Compatibility: Identify which skills work well together and why
                3. Career Potential: Suggest potential career paths based on this skill set
                4. Skill Gaps: Identify any complementary skills that would make this set stronger
                5. Industry Relevance: List industries where this skill set is most valuable
                
                Keep your analysis specific, data-driven, and actionable. Format it with clear headings and bullet points.
                `
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    const data = await response.json();
    
    // Extract the generated text from Gemini's response
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                    "Unable to analyze skills. Please try again later.";

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  } catch (error) {
    console.error("Error in analyze-skills function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  }
});
