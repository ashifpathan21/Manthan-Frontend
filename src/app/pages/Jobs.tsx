import { useEffect, useState } from "react";
import { jobAPI } from "../../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Plus, Briefcase, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

export function Jobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    location: "",
    experience: 0,
    vacancies: 1,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      skills: "",
      location: "",
      experience: 0,
      vacancies: 1,
    });
    setEditingJobId(null);
  };

  const fetchJobs = async () => {
    try {
      const { data } = await jobAPI.getAll();
      setJobs(data.data);
    } catch {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      experienceRequired: formData.experience,
      requiredSkills: formData.skills.split(",").map((s) => s.trim()),
    };

    try {
      if (editingJobId) {
        await jobAPI.update(editingJobId, payload);
        toast.success("Job updated");
      } else {
        await jobAPI.create(payload);
        toast.success("Job created");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    try {
      await jobAPI.delete(id);
      toast.success("Job deleted");
      fetchJobs();
    } catch {
      toast.error("Delete failed");
    }
  };

  const openEdit = (job: any) => {
    setEditingJobId(job._id);
    setFormData({
      title: job.title,
      description: job.description,
      skills: (job.skillRequired || []).join(", "),
      experience: job.experience ?? 0,
      vacancies: job.vacancies ?? 1,
      location: job.location || "",
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Job Positions</h1>
          <p className="text-gray-600">Manage job profiles and requirements</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingJobId ? "Edit Job" : "Create Job"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Label>Job Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />

              <Label>Description</Label>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />

              <Label>Skills (comma separated)</Label>
              <Input
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                required
              />
              <Label>Location : Remote , Banglore etc etc</Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Vacancies</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.vacancies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vacancies: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingJobId ? "Update Job" : "Create Job"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* JOB LIST */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No jobs yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job._id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {job.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {job.skillRequired?.map((s: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-indigo-100 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between text-sm">
                  <p>{job.experience ?? 0} yrs</p>
                  <p>{job.vacancies} openings</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(job)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(job._id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  Created at:
                  {job.createedAt
                    ? new Date(job.createedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
