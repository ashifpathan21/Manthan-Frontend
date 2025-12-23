import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { folderAPI, resumeAPI } from "../../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import {
  Plus,
  Folder as FolderIcon,
  Upload,
  FileText,
  Trash2,
  Pencil,
  Eye,
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

export function Folders() {
  const navigate = useNavigate();

  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchFolders = async () => {
    try {
      const { data } = await folderAPI.getAll();
      setFolders(data.data);
    } catch {
      toast.error("Failed to fetch folders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await folderAPI.create({ title });
      toast.success("Folder created");
      setTitle("");
      setIsCreateOpen(false);
      fetchFolders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editFolderId || !title.trim()) return;

    try {
      await folderAPI.update(editFolderId, { title });
      toast.success("Folder updated");
      setEditFolderId(null);
      setTitle("");
      fetchFolders();
    } catch {
      toast.error("Update failed");
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this folder?")) return;
    try {
      await folderAPI.delete(id);
      toast.success("Folder deleted");
      fetchFolders();
    } catch {
      toast.error("Delete failed");
    }
  };

  // UPLOAD
  const handleUpload = async () => {
    if (!files || !uploadFolderId) {
      toast.error("Select files");
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        await resumeAPI.upload(uploadFolderId, fd);
      }
      toast.success("Resumes uploaded");
      setFiles(null);
      setUploadFolderId(null);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Resume Folders</h1>
          <p className="text-sm text-gray-500">
            Organize and manage resume collections
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
              <Label>Folder Name</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* EMPTY */}
      {folders.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <FolderIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No folders created</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <Card key={folder._id} className="hover:shadow-md transition">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="cursor-pointer truncate hover:underline">
                    {folder.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{folder.totalFiles?.length || 0} resumes</span>
                  <span>{folder.processedFiles?.length || 0} processed</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadFolderId(folder._id)}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
                {new Date(folder.createdAt).toLocaleString()}
              </CardContent>

              <CardFooter className="text-xs text-gray-500">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/dashboard/resumes/${folder._id}`)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Resumes
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditFolderId(folder._id);
                      setTitle(folder.title);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(folder._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <Dialog open={!!editFolderId} onOpenChange={() => setEditFolderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Folder Name</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button onClick={handleUpdate} className="w-full">
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* UPLOAD MODAL */}
      <Dialog
        open={!!uploadFolderId}
        onOpenChange={() => setUploadFolderId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resumes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => setFiles(e.target.files)}
            />
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
