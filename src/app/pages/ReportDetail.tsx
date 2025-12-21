import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reportAPI } from "../../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  Shield,
  GitBranch,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const { data } = await reportAPI.getById(id);
        console.log(data);
        setReport(data.data);
        setApplicants(data.data.results);
      } catch (error) {
        toast.error("Failed to fetch report details");
        navigate("/dashboard/reports");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/reports")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">
          {report.job?.title || "Report Details"}
        </h1>
        <p className="text-gray-600">Folder: {report.folder?.name}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Skills Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{report.priority?.skills || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Experience Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{report.priority?.experience || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projects Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{report.priority?.projects || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Location Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{report.priority?.location || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Qualifications Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {report.priority?.qualifications || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicants ({applicants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {applicants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No applicants found. The system is processing resumes...
            </div>
          ) : (
            <div className="space-y-4">
              {applicants
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((applicant, index) => (
                  <Card
                    key={applicant._id}
                    className="border hover:shadow-md transition cursor-pointer"
                    onClick={() =>
                      navigate(`/dashboard/applicant/${applicant._id}`, {
                        state: { applicant },
                      })
                    }
                  >
                    <CardContent className="pt-5 space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {applicant.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {applicant.social?.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {applicant.location}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {applicant.score}
                          </div>
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
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Top Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {applicant.skills
                            ?.slice(0, 6)
                            .map((skill: string, i: number) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          {applicant.skills?.length > 6 && (
                            <span className="text-xs text-gray-400">
                              +{applicant.skills.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Experience summary */}
                      <div className="text-sm text-gray-600">
                        Internships: {applicant.experience?.length || 0}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
