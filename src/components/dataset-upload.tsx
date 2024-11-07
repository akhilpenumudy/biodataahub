"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DatasetUploadForm() {
  const [accessType, setAccessType] = useState("opensource");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    curation: "",
    price: "0",
  });
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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

      // 1. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("datasets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("datasets").getPublicUrl(filePath);

      // 2. Create dataset record
      const { error: dbError } = await supabase.from("datasets").insert({
        title: formData.title,
        description: formData.description,
        curation_notes: formData.curation,
        file_path: filePath,
        file_size: file.size,
        access_type: accessType,
        price: accessType === "paid" ? Number(formData.price) : 0,
        user_id: user.id,
        file_url: publicUrl,
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
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="title">Dataset Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="curation">How it was curated</Label>
          <Textarea
            id="curation"
            name="curation"
            value={formData.curation}
            onChange={handleInputChange}
            required
          />
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
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

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
