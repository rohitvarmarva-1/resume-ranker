import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
const registerSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"recruiter" | "candidate">("recruiter");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", role: selectedRole },
  });

  // Redirect if already authenticated - AFTER all hooks are called
  if (user) {
    return <Redirect to={user.role === "recruiter" ? "/recruiter" : "/candidate"} />;
  }

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterData) => {
    registerMutation.mutate({ ...data, role: selectedRole });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Column - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-brain text-primary-foreground text-lg"></i>
            </div>
            <CardTitle className="text-2xl">Welcome to ATS AI</CardTitle>
            <p className="text-muted-foreground">Choose your account type and get started</p>
          </CardHeader>
          
          <CardContent>
            {/* Role Selection */}
            <div className="mb-6">
              <Label className="block text-sm font-medium mb-2">I am a:</Label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={selectedRole === "recruiter" ? "default" : "outline"}
                  className="flex-1 p-3 h-auto flex-col"
                  onClick={() => setSelectedRole("recruiter")}
                  data-testid="button-role-recruiter"
                >
                  <i className="fas fa-user-tie text-lg mb-2"></i>
                  <span>Recruiter</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "candidate" ? "default" : "outline"}
                  className="flex-1 p-3 h-auto flex-col"
                  onClick={() => setSelectedRole("candidate")}
                  data-testid="button-role-candidate"
                >
                  <i className="fas fa-user text-lg mb-2"></i>
                  <span>Candidate</span>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      {...loginForm.register("username")}
                      placeholder="Enter your username"
                      data-testid="input-login-username"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-destructive mt-1">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      {...loginForm.register("password")}
                      placeholder="Enter your password"
                      data-testid="input-login-password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" data-testid="checkbox-remember" />
                      <Label htmlFor="remember" className="text-sm">Remember me</Label>
                    </div>
                    <Button variant="link" className="px-0 text-sm" data-testid="link-forgot-password">
                      Forgot password?
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div>
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      {...registerForm.register("username")}
                      placeholder="Choose a username"
                      data-testid="input-register-username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      {...registerForm.register("email")}
                      placeholder="Enter your email"
                      data-testid="input-register-email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...registerForm.register("password")}
                      placeholder="Create a password"
                      data-testid="input-register-password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Hero/Marketing */}
      <div className="flex-1 gradient-bg flex items-center justify-center p-8">
        <div className="text-center text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            {selectedRole === "recruiter" ? "Find Top Talent" : "Land Your Dream Job"}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {selectedRole === "recruiter" 
              ? "Use AI-powered matching to discover the perfect candidates for your roles. Streamline interviews and make data-driven hiring decisions."
              : "Get matched with jobs that fit your skills perfectly. Take AI-generated assessments and track your application progress in real-time."
            }
          </p>
          <div className="space-y-4">
            <div className="flex items-center text-blue-100">
              <i className="fas fa-check mr-3"></i>
              <span>{selectedRole === "recruiter" ? "Smart candidate screening" : "Personalized job recommendations"}</span>
            </div>
            <div className="flex items-center text-blue-100">
              <i className="fas fa-check mr-3"></i>
              <span>{selectedRole === "recruiter" ? "Automated test generation" : "Skill-based assessments"}</span>
            </div>
            <div className="flex items-center text-blue-100">
              <i className="fas fa-check mr-3"></i>
              <span>{selectedRole === "recruiter" ? "Real-time analytics" : "Application tracking"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
