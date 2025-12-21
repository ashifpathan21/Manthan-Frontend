import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobAPI, folderAPI, reportAPI } from "../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Briefcase, Folder, FileText, Plus, TrendingUp } from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    folders: 0,
    reports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, foldersRes, reportsRes] = await Promise.all([
          jobAPI.getAll(),
          folderAPI.getAll(),
          reportAPI.getAll(),
        ]);
        setStats({
          jobs: jobsRes.data.data.length,
          folders: foldersRes.data.data.length,
          reports: reportsRes.data.data.length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Jobs",
      value: stats.jobs,
      icon: Briefcase,
      link: "/dashboard/jobs",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Resume Folders",
      value: stats.folders,
      icon: Folder,
      link: "/dashboard/folders",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Reports Generated",
      value: stats.reports,
      icon: FileText,
      link: "/dashboard/reports",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your recruitment process.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

    
    </div>
  );
}
