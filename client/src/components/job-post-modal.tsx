import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const jobFormSchema = insertJobSchema.extend({
  skillsInput: z.string().optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobPostModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JobPostModal({ open, onClose }: JobPostModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      experienceLevel: "",
      employmentType: "",
      requiredSkills: [],
      salaryMin: undefined,
      salaryMax: undefined,
      location: "",
      aiMatchingEnabled: true,
      aiTestEnabled: true,
      emailNotificationsEnabled: false,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: Omit<JobFormData, "skillsInput">) => {
      const res = await apiRequest("POST", "/api/jobs", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted",
        description: "Your job posting has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/recruiter"] });
      onClose();
      form.reset();
      setSkills([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = (data: JobFormData) => {
    const { skillsInput, ...jobData } = data;
    createJobMutation.mutate({
      ...jobData,
      requiredSkills: skills,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-job-post">
        <DialogHeader>
          <DialogTitle>Post New Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="e.g. Senior Frontend Developer"
                data-testid="input-job-title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select onValueChange={(value) => form.setValue("department", value)}>
                <SelectTrigger data-testid="select-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.department && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.department.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select onValueChange={(value) => form.setValue("experienceLevel", value)}>
                <SelectTrigger data-testid="select-experience-level">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="Mid Level">Mid Level</SelectItem>
                  <SelectItem value="Senior Level">Senior Level</SelectItem>
                  <SelectItem value="Lead/Principal">Lead/Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select onValueChange={(value) => form.setValue("employmentType", value)}>
                <SelectTrigger data-testid="select-employment-type">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              rows={5}
              placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              data-testid="textarea-job-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex flex-wrap gap-2 mb-3" data-testid="skills-list">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`remove-skill-${skill}`}
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Add skills and press Enter"
              data-testid="input-add-skill"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Salary Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  {...form.register("salaryMin", { valueAsNumber: true })}
                  placeholder="Min"
                  data-testid="input-salary-min"
                />
                <Input
                  type="number"
                  {...form.register("salaryMax", { valueAsNumber: true })}
                  placeholder="Max"
                  data-testid="input-salary-max"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="City, State or Remote"
                data-testid="input-location"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-card-foreground mb-2 flex items-center">
              <i className="fas fa-robot text-primary mr-2"></i>
              AI-Powered Features
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="aiMatching"
                  defaultChecked
                  onCheckedChange={(checked) => form.setValue("aiMatchingEnabled", !!checked)}
                  data-testid="checkbox-ai-matching"
                />
                <Label htmlFor="aiMatching" className="text-sm">Enable AI candidate matching</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="aiTest"
                  defaultChecked
                  onCheckedChange={(checked) => form.setValue("aiTestEnabled", !!checked)}
                  data-testid="checkbox-ai-test"
                />
                <Label htmlFor="aiTest" className="text-sm">Generate custom assessment questions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emailNotifications"
                  onCheckedChange={(checked) => form.setValue("emailNotificationsEnabled", !!checked)}
                  data-testid="checkbox-email-notifications"
                />
                <Label htmlFor="emailNotifications" className="text-sm">Send automated application confirmations</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createJobMutation.isPending}
              data-testid="button-publish-job"
            >
              {createJobMutation.isPending ? "Publishing..." : "Publish Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
