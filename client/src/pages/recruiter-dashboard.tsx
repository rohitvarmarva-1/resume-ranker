import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import JobPostModal from "@/components/job-post-modal";

export default function RecruiterDashboard() {
  const { user, logoutMutation } = useAuth();
  const [showJobPost, setShowJobPost] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/recruiter"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border fixed h-full">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-primary-foreground text-sm"></i>
              </div>
              <span className="text-xl font-bold">ATS AI</span>
            </div>
            
            <nav className="space-y-2">
              <a href="#" className="flex items-center space-x-3 px-4 py-2 bg-accent text-accent-foreground rounded-lg" data-testid="nav-dashboard">
                <i className="fas fa-home"></i>
                <span>Dashboard</span>
              </a>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2"
                onClick={() => setShowJobPost(true)}
                data-testid="nav-post-job"
              >
                <i className="fas fa-plus mr-3"></i>
                <span>Post Job</span>
              </Button>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-my-jobs">
                <i className="fas fa-briefcase"></i>
                <span>My Jobs</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-candidates">
                <i className="fas fa-users"></i>
                <span>Candidates</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-analytics">
                <i className="fas fa-chart-bar"></i>
                <span>Analytics</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-settings">
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </a>
            </nav>
          </div>

          <div className="absolute bottom-0 w-full p-6">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm" data-testid="text-user-name">{user?.username}</div>
                <div className="text-xs text-muted-foreground">Recruiter</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.username}!</p>
            </div>
            <Button 
              onClick={() => setShowJobPost(true)}
              data-testid="button-post-new-job"
            >
              <i className="fas fa-plus mr-2"></i>Post New Job
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-stat-active-jobs">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Jobs</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats?.activeJobs || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-briefcase text-blue-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-applications">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Applications</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats?.applications || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-green-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-matches">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">AI Matches</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats?.matches || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-robot text-purple-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-tests">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Tests Taken</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats?.tests || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clipboard-check text-orange-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications & AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Applications */}
            <Card data-testid="card-recent-applications">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Recent Applications</span>
                  <Button variant="link" className="p-0" data-testid="link-view-all-applications">
                    View all
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No applications yet</p>
                  ) : (
                    recentApplications.map((application: any) => (
                      <div key={application.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid={`application-${application.id}`}>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {application.candidate?.username?.slice(0, 2).toUpperCase() || "CA"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-card-foreground">
                              {application.candidate?.username || "Anonymous"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {application.job?.title || "Unknown Position"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {application.aiMatchScore && (
                              <Badge 
                                variant={application.aiMatchScore >= 80 ? "default" : "secondary"}
                                data-testid={`match-score-${application.id}`}
                              >
                                {application.aiMatchScore}% Match
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Matching Insights */}
            <Card data-testid="card-ai-insights">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>AI Matching Insights</span>
                  <i className="fas fa-robot text-primary"></i>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <span className="font-medium text-green-800">High-Quality Matches</span>
                    </div>
                    <p className="text-sm text-green-700">
                      {stats?.matches || 0} candidates with 80%+ compatibility found across your active positions
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-lightbulb text-blue-600"></i>
                      <span className="font-medium text-blue-800">Skill Gap Analysis</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Most common skill gaps: TypeScript, Cloud platforms - consider training programs
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-trending-up text-orange-600"></i>
                      <span className="font-medium text-orange-800">Market Insights</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      React developer demand increased 15% - consider expanding your talent pool
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <JobPostModal open={showJobPost} onClose={() => setShowJobPost(false)} />
    </div>
  );
}
