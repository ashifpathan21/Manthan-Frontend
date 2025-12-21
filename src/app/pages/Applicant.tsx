import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { applicantAPI, projectAPI } from "../../lib/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/* ======================= TYPES ======================= */

interface SocialLinks {
  email?: string;
  github?: string;
  linkedin?: string;
}

interface Experience {
  _id: string;
  title: string;
  company: string;
  description: string;
  duration: number;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  link?: string;
}

interface Qualification {
  _id: string;
  institute: string;
  course: string;
  marks: number;
}

interface Applicant {
  _id: string;
  name: string;
  location?: string;
  score: number;
  status: "VERIFIED" | "UNVERIFIED" | "FAILED";
  failureReason?: string;
  verdict?: string;

  social?: SocialLinks;
  skills: string[];
  experience: Experience[];
  projects: Project[];
  qualifications: Qualification[];
}

/* Project analysis response */
interface ProjectAnalysisResult {
  isSafe: boolean;
  threat: unknown;
  seo?: {
    score?: number;
  };
}

type ProjectAnalysisMap = Record<string, ProjectAnalysisResult>;

/* ======================= COMPONENT ======================= */

const Applicant = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [applicant, setApplicant] = useState<Applicant | null>(
    (location.state as { applicant?: Applicant })?.applicant || null
  );
  const [loading, setLoading] = useState<boolean>(!applicant);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [projectChecks, setProjectChecks] =
    useState<ProjectAnalysisMap>({});

  /* ---------------- FETCH APPLICANT (ON REFRESH SAFE) ---------------- */
  useEffect(() => {
    if (!applicant && id) {
      applicantAPI
        .getById(id)
        .then((res) => setApplicant(res.data.data as Applicant))
        .catch(() => toast.error("Failed to load applicant"))
        .finally(() => setLoading(false));
    }
  }, [id, applicant]);

  /* ---------------- VERIFY APPLICANT ---------------- */
  const handleVerify = async () => {
    if (!applicant) return;

    try {
      setVerifying(true);
      const res = await applicantAPI.verifyById(applicant._id);
      setApplicant(res.data.data as Applicant);
      toast.success("Applicant verification completed");
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  /* ---------------- PROJECT ANALYSIS ---------------- */
  const analyzeProject = async (url: string) => {
    try {
      const res = await projectAPI.analyse(url);
      setProjectChecks((prev) => ({
        ...prev,
        [url]: res.data.data as ProjectAnalysisResult,
      }));
    } catch {
      toast.error("Project analysis failed");
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading || !applicant) {
    return <div className="text-center py-20">Loading applicant…</div>;
  }

  /* ======================= UI ======================= */

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">

      {/* BASIC INFO */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">{applicant.name}</h1>
        {applicant.location && (
          <p className="text-gray-600">{applicant.location}</p>
        )}
        {applicant.social?.email && (
          <p className="text-sm">{applicant.social.email}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <Badge
            variant={
              applicant.status === "VERIFIED"
                ? "default"
                : applicant.status === "FAILED"
                ? "destructive"
                : "secondary"
            }
          >
            {applicant.status}
          </Badge>

          <span className="text-sm text-gray-500">
            Score: {applicant.score}
          </span>
        </div>
      </section>

      {/* SKILLS */}
      <section>
        <h2 className="font-semibold mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {applicant.skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section>
        <h2 className="font-semibold mb-3">Experience</h2>
        <div className="space-y-3">
          {applicant.experience.map((exp) => (
            <Card key={exp._id}>
              <CardContent className="p-4 space-y-1">
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-sm">{exp.description}</p>
                <p className="text-xs text-gray-400">
                  Duration: {exp.duration} months
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section>
        <h2 className="font-semibold mb-3">Projects</h2>
        <div className="space-y-4">
          {applicant.projects.map((project) => (
            <Card key={project._id}>
              <CardContent className="p-4 space-y-2">
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-gray-600">
                  {project.description}
                </p>

                {project.link && (
                  <div className="flex items-center gap-3">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 flex items-center gap-1"
                    >
                      Visit Project <ExternalLink className="w-3 h-3" />
                    </a>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeProject(project.link!)}
                    >
                      SEO & Threat Check
                    </Button>
                  </div>
                )}

                {project.link &&
                  projectChecks[project.link] && (
                    <div className="text-xs space-y-1 mt-2">
                      <p>
                        Safe:
                        {projectChecks[project.link].isSafe
                          ? " Yes"
                          : " No"}
                      </p>
                      <p>
                        SEO Score:
                        {projectChecks[project.link].seo?.score ??
                          " N/A"}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* QUALIFICATIONS */}
      <section>
        <h2 className="font-semibold mb-3">Qualifications</h2>
        <div className="space-y-2">
          {applicant.qualifications.map((q) => (
            <div key={q._id} className="text-sm">
              <p className="font-medium">{q.course}</p>
              <p className="text-gray-600">{q.institute}</p>
              <p className="text-xs">Marks: {q.marks}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VERIFICATION */}
      <section className="border-t pt-6 space-y-3">
        <Button
          onClick={handleVerify}
          disabled={verifying}
          className="flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          {verifying ? "Verifying..." : "Verify Skills & Social Profiles"}
        </Button>

        {applicant.failureReason && (
          <p className="text-sm text-red-500">
            Failure Reason: {applicant.failureReason}
          </p>
        )}
      </section>

      {/* VERDICT */}
      {applicant.verdict && (
        <section>
          <h2 className="font-semibold mb-2">Final Verdict</h2>
          <p className="text-sm text-gray-700">
            {applicant.verdict}
          </p>
        </section>
      )}
    </div>
  );
};

export default Applicant;
