
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SkillAnalysisSectionProps {
  skills: string;
}

export const SkillAnalysisSection = ({ skills }: SkillAnalysisSectionProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeSkills = async () => {
    if (!skills.trim()) {
      setError("Please enter skills to analyze");
      toast({
        title: "Error",
        description: "Please enter skills to analyze",
        variant: "destructive",
      });
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
      
      toast({
        title: "Analysis Complete",
        description: "Your skills have been analyzed successfully",
      });
    } catch (err: any) {
      console.error("Error analyzing skills:", err);
      setError(err.message || "Failed to analyze skills");
      toast({
        title: "Analysis Failed",
        description: err.message || "Failed to analyze skills",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">AI Career Analysis</h3>
        <Button 
          type="button" 
          variant="outline" 
          onClick={analyzeSkills}
          disabled={isAnalyzing || !skills.trim()}
          className="bg-haca-500 text-white hover:bg-haca-600"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Career Potential"
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {analysis && (
        <Card className="p-4 bg-slate-50">
          <h4 className="font-medium mb-2 text-haca-700">Skills Analysis</h4>
          <div className="text-sm whitespace-pre-line prose prose-sm max-w-none">
            {analysis}
          </div>
        </Card>
      )}
    </div>
  );
};
