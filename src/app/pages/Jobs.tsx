import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    experience: 0,
    vacancies: 1,
  });

  const fetchJobs = async () => {
    try {
      const { data } = await jobAPI.getAll();
      setJobs(data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await jobAPI.create({
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()),
      });
      toast.success("Job created successfully");
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        skills: "",
        experience: 0,
        vacancies: 1,
      });
      fetchJobs();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create job");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await jobAPI.delete(id);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete job");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Job Positions</h1>
          <p className="text-gray-600">Manage job profiles and requirements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Senior Software Engineer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Job description..."
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  placeholder="React, TypeScript, Node.js"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience: parseInt(e.target.value),
                      })
                    }
                    min={0}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vacancies">Vacancies</Label>
                  <Input
                    id="vacancies"
                    type="number"
                    value={formData.vacancies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vacancies: parseInt(e.target.value),
                      })
                    }
                    min={1}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Job
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {jobs?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first job profile to start the recruitment process
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => (
            <Card key={job._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {job.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Skills Required
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job?.skillRequired?.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-600">Experience</p>
                      <p>{`${job?.experience ?? 0}`} years</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vacancies</p>
                      <p>{job.vacancies}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job._id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-sm flex gap-2 text-slate-500">
                    <p>At : </p>
                    <p>{job.createedAt?.toLocaleString()}</p>
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
