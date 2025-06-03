import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  File,
  FileImage,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Label = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) => {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  );
};

const SubmitRequest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const navigate = useNavigate();
const formSchema = z
  .object({
    description: z
      .string()
      .min(10, {
        message: "Description must be at least 10 characters.",
      })
      .max(1000, {
        message: "Description must not exceed 1000 characters.",
      }),
    department: z.string().optional(),
    location: z.string().min(3, {
      message: "Location must be at least 3 characters.",
    }),
    contactNumber: z
      .string()
      .min(10, {
        message: "Please enter a valid phone number with at least 10 digits.",
      })
      .refine((val) => /^\d+$/.test(val), {
        message: "Phone number can only contain digits.",
      }),
    preferredDate: z
      .string()
      .min(1, {
        message: "Please select a preferred date.",
      })
      .refine((val) => {
        const inputDate = new Date(val);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return inputDate >= new Date(tomorrow.toDateString());
      }, {
        message: "Preferred date must be at least tomorrow.",
      }),
    preferredTimeStart: z.string().min(1, {
      message: "Please select a start time.",
    }),
    preferredTimeEnd: z.string().min(1, {
      message: "Please select an end time.",
    }),
    officeHoursStart: z.string().min(1, {
      message: "Please provide your office hours start time.",
    }),
    officeHoursEnd: z.string().min(1, {
      message: "Please provide your office hours end time.",
    }),
  })
  .refine(
    (data) => data.preferredTimeEnd > data.preferredTimeStart,
    {
      message: "Available Until must be after Available From.",
      path: ["preferredTimeEnd"],
    }
  );

  const departments = [
    { id: "Hardware Support", name: "Hardware Support" },
    { id: "Software Support", name: "Software Support" },
    { id: "Network Support", name: "Network Support" },
    { id: "Printer Support", name: "Printer Support" },
    { id: "Account Management", name: "Account Management" },
    { id: "Other", name: "Other" },
    { id: "unknown", name: "I don't know" },
  ];

  const defaultFormValues = {
    description: "",
    department: "unknown",
    location: "",
    contactNumber: "",
    preferredDate: "",
    preferredTimeStart: "",
    preferredTimeEnd: "",
    officeHoursStart: "09:00",
    officeHoursEnd: "17:00",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("autocomp-user-id");
      if (!userId) {
        toast({
          title: "Error",
          description: "User is not logged in. Please login again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      // Append all the fields
      formData.append("Description", values.description);
      formData.append("Department", values.department || "");
      formData.append("Location", values.location);
      formData.append("ContactNumber", values.contactNumber);
      formData.append(
        "PreferredDate",
        new Date(values.preferredDate).toISOString()
      );
      formData.append("AvailableFrom", values.preferredTimeStart);
      formData.append("AvailableUntil", values.preferredTimeEnd);
      formData.append("OfficeHoursStart", values.officeHoursStart);
      formData.append("OfficeHoursEnd", values.officeHoursEnd);
      formData.append("UserId", userId);

      // Append uploaded files
      for (let i = 0; i < files.length; i++) {
        formData.append("Attachments", files[i]);
      }

      const response = await fetch("https://localhost:7181/api/ticket/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Request failed.");
      }

      toast({
        title: "Request Submitted Successfully",
        description: "Your maintenance request has been created.",
      });

      resetForm();
      navigate("/tickets");
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset(defaultFormValues);
    setFiles([]);
    setFileErrors([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: File[] = [];
    const newErrors: string[] = [];

    // Check each file and collect errors
    Array.from(selectedFiles).forEach((file) => {
      // Check file size (10 MB limit)
      if (file.size > 10 * 1024 * 1024) {
        newErrors.push(`File ${file.name} exceeds the 10MB size limit.`);
        return;
      }

      // Check file type
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        newErrors.push(`File ${file.name} has an unsupported file format.`);
        return;
      }

      newFiles.push(file);
    });

    // Update state
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setFileErrors(newErrors);

    // Show toast for errors
    if (newErrors.length > 0) {
      toast({
        title: "File Upload Error",
        description: (
          <ul className="list-disc pl-4 space-y-1">
            {newErrors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
    }

    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <FileImage className="h-5 w-5" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Submit Request</h1>
        <p className="text-muted-foreground">
          Fill out the form below to submit a new maintenance request.
        </p>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Maintenance Request Form</CardTitle>
          <CardDescription>
            Provide detailed information about your issue to help us assist you
            better.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Issue Details</h3>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the issue..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Please provide as much detail as possible about the
                        issue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select which department should handle your issue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Attachments</FormLabel>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex items-center rounded-md bg-autocomp-100 dark:bg-autocomp-900 px-3 py-2 text-sm font-medium text-autocomp-700 dark:text-autocomp-300 hover:bg-autocomp-200 dark:hover:bg-autocomp-800 transition-colors"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Files
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      />
                    </label>
                    <FormDescription>
                      Upload screenshots or relevant documents
                    </FormDescription>
                  </div>
                  {files.length > 0 && (
                    <ul className="space-y-2 mb-3">
                      {files.map((file, index) => (
                        <li
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-900"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {getFileIcon(file)}
                            <span className="text-sm truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove file</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Contact Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Building, Floor, Room Number"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Where the issue is located
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your phone number"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onKeyPress={(e) => {
                              const isNumber = /^[0-9]$/.test(e.key);
                              if (!isNumber) {
                                e.preventDefault();
                              }
                            }}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>How we can reach you</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="officeHoursStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Hours - Start</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          When your work day begins
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="officeHoursEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Hours - End</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          When your work day ends
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Technician Visit</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={
                              new Date(Date.now() + 86400000)
                                .toISOString()
                                .split("T")[0]
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          When would you like the technician to visit
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredTimeStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available From</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          Start of your available time window
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredTimeEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Until</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          End of your available time window
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <div className="text-sm">
                    <p className="font-medium">Important Notice</p>
                    <p className="text-muted-foreground">
                      A technician will visit during your specified availability
                      window. Please ensure you or someone is available at the
                      location during this entire time period.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t p-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center space-x-2"></div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  type="button"
                  onClick={resetForm}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-autocomp-500 hover:bg-autocomp-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};
export default SubmitRequest;
