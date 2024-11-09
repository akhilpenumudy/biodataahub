"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TiptapEditor } from "./tiptap-editor";
import { TagInput, Tag } from "emblor";

export default function DatasetUploadForm() {
  const [accessType, setAccessType] = useState("opensource");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Read and preview the file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split("\n").slice(0, 6); // Get first 6 lines
          const rows = lines.map((line) => line.split(","));
          setPreview(rows);
        } catch (error) {
          console.error("Error parsing file:", error);
          setError("Error reading file. Please make sure it's a valid CSV.");
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const title = (form.querySelector("#title") as HTMLInputElement)?.value;
      const curation = (form.querySelector("#curation") as HTMLTextAreaElement)
        ?.value;
      const price =
        accessType === "paid"
          ? Number((form.querySelector("#price") as HTMLInputElement)?.value)
          : 0;

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!file) {
        throw new Error("Please select a file to upload");
      }

      // Create unique filename
      const fileName = `${uuidv4()}.${file.name.split(".").pop()}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("datasets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("datasets").getPublicUrl(filePath);

      // Create dataset record with tags
      const { error: dbError } = await supabase.from("datasets").insert({
        title,
        description,
        curation_notes: curation,
        file_path: filePath,
        file_size: file.size,
        access_type: accessType,
        price,
        user_id: user.id,
        file_url: publicUrl,
        tags: tags.map((tag) => tag.text), // Store just the tag text
      });

      if (dbError) throw dbError;

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Upload Your Dataset</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="file">Dataset File (CSV)</Label>
          <Input
            id="file"
            name="file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
          />
        </div>

        {preview.length > 0 && (
          <div className="mt-6 border rounded-lg p-4 bg-background">
            <h2 className="text-xl font-semibold mb-4">Dataset Preview</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview[0].map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.slice(1).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="title">Dataset Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <TiptapEditor
            value={description}
            onChange={setDescription}
            placeholder="Describe your dataset..."
          />
        </div>

        <div>
          <Label htmlFor="curation">How it was curated</Label>
          <Textarea id="curation" name="curation" required />
        </div>

        <RadioGroup
          defaultValue="opensource"
          onValueChange={setAccessType}
          name="accessType"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="opensource" id="opensource" />
            <Label htmlFor="opensource">Open Source</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="paid" />
            <Label htmlFor="paid">Paid</Label>
          </div>
        </RadioGroup>

        {accessType === "paid" && (
          <div>
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
        )}

        <div>
          <Label>Tags</Label>
          <TagInput
            placeholder="Add tags (press enter after each tag)"
            tags={tags}
            setTags={setTags}
            activeTagIndex={activeTagIndex}
            setActiveTagIndex={setActiveTagIndex}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Add relevant tags to help others find your dataset
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Uploading..." : "Upload Dataset"}
        </Button>
      </form>
    </div>
  );
}
