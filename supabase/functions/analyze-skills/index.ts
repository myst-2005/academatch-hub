
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
    console.log("Analyzing skills:", text);

    if (!GEMINI_API_KEY) {
      console.error("Missing Gemini API key");
      throw new Error("Missing Gemini API key");
    }

    // Call the Gemini API for enhanced NLP analysis with advanced prompt engineering
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
                You are an expert career counselor and technical skills analyst for the tech industry.
                
                Analyze the following skills for a job candidate and provide a comprehensive assessment:
                
                Skills: ${text}
                
                Provide a detailed analysis with these exact sections:
                
                ## Market Demand
                - Rate each skill on a scale of 1-10 for current market demand
                - Include specific data points on job availability where possible
                - Mention growth trends for each skill
                
                ## Skill Compatibility
                - Identify which skills complement each other and create valuable combinations
                - Suggest modern tech stacks that incorporate these skills
                
                ## Career Potential
                - List 3-5 specific job roles these skills qualify for
                - Include salary ranges where applicable
                - Mention career progression opportunities
                
                ## Skill Gaps
                - Identify 3-5 complementary skills that would enhance this skill set
                - Explain why each would be valuable to add
                
                ## Industry Relevance
                - List specific industries where this skill set is most valuable
                - Name 2-3 companies that frequently hire for these skills
                
                ## Learning Resources
                - Suggest specific courses, certifications or projects to improve these skills
                
                Format your response with clear Markdown headings and bullet points.
                Be specific, data-driven, and actionable. Focus on current market trends in 2024.
                `
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1500,
        }
      }),
    });

    const data = await response.json();
    console.log("Gemini API response received");
    
    // Extract the generated text from Gemini's response
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                    "Unable to analyze skills. Please try again later.";

    console.log("Analysis complete. Length:", analysis.length);

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
