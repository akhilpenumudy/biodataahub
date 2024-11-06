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

export default function DatasetUploadForm() {
  const [accessType, setAccessType] = useState("opensource");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split("\n").slice(0, 6); // Get first 6 lines (including header)
        const rows = lines.map((line) => line.split(","));
        setPreview(rows);
        // Scroll to the preview section
        setTimeout(() => {
          const previewElement = document.getElementById("dataset-preview");
          previewElement?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Here you would typically send the formData to your API
    console.log("Form data:", Object.fromEntries(formData));
    console.log("File:", file);

    // Reset form (in a real app, you'd do this after successful API response)
    event.currentTarget.reset();
    setFile(null);
    setAccessType("opensource");
    setPreview([]);
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

        {preview.length > 0 && (
          <div id="dataset-preview" className="mt-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Dataset Preview</h2>
            <div className="overflow-x-auto border rounded-lg">
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
          <Textarea id="description" name="description" required />
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
        <Button type="submit" className="w-full">
          Upload Dataset
        </Button>
      </form>
    </div>
  );
}
