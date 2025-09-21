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
import { useMutation, queryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function CandidateDashboard() {
  const { user, logoutMutation } = useAuth();
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "jobs" | "applications" | "tests" | "profile">("dashboard");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");
  
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/candidate"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const { data: resumes = [] } = useQuery({
    queryKey: ["/api/resumes"],
  });

  const recentApplications = applications.slice(0, 3);
  const pendingTests = tests.filter((test: any) => test.status === "pending").slice(0, 2);

  const applyMutation = useMutation({
    mutationFn: async (data: { jobId: string; resumeId: string; coverLetter: string }) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setShowApplicationModal(false);
      setCoverLetter("");
      setSelectedResumeId("");
      setSelectedJob(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = () => {
    if (!selectedJob || !selectedResumeId || !coverLetter.trim()) {
      toast({
        title: "Error",
        description: "Please select a resume and write a cover letter.",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate({
      jobId: selectedJob.id,
      resumeId: selectedResumeId,
      coverLetter,
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case "jobs":
        return <JobsView jobs={jobs} />;
      case "applications":
        return <ApplicationsView applications={applications} />;
      case "tests":
        return <TestsView tests={tests} />;
      case "profile":
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  const DashboardView = () => (
    <>
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
          <Button onClick={() => setCurrentView("jobs")} data-testid="button-find-jobs">
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
      {/* Recent Applications preview */}
      <Card data-testid="card-recent-applications">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No applications yet</p>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((application: any) => (
                <div key={application.id} className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold">{application.job?.title || "Unknown Position"}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">
                      Applied {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                    {application.aiMatchScore && (
                      <span className="text-green-600 font-medium">
                        {application.aiMatchScore}% Match
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const JobsView = ({ jobs }: { jobs: any[] }) => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Find Jobs</h1>
          <p className="text-muted-foreground">Browse available positions and apply</p>
        </div>
      </div>
      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No jobs available at the moment</p>
        ) : (
          jobs.map((job: any) => (
            <Card key={job.id} className="p-6" data-testid={`job-card-${job.id}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-muted-foreground">{job.department} • {job.experienceLevel}</p>
                  <p className="text-sm text-muted-foreground mt-1">{job.location}</p>
                </div>
                <Button onClick={() => handleApply(job)} data-testid={`button-apply-${job.id}`}>
                  Apply
                </Button>
              </div>
              <p className="text-gray-600 mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills?.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );

  const ApplicationsView = ({ applications }: { applications: any[] }) => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground">Track your job applications</p>
        </div>
      </div>
      <div className="grid gap-4">
        {applications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No applications yet</p>
        ) : (
          applications.map((application: any) => (
            <Card key={application.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{application.job?.title || "Unknown Position"}</h3>
                  <p className="text-muted-foreground">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{application.status}</Badge>
                  {application.aiMatchScore && (
                    <p className="text-green-600 font-medium mt-1">
                      {application.aiMatchScore}% Match
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );

  const TestsView = ({ tests }: { tests: any[] }) => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tests & Assessments</h1>
          <p className="text-muted-foreground">Complete your assessments</p>
        </div>
      </div>
      <div className="grid gap-4">
        {tests.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tests available</p>
        ) : (
          tests.map((test: any) => (
            <Card key={test.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{test.job?.title} - Assessment</h3>
                  <p className="text-muted-foreground">{test.questions?.length || 0} questions • 30 min</p>
                </div>
                <Button>Start Test</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );

  const ProfileView = () => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your profile and resume</p>
        </div>
      </div>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
        <p className="text-muted-foreground">Profile management features coming soon...</p>
      </Card>
    </>
  );

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
              <button onClick={() => setCurrentView("dashboard")} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${currentView === "dashboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} data-testid="nav-dashboard">
                <i className="fas fa-home"></i>
                <span>Dashboard</span>
              </button>
              <button onClick={() => setCurrentView("jobs")} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${currentView === "jobs" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} data-testid="nav-find-jobs">
                <i className="fas fa-search"></i>
                <span>Find Jobs</span>
              </button>
              <button onClick={() => setCurrentView("applications")} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${currentView === "applications" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} data-testid="nav-applications">
                <i className="fas fa-file-alt"></i>
                <span>My Applications</span>
              </button>
              <button onClick={() => setCurrentView("tests")} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${currentView === "tests" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} data-testid="nav-tests">
                <i className="fas fa-clipboard-check"></i>
                <span>Tests & Assessments</span>
              </button>
              <button onClick={() => setCurrentView("profile")} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${currentView === "profile" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`} data-testid="nav-profile">
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" data-testid="nav-settings">
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </button>
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
          {renderContent()}

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
      
      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-2xl" data-testid="modal-apply-job">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            <div>
              <h3 className="font-semibold mb-2">Job Details</h3>
              <p className="text-sm text-muted-foreground">{selectedJob?.department} • {selectedJob?.experienceLevel}</p>
              <p className="text-sm text-muted-foreground">{selectedJob?.location}</p>
              <p className="mt-2">{selectedJob?.description}</p>
            </div>

            <div>
              <Label htmlFor="resume-select">Select Resume *</Label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger data-testid="select-resume">
                  <SelectValue placeholder="Choose a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume: any) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.fileName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {resumes.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  No resumes found. Please upload a resume first.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cover-letter">Cover Letter *</Label>
              <Textarea
                id="cover-letter"
                placeholder="Tell us why you're interested in this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                data-testid="textarea-cover-letter"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowApplicationModal(false)} data-testid="button-cancel-application">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitApplication} 
                disabled={applyMutation.isPending}
                data-testid="button-submit-application"
              >
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
