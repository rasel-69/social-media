"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Briefcase, MapPin, Edit2, UserCircle, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/user";
import { toast } from "sonner";

interface AboutTabProps {
  user: any;
  isOwnProfile: boolean;
}

export function AboutTab({ user, isOwnProfile }: AboutTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    study: user.study || "",
    work: user.work || "",
    address: user.address || "",
  });

  useEffect(() => {
    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      study: user.study || "",
      work: user.work || "",
      address: user.address || "",
    });
  }, [user]);


  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const infoItems = [
    { icon: GraduationCap, label: "Study", value: user.study, placeholder: "Where did you study?" },
    { icon: Briefcase, label: "Work", value: user.work, placeholder: "Where do you work?" },
    { icon: MapPin, label: "Address", value: user.address, placeholder: "Where do you live?" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-emerald-500" />
              About {user.name}
            </h3>
            <p className="text-zinc-400">
              {user.bio || (isOwnProfile ? "Add a bio to tell people more about yourself." : "No bio added yet.")}
            </p>
          </div>

          {isOwnProfile && (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-zinc-800 hover:bg-zinc-900 text-zinc-300">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Edit About Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Full Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Study</label>
                    <Input
                      value={formData.study}
                      onChange={(e) => setFormData({ ...formData, study: e.target.value })}
                      placeholder="University or School"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Work</label>
                    <Input
                      value={formData.work}
                      onChange={(e) => setFormData({ ...formData, work: e.target.value })}
                      placeholder="Company or Position"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Address</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="hover:bg-zinc-900">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Icon className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-lg text-white font-medium">
                    {item.value || <span className="text-zinc-600 italic">Not specified</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
