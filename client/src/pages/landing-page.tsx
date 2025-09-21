import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const { user } = useAuth();

  // Redirect authenticated users to their dashboard
  if (user) {
    return <Redirect to={user.role === "recruiter" ? "/recruiter" : "/candidate"} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-bg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI-Powered Recruitment<br/>
              <span className="text-blue-200">Made Simple</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform your hiring process with intelligent job matching, automated screening, 
              and AI-generated assessments. Find the perfect candidates faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-gray-50"
                data-testid="button-start-trial"
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
                data-testid="button-watch-demo"
              >
                <i className="fas fa-play mr-2"></i>Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Modern Recruitment
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform streamlines every step of your hiring process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover" data-testid="card-role-access">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-user-tie text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Role-Based Access</h3>
                <p className="text-muted-foreground">Separate dashboards for recruiters and candidates with tailored experiences and permissions</p>
              </CardContent>
            </Card>

            <Card className="card-hover" data-testid="card-ai-matching">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-robot text-green-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">AI Job Matching</h3>
                <p className="text-muted-foreground">Advanced algorithms analyze resumes and job requirements for perfect candidate matches</p>
              </CardContent>
            </Card>

            <Card className="card-hover" data-testid="card-resume-parsing">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-file-alt text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Smart Resume Parsing</h3>
                <p className="text-muted-foreground">Automatically extract skills, experience, and qualifications from uploaded resumes</p>
              </CardContent>
            </Card>

            <Card className="card-hover" data-testid="card-test-generation">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-clipboard-check text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">AI Test Generation</h3>
                <p className="text-muted-foreground">Generate custom assessments based on job requirements using advanced AI</p>
              </CardContent>
            </Card>

            <Card className="card-hover" data-testid="card-analytics">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chart-bar text-red-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Analytics Dashboard</h3>
                <p className="text-muted-foreground">Comprehensive insights into candidate performance and hiring metrics</p>
              </CardContent>
            </Card>

            <Card className="card-hover" data-testid="card-notifications">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-envelope text-teal-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Email Notifications</h3>
                <p className="text-muted-foreground">Automated updates for applications, test invitations, and status changes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
