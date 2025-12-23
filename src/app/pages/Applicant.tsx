import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { applicantAPI, projectAPI } from "../../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

type Tab =
  | "overview"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certificates"
  | "social";

export default function Applicant() {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicantIds = [], currentIndex = 0 } = location.state || {};

  const [index, setIndex] = useState(currentIndex);
  const [applicant, setApplicant] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!applicantIds[index]) return;

    setLoading(true);
    applicantAPI
      .getById(applicantIds[index])
      .then((res) => setApplicant(res.data.data))
      .catch(() => toast.error("Failed to load applicant"))
      .finally(() => setLoading(false));
  }, [index, applicantIds]);

  /* ================= GUARDS ================= */
  if (!applicantIds.length) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <AlertTriangle className="mx-auto mb-2" />
        No applicants available
      </Card>
    );
  }

  if (loading) return <div className="py-20 text-center">Loading…</div>;
  if (!applicant) return null;

  /* ================= ACTIONS ================= */
  const verifySocial = async () => {
    try {
      toast.loading("Verifying social profiles…");
      const res = await applicantAPI.verifyById(applicant._id);
      setApplicant(res.data.data);
      toast.success("Social verification complete");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Verification failed");
    }
  };

  const analyseProject = async (url: string) => {
    try {
      toast.loading("Analyzing project…");
      const res = await projectAPI.analyse(url);
      toast.success(`Safe: ${res.data.data.isSafe ? "Yes" : "No"}`);
    } catch {
      toast.error("Project analysis failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* ================= HEADER ================= */}
      <Card>
        <CardContent className="p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">{applicant.name}</h2>
            <p className="text-sm text-gray-500">{applicant.location}</p>
            <p className="text-sm text-gray-500">{applicant.social?.email}</p>
            <p className="text-sm text-gray-500">
              📞 {applicant.social?.Phone}
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-sm text-gray-500">Match Score</p>
            <p className="text-4xl font-bold">{applicant.score}</p>
            <Badge>{applicant.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ================= VERDICT ================= */}
      <Card className="border-l-4 border-green-500">
        <CardContent className="p-4">
          <p className="font-semibold mb-1">Verdict</p>
          <p className="text-sm text-gray-700">{applicant.verdict}</p>

          {applicant.failureReason && (
            <p className="text-sm text-red-600 mt-2">
              ⚠ {applicant.failureReason}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= NAV ================= */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((i: number) => i - 1)}
        >
          <ChevronLeft /> Previous
        </Button>

        <Button
          variant="outline"
          disabled={index === applicantIds.length - 1}
          onClick={() => setIndex((i: number) => i + 1)}
        >
          Next <ChevronRight />
        </Button>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-2 flex-wrap">
        {[
          "overview",
          "skills",
          "experience",
          "projects",
          "education",
          "certificates",
          "social",
        ].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "default" : "outline"}
            onClick={() => setTab(t as Tab)}
          >
            {t.toUpperCase()}
          </Button>
        ))}

        <Button
          variant="secondary"
          onClick={() => window.open(applicant.resume?.cloudinary?.url , "_blank")}
        >
          <FileText className="w-4 h-4 mr-1" />
          View Resume
        </Button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      <Card>
        <CardHeader>
          <CardTitle>{tab.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <>
              <p>
                <b>Status:</b> {applicant.status}
              </p>
            </>
          )}

          {/* SKILLS */}
          {tab === "skills" && (
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map((s: string) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {/* EXPERIENCE */}
          {tab === "experience" &&
            applicant.experience.map((e: any) => (
              <Card key={e._id} className="p-4">
                <p className="font-semibold">{e.title}</p>
                <p className="text-sm text-gray-500">
                  {e.company} • {e.duration} months
                </p>
                <p className="text-sm mt-2">{e.description}</p>
              </Card>
            ))}

          {/* PROJECTS */}
          {tab === "projects" &&
            applicant.projects.map((p: any) => (
              <Card key={p._id} className="p-4">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-gray-600 mb-2">{p.description}</p>

                {p.link && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(p.link, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Repo
                    </Button>

                    <Button size="sm" onClick={() => analyseProject(p.link)}>
                      Threat & SEO
                    </Button>
                  </div>
                )}
              </Card>
            ))}

          {/* EDUCATION */}
          {tab === "education" &&
            applicant.qualifications.map((q: any) => (
              <Card key={q._id} className="p-4">
                <p className="font-semibold">{q.course}</p>
                <p className="text-sm">{q.institute}</p>
                <p className="text-sm text-gray-500">CGPA: {q.marks}</p>
              </Card>
            ))}

          {/* CERTIFICATES */}
          {tab === "certificates" &&
            applicant.certificates.map((c: any) => (
              <p key={c._id} className="text-sm">
                • {c.title}
              </p>
            ))}

          {/* SOCIAL */}
          {tab === "social" && (
            <>
              <div className="p-3 border  grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 px-6 capitalize text-lg font-semibold ">
                {Object.entries(applicant.social).map(
                  ([key, value]) =>
                    key !== "email" &&
                    key !== "Phone" &&
                    value !== "" && (
                      <div>
                        {!Array.isArray(value)
                          ? key && (
                              <Button
                                className="text-cyan-800  capitalize "
                                onClick={() =>
                                  window.open(value as string, "_blank")
                                }
                                variant={"link"}
                              >
                                {key}
                              </Button>
                            )
                          : value?.length > 0 && (
                              <div className="flex justify-between p-2 ">
                                <p>{key}</p>
                                <div className="flex flex-col gap-2 p-1 ">
                                  {value?.map((value: string, i) => (
                                    <Button
                                      className="text-cyan-900 capitalize "
                                      onClick={() =>
                                        window.open(value, "_blank")
                                      }
                                      variant={"link"}
                                    >
                                      Site {i + 1}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                      </div>
                    )
                )}
              </div>
              <Button onClick={verifySocial}>
                <ShieldCheck className="w-4 h-4 mr-1" />
                Verify Social Authenticity
              </Button>

              {applicant.authentication.map((a: any, i: number) => (
                <Card key={i} className="p-3">
                  <p className="font-medium capitalize">{a.platform}</p>
                  {a.error ? (
                    <p className="text-red-500 text-sm">{a.error}</p>
                  ) : (
                    <pre className="text-xs">
                      {JSON.stringify(a.stats, null, 2)}
                    </pre>
                  )}
                </Card>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
