import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface JobMatchResult {
  matchScore: number;
  reasoning: string;
  skillsMatch: string[];
  skillsGap: string[];
  recommendations: string[];
}

export interface TestQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "code" | "essay";
  options?: string[];
  correctAnswer?: string;
}

export async function calculateJobMatch(
  resumeText: string,
  jobRequirements: string,
  requiredSkills: string[]
): Promise<JobMatchResult> {
  try {
    const prompt = `
    Analyze the compatibility between this resume and job requirements. Provide a detailed analysis in JSON format.

    Resume: ${resumeText}
    
    Job Requirements: ${jobRequirements}
    
    Required Skills: ${requiredSkills.join(", ")}

    Please provide a JSON response with the following structure:
    {
      "matchScore": number (0-100),
      "reasoning": "detailed explanation of the match",
      "skillsMatch": ["array of matching skills"],
      "skillsGap": ["array of missing skills"],
      "recommendations": ["array of recommendations for improvement"]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert HR analyst specializing in resume-job matching. Provide accurate, detailed analysis in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      matchScore: Math.max(0, Math.min(100, result.matchScore || 0)),
      reasoning: result.reasoning || "Unable to analyze match",
      skillsMatch: result.skillsMatch || [],
      skillsGap: result.skillsGap || [],
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    throw new Error("Failed to calculate job match: " + (error as Error).message);
  }
}

export async function extractResumeSkills(resumeText: string): Promise<{
  skills: string[];
  experienceYears: number;
  summary: string;
}> {
  try {
    const prompt = `
    Extract key information from this resume text. Provide a JSON response with skills, experience years, and a brief summary.

    Resume: ${resumeText}

    Please provide a JSON response with the following structure:
    {
      "skills": ["array of technical and professional skills"],
      "experienceYears": number (total years of relevant experience),
      "summary": "brief 2-3 sentence summary of the candidate's background"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at parsing resumes and extracting structured information. Always respond in valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      skills: result.skills || [],
      experienceYears: Math.max(0, result.experienceYears || 0),
      summary: result.summary || "No summary available",
    };
  } catch (error) {
    throw new Error("Failed to extract resume skills: " + (error as Error).message);
  }
}

export async function generateTestQuestions(
  jobTitle: string,
  requiredSkills: string[],
  experienceLevel: string,
  questionCount: number = 10
): Promise<TestQuestion[]> {
  try {
    const prompt = `
    Generate ${questionCount} technical assessment questions for a ${jobTitle} position requiring ${experienceLevel} level experience.

    Required Skills: ${requiredSkills.join(", ")}
    Experience Level: ${experienceLevel}

    Create a mix of multiple choice, coding challenge, and essay questions. 

    IMPORTANT RULES:
    - For multiple choice questions, provide 4 options with one correct answer
    - For coding questions, describe the problem to solve but DO NOT include any code examples or solutions
    - For essay questions, ask conceptual questions without providing answers
    - NEVER include answers, code solutions, or hints in the question text itself

    Please provide a JSON response with the following structure:
    {
      "questions": [
        {
          "id": "unique_id",
          "question": "question text (without any answers or solutions)",
          "type": "multiple_choice|code|essay",
          "options": ["option1", "option2", "option3", "option4"] (for multiple choice only),
          "correctAnswer": "correct option" (for multiple choice only, stored separately for grading)
        }
      ]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer who creates fair, relevant assessment questions. Always respond in valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return result.questions || [];
  } catch (error) {
    throw new Error("Failed to generate test questions: " + (error as Error).message);
  }
}

export async function evaluateTestAnswers(
  questions: TestQuestion[],
  answers: Record<string, string>
): Promise<{
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  feedback: string[];
}> {
  try {
    let correctAnswers = 0;
    const feedback: string[] = [];

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      
      if (question.type === "multiple_choice" && question.correctAnswer) {
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
          feedback.push(`Question ${question.id}: Correct`);
        } else {
          feedback.push(`Question ${question.id}: Incorrect. Expected: ${question.correctAnswer}`);
        }
      }
    });

    // For non-multiple choice questions, we'd need more sophisticated evaluation
    // For now, we'll give partial credit
    const nonMCQuestions = questions.filter(q => q.type !== "multiple_choice");
    const estimatedCorrectNonMC = Math.floor(nonMCQuestions.length * 0.7); // Assume 70% correct
    correctAnswers += estimatedCorrectNonMC;

    const score = Math.round((correctAnswers / questions.length) * 100);

    return {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      feedback,
    };
  } catch (error) {
    throw new Error("Failed to evaluate test answers: " + (error as Error).message);
  }
}

export async function checkHighMatchCandidates(
  job: any,
  storage: any,
  emailService: any
): Promise<{ notifiedCandidates: number; allMatches: Array<{ candidate: any; matchScore: number }> }> {
  try {
    console.log(`🔍 Checking ALL candidates for new job: ${job.title}`);
    
    // Get all candidates
    const candidates = await storage.getAllCandidates();
    console.log(`📊 Found ${candidates.length} candidates to notify`);
    
    const allMatches: Array<{ candidate: any; matchScore: number }> = [];
    let notifiedCandidates = 0;

    // Check each candidate
    for (const candidate of candidates) {
      try {
        // Get candidate's resumes
        const resumes = await storage.getResumesByCandidate(candidate.id);
        
        if (resumes.length === 0) {
          console.log(`⚠️  Candidate ${candidate.username} has no resumes, skipping`);
          continue;
        }

        // Use the most recent resume (or best one)
        const latestResume = resumes[resumes.length - 1];
        
        // Calculate job match
        const matchResult = await calculateJobMatch(
          latestResume.summary || "",
          job.description,
          job.requiredSkills
        );

        console.log(`📈 ${candidate.username}: ${matchResult.matchScore}% match`);

        // Send notification to ALL candidates with their match score
        allMatches.push({ candidate, matchScore: matchResult.matchScore });
        
        try {
          // Get recruiter info for the email
          const recruiter = await storage.getUser(job.recruiterId);
          const recruiterName = recruiter?.username || "Company";
          
          // Send notification email to ALL candidates
          await emailService.notifyHighMatchJob(
            candidate,
            job,
            matchResult.matchScore,
            recruiterName
          );
          
          notifiedCandidates++;
          console.log(`📧 Notified ${candidate.username} about new job (${matchResult.matchScore}% match)`);
          
        } catch (emailError) {
          console.error(`Failed to send email to ${candidate.username}:`, emailError);
          // Continue with other candidates even if one email fails
        }
      } catch (candidateError) {
        console.error(`Error processing candidate ${candidate.username}:`, candidateError);
        // Continue with other candidates
      }
    }

    console.log(`✅ Completed job matching check. Notified ${notifiedCandidates} candidates with match scores.`);
    
    return { notifiedCandidates, allMatches };
  } catch (error) {
    console.error("Failed to check candidates:", error);
    throw new Error("Failed to check candidates: " + (error as Error).message);
  }
}
