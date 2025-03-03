
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SkillAnalysisSectionProps {
  skills: string;
}

export const SkillAnalysisSection = ({ skills }: SkillAnalysisSectionProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSkills = async () => {
    if (!skills.trim()) {
      setError("Please enter skills to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-skills", {
        body: { text: skills },
      });

      if (error) throw error;
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error("Error analyzing skills:", err);
      setError(err.message || "Failed to analyze skills");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Skill Analysis</h3>
        <Button 
          type="button" 
          variant="outline" 
          onClick={analyzeSkills}
          disabled={isAnalyzing || !skills.trim()}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Skills"
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {analysis && (
        <Card className="p-4 bg-slate-50">
          <h4 className="font-medium mb-2">Skills Analysis</h4>
          <div className="text-sm whitespace-pre-line">
            {analysis}
          </div>
        </Card>
      )}
    </div>
  );
};
