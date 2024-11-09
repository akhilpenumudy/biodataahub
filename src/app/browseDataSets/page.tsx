"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  Calendar,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Dataset {
  curation_notes: any;
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
  file_size: number;
  access_type: string;
  price: number;
  downloads: number;
  tags: string[];
  user_id: string;
  author_name?: string;
}

export default function BrowseDatasets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDatasets() {
      try {
        // First get all datasets
        const { data: datasetsData, error: datasetsError } = await supabase
          .from("datasets")
          .select("*")
          .order("created_at", { ascending: false });

        if (datasetsError) {
          console.error("Datasets error:", datasetsError);
          throw datasetsError;
        }

        // Then get user data for each dataset
        const processedDatasets = await Promise.all(
          datasetsData.map(async (dataset) => {
            const { data: userData } = await supabase
              .from("auth.users")
              .select("email, raw_user_meta_data")
              .eq("id", dataset.user_id)
              .single();

            return {
              ...dataset,
              author_name:
                userData?.raw_user_meta_data?.full_name ||
                userData?.email?.split("@")[0] ||
                "Anonymous",
            };
          })
        );

        console.log("Processed datasets:", processedDatasets);
        setDatasets(processedDatasets);

        // Extract unique tags
        const allTags = new Set<string>();
        processedDatasets.forEach((dataset) => {
          if (dataset.tags && Array.isArray(dataset.tags)) {
            dataset.tags.forEach((tag: string) => allTags.add(tag));
          }
        });

        setUniqueTags(Array.from(allTags));
      } catch (error) {
        console.error("Error fetching datasets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDatasets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch =
      dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.author_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      filterTag === "all" || (dataset.tags && dataset.tags.includes(filterTag));

    return matchesSearch && matchesTag;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-sm">Browse Public Datasets</h1>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {uniqueTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDatasets.map((dataset) => (
              <Card
                key={dataset.id}
                className={`flex flex-col transition-all duration-200 ease-in-out ${
                  expandedId === dataset.id ? "md:col-span-2 lg:col-span-3" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {dataset.author_name}
                      </span>
                    </div>
                    {dataset.access_type === "paid" ? (
                      <Badge variant="secondary" className="bg-green-100">
                        ${dataset.price}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100">
                        Free
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-1">
                    {dataset.title}
                  </CardTitle>

                  {dataset.tags && dataset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dataset.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(dataset.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{formatFileSize(dataset.file_size)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>{dataset.downloads || 0} downloads</span>
                    </div>
                  </div>

                  {expandedId === dataset.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <h3 className="font-semibold mb-2">Full Description</h3>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html:
                              dataset.description || "No description provided",
                          }}
                        />
                      </div>
                      {dataset.curation_notes && (
                        <div>
                          <h3 className="font-semibold mb-2">Curation Notes</h3>
                          <p className="text-sm text-muted-foreground">
                            {dataset.curation_notes}
                          </p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold mb-2">
                          Dataset Information
                        </h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Author: {dataset.author_name}</p>
                          <p>Upload Date: {formatDate(dataset.created_at)}</p>
                          <p>File Size: {formatFileSize(dataset.file_size)}</p>
                          <p>Downloads: {dataset.downloads || 0}</p>
                          <p>
                            Access Type:{" "}
                            {dataset.access_type === "paid"
                              ? `Paid - $${dataset.price}`
                              : "Free Open Source"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <a
                      href={dataset.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleExpand(dataset.id)}
                  >
                    {expandedId === dataset.id ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        View Details
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
