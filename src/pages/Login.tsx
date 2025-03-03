
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Admin login (special case)
      if (formData.email === "admin" || formData.email === "admin@admin.com") {
        console.log("Attempting admin login");
        const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
          email: "admin@admin.com", 
          password: formData.password
        });
        
        if (adminError) {
          console.error("Admin login error:", adminError);
          throw adminError;
        }
        
        console.log("Admin login successful:", adminData);
        
        toast({
          title: "Logged in as admin",
          duration: 3000,
        });
        
        navigate("/admin-dashboard");
        return;
      }
      
      // Regular user login
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful, checking user type");
      
      // Check if user is a student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (studentData) {
        toast({
          title: "Login successful",
          duration: 3000,
        });
        
        navigate("/student-dashboard");
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
          duration: 3000,
        });
        
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-haca-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">H</span>
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">HACA Recruitment</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        <Card className="shadow-elegant border border-gray-100">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-elegant"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-elegant"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-haca-600 hover:bg-haca-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a 
                href="/registration" 
                className="font-medium text-haca-600 hover:text-haca-800"
              >
                Register as a student
              </a>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <a 
                href="/recruiter" 
                className="font-medium text-haca-600 hover:text-haca-800"
              >
                Continue as a recruiter
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
