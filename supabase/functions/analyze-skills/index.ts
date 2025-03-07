
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

    // Parse the input text to extract individual skills
    const skills = text.split(',').map(skill => skill.trim()).filter(Boolean);
    console.log("Extracted skills:", skills);

    // Call the Gemini API with a more focused, tech-specific prompt
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
                You are a tech industry hiring manager and career advisor with deep expertise in technical skill evaluation.
                
                Analyze these specific technical skills for a job candidate in the technology sector:
                
                Skills: ${text}
                
                Provide a concise, accurate analysis with these exact sections:
                
                ## Technical Skill Assessment
                - For each skill listed, provide a brief description of what it is
                - Rate each skill's current market demand (High/Medium/Low) with a brief explanation why
                - Highlight which skills are trending upward in 2024
                
                ## Technical Stack Compatibility
                - Group the skills into logical tech stacks or combinations
                - Explain how these skills work together in real-world applications
                - Identify the most valuable skill combinations in the list
                
                ## Tech Career Paths
                - List 3-4 specific technical roles these skills qualify for
                - For each role, list the approximate salary range
                - Note which listed skills are most critical for each role
                
                ## Technical Skill Gaps
                - Identify 3-4 complementary technical skills missing from this list
                - Explain why each would enhance the candidate's employability
                - Indicate which are most urgent to learn
                
                ## Tech Industry Applications
                - Name 3-5 specific tech industry segments where these skills are most valued
                - List 2-3 specific companies that hire for this exact skill set
                - Note emerging industries where these skills will be valuable
                
                ## Technical Learning Path
                - Recommend specific technical certifications that align with these skills
                - Suggest 2-3 hands-on projects to showcase these skills
                - Provide names of specific learning platforms best suited for these skills
                
                Focus exclusively on information technology, software development, and digital skills.
                Be specific and accurate. Avoid generalities and ensure all information is relevant to the tech industry in 2024.
                Format with clear Markdown headings and concise bullet points.
                `
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Lower temperature for more factual responses
          topK: 30,
          topP: 0.9,
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
