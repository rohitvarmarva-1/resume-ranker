import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import JobPostModal from "@/components/job-post-modal";

export default function RecruiterDashboard() {
  const { user, logoutMutation } = useAuth();
  const [showJobPost, setShowJobPost] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/recruiter"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const { data: applicationDetails } = useQuery({
    queryKey: [`/api/applications/${selectedApplicationId}/details`],
    enabled: !!selectedApplicationId,
  });

  const recentApplications = applications.slice(0, 5);

  const handleViewCandidate = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setCurrentView("candidate-details");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied": return "bg-blue-100 text-blue-800";
      case "test_invited": return "bg-orange-100 text-orange-800";
      case "in_review": return "bg-yellow-100 text-yellow-800";
      case "interviewing": return "bg-purple-100 text-purple-800";
      case "hired": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
              <button 
                className={`flex items-center space-x-3 px-4 py-2 w-full text-left rounded-lg transition-colors ${
                  currentView === "dashboard" 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setCurrentView("dashboard")}
                data-testid="nav-dashboard"
              >
                <i className="fas fa-home"></i>
                <span>Dashboard</span>
              </button>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2"
                onClick={() => setShowJobPost(true)}
                data-testid="nav-post-job"
              >
                <i className="fas fa-plus mr-3"></i>
                <span>Post Job</span>
              </Button>
              <button 
                className={`flex items-center space-x-3 px-4 py-2 w-full text-left rounded-lg transition-colors ${
                  currentView === "my-jobs" 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setCurrentView("my-jobs")}
                data-testid="nav-my-jobs"
              >
                <i className="fas fa-briefcase"></i>
                <span>My Jobs</span>
              </button>
              <button 
                className={`flex items-center space-x-3 px-4 py-2 w-full text-left rounded-lg transition-colors ${
                  currentView === "candidates" 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setCurrentView("candidates")}
                data-testid="nav-candidates"
              >
                <i className="fas fa-users"></i>
                <span>Candidates</span>
              </button>
              <button 
                className={`flex items-center space-x-3 px-4 py-2 w-full text-left rounded-lg transition-colors ${
                  currentView === "analytics" 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setCurrentView("analytics")}
                data-testid="nav-analytics"
              >
                <i className="fas fa-chart-bar"></i>
                <span>Analytics</span>
              </button>
              <button 
                className={`flex items-center space-x-3 px-4 py-2 w-full text-left rounded-lg transition-colors ${
                  currentView === "settings" 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setCurrentView("settings")}
                data-testid="nav-settings"
              >
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </button>
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
          {currentView === "dashboard" && (
            <>
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
            </>
          )}

          {currentView === "candidates" && (
            <>
              {/* Candidates Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
                  <p className="text-muted-foreground">Review applications and candidate results</p>
                </div>
              </div>
            </>
          )}

          {currentView === "candidate-details" && applicationDetails && (
            <>
              {/* Candidate Details Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Candidate Details</h1>
                  <p className="text-muted-foreground">{applicationDetails.candidate?.username} - {applicationDetails.job?.title}</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentView("candidates")}
                  data-testid="button-back-to-candidates"
                >
                  <i className="fas fa-arrow-left mr-2"></i>Back to Candidates
                </Button>
              </div>
            </>
          )}

          {/* Dashboard Content */}
          {currentView === "dashboard" && (
            <>
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
            </>
          )}

          {/* Candidates View */}
          {currentView === "candidates" && (
            <div className="space-y-6">
              <Card data-testid="card-all-applications">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>All Applications</span>
                    <Badge variant="secondary">{Array.isArray(applications) ? applications.length : 0} Total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(applications) && applications.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No applications yet</p>
                    ) : (
                      Array.isArray(applications) && applications.map((application: any) => (
                        <div key={application.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid={`application-item-${application.id}`}>
                          <div className="flex items-center space-x-4">
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
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getStatusColor(application.status)} variant="secondary">
                                  {application.status?.replace("_", " ") || "Unknown"}
                                </Badge>
                                {application.aiMatchScore && (
                                  <Badge 
                                    variant={application.aiMatchScore >= 80 ? "default" : "secondary"}
                                    data-testid={`match-score-${application.id}`}
                                  >
                                    {application.aiMatchScore}% Match
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Applied {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewCandidate(application.id)}
                              data-testid={`view-candidate-${application.id}`}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Candidate Details View */}
          {currentView === "candidate-details" && applicationDetails && (
            <div className="space-y-6">
              {/* Application Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card data-testid="card-candidate-profile">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                          {applicationDetails.candidate?.username?.slice(0, 2).toUpperCase() || "CA"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xl font-semibold">{applicationDetails.candidate?.username || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">{applicationDetails.candidate?.email || "No email"}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Application Status</p>
                      <Badge className={getStatusColor(applicationDetails.status)} variant="secondary">
                        {applicationDetails.status?.replace("_", " ") || "Unknown"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">AI Match Score</p>
                      <div className="flex items-center space-x-3">
                        <Progress value={applicationDetails.aiMatchScore || 0} className="flex-1" />
                        <span className="text-2xl font-bold">{applicationDetails.aiMatchScore || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Applied Date</p>
                      <p>{new Date(applicationDetails.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Resume Information */}
                <Card data-testid="card-resume-info">
                  <CardHeader>
                    <CardTitle>Resume Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">File Name</p>
                      <p>{applicationDetails.resume?.fileName || "No resume uploaded"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Experience Years</p>
                      <p>{applicationDetails.resume?.experienceYears || "Not specified"} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {applicationDetails.resume?.extractedSkills?.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        )) || <p className="text-muted-foreground">No skills extracted</p>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
                      <p className="text-sm">{applicationDetails.resume?.summary || "No summary available"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test Results */}
              {applicationDetails.test && (
                <Card data-testid="card-test-results">
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Test Status</p>
                        <Badge className={getStatusColor(applicationDetails.test.status)} variant="secondary">
                          {applicationDetails.test.status?.replace("_", " ") || "Unknown"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Questions</p>
                        <p>{applicationDetails.test.questions?.length || 0} questions</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Time Limit</p>
                        <p>{applicationDetails.test.timeLimit || 0} minutes</p>
                      </div>
                    </div>

                    {applicationDetails.testResult && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Score</p>
                            <div className="flex items-center space-x-3">
                              <Progress value={applicationDetails.testResult.score || 0} className="flex-1" />
                              <span className="text-2xl font-bold">{applicationDetails.testResult.score || 0}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Time Spent</p>
                            <p>{applicationDetails.testResult.timeSpent || 0} minutes</p>
                          </div>
                        </div>
                        
                        {applicationDetails.testResult.flaggedQuestions?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Flagged Questions</p>
                            <p>{applicationDetails.testResult.flaggedQuestions.length} questions marked for review</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cover Letter */}
              {applicationDetails.coverLetter && (
                <Card data-testid="card-cover-letter">
                  <CardHeader>
                    <CardTitle>Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{applicationDetails.coverLetter}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      <JobPostModal open={showJobPost} onClose={() => setShowJobPost(false)} />
    </div>
  );
}
