import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reportAPI } from "../../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const TABS = ["Overview", "Job", "Priority", "Applicants"];

export function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    if (!id) {
      toast.error("Invalid report id");
      navigate("/dashboard/reports");
      return;
    }

    setLoading(true);
    reportAPI
      .getById(id)
      .then((res) => {
        if (!res?.data?.data) throw new Error();
        console.log(res.data.data);
        setReport(res.data.data);
        setApplicants(res.data.data.results || []);
      })
      .catch(() => {
        toast.error("Failed to load report");
        navigate("/dashboard/reports");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return <div className="py-20 text-center">Loading report…</div>;
  }

  if (!report) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-lg font-semibold">Report not available</p>
        <Button onClick={() => navigate("/dashboard/reports")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* TOP BAR */}
      <Button variant="ghost" onClick={() => navigate("/dashboard/reports")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* HEADER */}
      <Card>
        <CardContent className="p-6 space-y-2">
          <h1 className="text-3xl font-bold">{report.job?.title}</h1>
          <p className="text-xl text-gray-600">
            Folder: {report.folder?.title || "—"}
          </p>
          <Badge>{report.status}</Badge>
        </CardContent>
      </Card>

      {/* TABS */}
      <div className="flex gap-2 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm ${
              activeTab === tab
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "Overview" && (
        <Card>
          <CardContent className="p-6 space-y-2">
            <p className="text-sm text-gray-700">
              This report analyzes <strong>{applicants.length}</strong>{" "}
              applicants for the role <strong>{report.job?.title}</strong>.
            </p>
            <p className="text-sm text-gray-600">
              Applicants are ranked using weighted priorities.
            </p>
          </CardContent>
        </Card>
      )}

      {/* JOB DETAILS */}
      {activeTab === "Job" && (
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-medium">{report.jobProfile?.title}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm">
                {report.jobProfile?.description || "No description provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-sm">
                {report.jobProfile?.location || "No Location provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vacancies</p>
              <p className="text-sm">
                {report.jobProfile?.vacancies || "No data provided"}
              </p>
            </div>

            {report.jobProfile?.skillRequired?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Required Skills</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {report.jobProfile.skillRequired.map((s: string) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="text-sm">{report.jobProfile.experience ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PRIORITY */}
      {activeTab === "Priority" && (
        <Card>
          <CardHeader>
            <CardTitle>Scoring Priority</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(report.priority || {}).map(([key, value]: any) => (
              <div key={key} className="text-center">
                <p className="text-sm text-gray-500 capitalize">{key}</p>
                <p className="text-2xl font-bold">{value}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* APPLICANTS */}
      {activeTab === "Applicants" && (
        <Card>
          <CardHeader>
            <CardTitle>Applicants</CardTitle>
            <p className="text-sm text-gray-500">
              Sorted by score (highest first)
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {applicants.length ? (
              applicants
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((applicant, index) => (
                  <Card
                    key={applicant._id}
                    className="cursor-pointer hover:shadow-md transition"
                    onClick={() =>
                      navigate(`/dashboard/applicant/${applicant._id}`, {
                        state: {
                          applicantIds: applicants.map((a) => a._id),
                          currentIndex: index,
                        },
                      })
                    }
                  >
                    <CardContent className="p-4 flex justify-between">
                      <div>
                        <p className="font-semibold">
                          #{index + 1} {applicant.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {applicant.location || "—"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {applicant.score ?? "—"}
                        </p>
                        <Badge>{applicant.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <p className="text-sm text-gray-500">
                No applicants found for this report
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
