import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportAPI, jobAPI, folderAPI } from "../../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Plus, FileText, Eye, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";

export function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobId: "",
    folderId: "",
    skills: 40,
    experience: 30,
    projects: 20,
    location: 5,
    qualifications: 5,
  });

  const fetchData = async () => {
    try {
      const [reportsRes, jobsRes, foldersRes] = await Promise.all([
        reportAPI.getAll(),
        jobAPI.getAll(),
        folderAPI.getAll(),
      ]);
      setReports(reportsRes.data.data);
      setJobs(jobsRes.data.data);
      setFolders(foldersRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    console.log(reports);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await reportAPI.delete(id);
      toast.success("Report deleted successfully");
      await fetchData();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const total =
      formData.skills +
      formData.experience +
      formData.projects +
      formData.location +
      formData.qualifications;
    if (total !== 100) {
      toast.error("Priorities must sum to 100%");
      return;
    }

    try {
      await reportAPI.create({
        jobId: formData.jobId,
        folderId: formData.folderId,
        priority: {
          skills: formData.skills,
          experience: formData.experience,
          projects: formData.projects,
          location: formData.location,
          qualifications: formData.qualifications,
        },
      });
      toast.success("Report generation started!");
      setIsDialogOpen(false);
      setFormData({
        jobId: "",
        folderId: "",
        skills: 40,
        experience: 30,
        projects: 20,
        location: 5,
        qualifications: 5,
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create report");
    }
  };

  const viewReport = (id: string) => {
    navigate(`/dashboard/reports/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );
  }

  const reportStatus: any = {
    DONE: (
      <span className="px-2 p-1  text-sm font-mono font-semibold rounded-2xl text-slate-800 bg-green-500">
        Done
      </span>
    ),
    FAILED: (
      <span className="px-2 p-1 text-sm font-mono font-semibold rounded-2xl text-slate-800 bg-red-500">
        Failed
      </span>
    ),
    PROCESSING: (
      <span className="px-2 text-sm font-mono font-semibold p-1 rounded-2xl text-slate-800 bg-blue-500">
        Processing
      </span>
    ),
    PENDING: (
      <span className="px-2 p-1 text-sm font-mono font-semibold rounded-2xl text-slate-800 bg-gray-500">
        Pending
      </span>
    ),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">
            Generate and view candidate assessment reports
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="h-full">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job">Select Job</Label>
                <Select
                  value={formData.jobId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jobId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs?.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder">Select Folder</Label>
                <Select
                  value={formData.folderId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, folderId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder._id} value={folder._id}>
                        {folder.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label>Weighted Priorities (must sum to 100%)</Label>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Skills</span>
                      <span>{formData.skills}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skills: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Experience</span>
                      <span>{formData.experience}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Projects</span>
                      <span>{formData.projects}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.projects}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projects: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Location</span>
                      <span>{formData.location}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Qualifications</span>
                      <span>{formData.qualifications}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.qualifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qualifications: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="text-sm text-center">
                  Total:
                  {formData.skills +
                    formData.experience +
                    formData.projects +
                    formData.location +
                    formData.qualifications}
                  %
                  {formData.skills +
                    formData.experience +
                    formData.projects +
                    formData.location +
                    formData.qualifications !==
                    100 && (
                    <span className="text-red-500 ml-2">(Must equal 100%)</span>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Generate Report
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reports?.length === 0 ? ( 
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Generate your first report to analyze candidates
            </p> 
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports?.map((report) => (
            <Card
              key={report._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 truncate">
                        {report.job?.title || "Report"}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {report.folder?.title || "Folder"}
                      </CardDescription>
                      <CardDescription>
                        {reportStatus[report?.status]}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Priorities</p>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Skills</span>
                        <span>{report.priority?.skills || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experience</span>
                        <span>{report.priority?.experience || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projects</span>
                        <span>{report.priority?.projects || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projects</span>
                        <span>{report.priority?.location || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projects</span>
                        <span>{report.priority?.qualifications || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Applicants: </span>
                    <span>{report.results?.length || 0}</span>
                  </div>
                  <div className="flex gap-3 items-center max-w-full ">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => viewReport(report._id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(report._id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
