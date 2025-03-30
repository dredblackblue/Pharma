import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield, Mail, User, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().optional(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const emailMfaSchema = z.object({
  emailMfaEnabled: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;
type EmailMfaFormValues = z.infer<typeof emailMfaSchema>;

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      contactNumber: user?.contactNumber || "",
    },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailMfaForm = useForm<EmailMfaFormValues>({
    resolver: zodResolver(emailMfaSchema),
    defaultValues: {
      emailMfaEnabled: user?.emailMfaEnabled || false,
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
        contactNumber: user.contactNumber || "",
      });
      emailMfaForm.reset({
        emailMfaEnabled: user.emailMfaEnabled || false,
      });
    }
  }, [user, profileForm, emailMfaForm]);

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password
  const changePasswordMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle Email MFA
  const toggleEmailMfaMutation = useMutation({
    mutationFn: async (data: EmailMfaFormValues) => {
      const res = await apiRequest("POST", "/api/mfa/email/toggle", { 
        enable: data.emailMfaEnabled 
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.emailMfaEnabled ? "Email MFA Enabled" : "Email MFA Disabled",
        description: variables.emailMfaEnabled
          ? "Email verification will be required at login."
          : "Email verification has been disabled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Email MFA Toggle Failed",
        description: error.message,
        variant: "destructive",
      });
      // Reset the form to previous state since the change failed
      emailMfaForm.reset({
        emailMfaEnabled: user?.emailMfaEnabled || false,
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onSecuritySubmit = (data: SecurityFormValues) => {
    changePasswordMutation.mutate(data);
  };

  const onEmailMfaSubmit = (data: EmailMfaFormValues) => {
    toggleEmailMfaMutation.mutate(data);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="authentication" className="flex items-center">
                <Key className="mr-2 h-4 w-4" />
                <span>Authentication</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to maintain account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Authentication Tab */}
            <TabsContent value="authentication">
              <Card>
                <CardHeader>
                  <CardTitle>Email Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Enable email verification during login for added security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailMfaForm}>
                    <form onSubmit={emailMfaForm.handleSubmit(onEmailMfaSubmit)} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Verification</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive a verification code by email when logging in
                          </p>
                        </div>
                        <FormField
                          control={emailMfaForm.control}
                          name="emailMfaEnabled"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={toggleEmailMfaMutation.isPending}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={toggleEmailMfaMutation.isPending}
                      >
                        {toggleEmailMfaMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Save Authentication Settings"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;