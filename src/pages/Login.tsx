
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateUser, saveCurrentUser } from "@/lib/mockData";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simulate API call
    setTimeout(() => {
      const user = authenticateUser(username, password);
      
      if (user) {
        saveCurrentUser(user);
        toast({
          title: "Logged in successfully",
          description: "Welcome back, " + user.username,
          duration: 3000,
        });
        navigate("/admin");
      } else {
        setError("Invalid username or password");
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
          duration: 3000,
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass-panel p-8 animate-fade-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
              <p className="mt-2 text-gray-600">Login to access the admin dashboard</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="input-elegant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-elegant"
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-600 mt-2">{error}</div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-haca-600 hover:bg-haca-700 text-white py-5 h-auto font-medium rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Demo credentials:</p>
              <p>Username: admin</p>
              <p>Password: admin@1234</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
