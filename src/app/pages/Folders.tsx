import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { folderAPI, resumeAPI } from "../../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import {
  Plus,
  Folder as FolderIcon,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
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

export function Folders() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadDialog, setUploadDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "" });
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchFolders = async () => {
    try {
      const { data } = await folderAPI.getAll();
      setFolders(data.data);
    } catch (error) {
      toast.error("Failed to fetch folders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await folderAPI.create(formData);
      toast.success("Folder created successfully");
      setIsDialogOpen(false);
      setFormData({ title: "" });
      fetchFolders();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create folder");
    }
  };

  const handleUpload = async (folderId: string) => {
    if (!files || files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);
    try {
      Array.from(files).forEach(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
          await resumeAPI.upload(folderId, formData);
        } catch (error: any) {
          console.log(error);
          toast.error(
            error.response?.data?.message || "Failed to upload resumes"
          );
        }
      });
      toast.success("Resumes uploaded successfully");
    } catch (err) {
      toast.error("Something went wrong try again !");
    } finally {
      setUploadDialog(null);
      setFiles(null);
      setUploading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;
    try {
      await folderAPI.delete(id);
      toast.success("Folder deleted successfully");
      fetchFolders();
    } catch (error) {
      toast.error("Failed to delete folder");
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
          <h1 className="text-gray-900 mb-2">Resume Folders</h1>
          <p className="text-gray-600">
            Organize and manage resume collections
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Folder Name</Label>
                <Input
                  id="name"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Q4 2024 Applicants"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Folder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {folders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 mb-2">No folders yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create a folder to start uploading resumes
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders?.map((folder) => (
            <Card
              key={folder._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <FolderIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 truncate">
                        {folder.title}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{folder.totalFiles?.length || 0} resumes</span>
                    <span>{folder.processedFiles?.length || 0} processed</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setUploadDialog(folder._id)}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(folder._id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-slate-600">
                {folder?.createdAt?.toLocaleString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={uploadDialog !== null}
        onOpenChange={() => setUploadDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resumes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resumes">Select PDF Files</Label>
              <Input
                id="resumes"
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => setFiles(e.target.files)}
              />
              {files && (
                <p className="text-sm text-gray-600">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
            <Button
              onClick={() => uploadDialog && handleUpload(uploadDialog)}
              disabled={uploading || !files}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload Resumes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
