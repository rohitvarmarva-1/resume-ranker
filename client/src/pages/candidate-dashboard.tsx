import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import ResumeUploadModal from "@/components/resume-upload-modal";

export default function CandidateDashboard() {
  const { user, logoutMutation } = useAuth();
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/candidate"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const recentApplications = applications.slice(0, 3);
  const pendingTests = tests.filter((test: any) => test.status === "pending").slice(0, 2);

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
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-find-jobs">
                <i className="fas fa-search"></i>
                <span>Find Jobs</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-applications">
                <i className="fas fa-file-alt"></i>
                <span>My Applications</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-tests">
                <i className="fas fa-clipboard-check"></i>
                <span>Tests & Assessments</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-profile">
                <i className="fas fa-user"></i>
                <span>Profile</span>
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
                <AvatarFallback className="bg-green-600 text-white">
                  {user?.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm" data-testid="text-user-name">{user?.username}</div>
                <div className="text-xs text-muted-foreground">Candidate</div>
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
              <p className="text-muted-foreground">Track your job applications and opportunities</p>
            </div>
            <div className="flex space-x-4">
              <Button 
                variant="outline"
                onClick={() => setShowResumeUpload(true)}
                data-testid="button-upload-resume"
              >
                <i className="fas fa-upload mr-2"></i>Update Resume
              </Button>
              <Button data-testid="button-find-jobs">
                <i className="fas fa-search mr-2"></i>Find Jobs
              </Button>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-8" data-testid="card-profile-completion">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Complete Your Profile</h3>
                <p className="text-blue-700">Add more details to get better job matches</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">75%</div>
                <Progress value={75} className="w-16 mt-1" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-stat-applications">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Applications</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats?.applications || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-paper-plane text-blue-600"></i>
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
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bullseye text-green-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-pending-tests">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Tests Pending</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats?.pendingTests || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-orange-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-profile-views">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Profile Views</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats?.profileViews || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-eye text-purple-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
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
                        <div key={application.id} className="p-4 border border-border rounded-lg hover:bg-accent transition-colors" data-testid={`application-${application.id}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-card-foreground">
                                {application.job?.title || "Unknown Position"}
                              </h4>
                              <p className="text-muted-foreground">Company Name</p>
                            </div>
                            <Badge 
                              variant={
                                application.status === "hired" ? "default" :
                                application.status === "interviewing" ? "default" :
                                application.status === "test_invited" ? "secondary" :
                                application.status === "rejected" ? "destructive" :
                                "outline"
                              }
                              data-testid={`status-${application.id}`}
                            >
                              {application.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                            {application.aiMatchScore && (
                              <span className="text-green-600 font-medium" data-testid={`match-${application.id}`}>
                                {application.aiMatchScore}% Match
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Tests & AI Recommendations */}
            <div className="space-y-6">
              {/* Pending Tests */}
              <Card data-testid="card-pending-tests">
                <CardHeader>
                  <CardTitle>Pending Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingTests.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No pending tests</p>
                    ) : (
                      pendingTests.map((test: any) => (
                        <div key={test.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg" data-testid={`test-${test.id}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-orange-800">
                                {test.job?.title || "Assessment"}
                              </p>
                              <p className="text-sm text-orange-600">Company Name</p>
                            </div>
                            <span className="text-xs text-orange-600">
                              {test.timeLimit} mins
                            </span>
                          </div>
                          <Link href={`/test/${test.id}`}>
                            <Button 
                              size="sm" 
                              className="w-full bg-orange-600 text-white hover:bg-orange-700"
                              data-testid={`take-test-${test.id}`}
                            >
                              Take Test
                            </Button>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card data-testid="card-ai-recommendations">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-robot text-primary"></i>
                    <span>AI Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-medium text-green-800 text-sm mb-1">Perfect Match Found!</p>
                      <p className="text-green-700 text-sm">Senior React Developer at WebFlow - 96% match based on your skills</p>
                      <Button variant="link" className="p-0 h-auto text-green-600 text-sm mt-2" data-testid="link-view-recommended-job">
                        View Job →
                      </Button>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-blue-800 text-sm mb-1">Skill Enhancement</p>
                      <p className="text-blue-700 text-sm">Learn GraphQL to increase your match rate by 15%</p>
                      <Button variant="link" className="p-0 h-auto text-blue-600 text-sm mt-2" data-testid="link-view-skill-resources">
                        View Resources →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ResumeUploadModal open={showResumeUpload} onClose={() => setShowResumeUpload(false)} />
    </div>
  );
}
