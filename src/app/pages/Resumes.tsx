import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { folderAPI, resumeAPI } from "../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Trash2, Eye, SkipBack, ArrowBigLeft } from "lucide-react";
import { toast } from "sonner";

export default function Resumes() {
  const { folderId } = useParams();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchResumes = async () => {
    try {
      const { data } = await folderAPI.getById(folderId!);
      setResumes(data.data.totalFiles);
    } catch {
      toast.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await resumeAPI.delete(id);
      toast.success("Resume deleted");
      fetchResumes();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-center p-2">
        <Button className="p-2 " onClick={() => navigate(-1)}>
          <ArrowBigLeft />
        </Button>
        <h1 className="text-xl font-semibold">Resumes</h1>
      </div>  

      {resumes.length === 0 ? (
        <p className="text-gray-500">No resumes found</p>
      ) : (
        <div className="flex flex-col  gap-4 w-full">
          {resumes.map((resume) => (
            <Card className="w-full " key={resume._id}>
              <CardHeader>
                <CardTitle className="truncate">
                  {resume.originalName}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 flex gap-3 justify-between text-sm text-gray-600">
                <p>
                  Status: <span className="font-medium">{resume.status}</span>
                </p>
                <p>Uploaded: {new Date(resume.createdAt).toLocaleString()}</p>

                <div className="flex gap-2">
                  {resume.status === "DONE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(resume.cloudinary.url, "_blank")
                      }
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(resume._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
