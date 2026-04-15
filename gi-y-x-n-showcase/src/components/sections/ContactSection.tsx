import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", address: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "SENT SUCCESSFULLY", description: "WE WILL CONTACT YOU SHORTLY." });
    setForm({ name: "", phone: "", address: "", message: "" });
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
           <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">STAY CONNECTED</h2>
           <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">JOIN THE INNER CIRCLE FOR EXCLUSIVE DROPS</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              placeholder="FULL NAME" 
              className="bg-background border-primary/20 focus:border-primary transition-colors text-xs font-bold"
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
            <Input 
              placeholder="PHONE NUMBER" 
              className="bg-background border-primary/20 focus:border-primary transition-colors text-xs font-bold"
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              required 
            />
          </div>
          <Input 
            placeholder="SHIPPING ADDRESS (OPTIONAL)" 
            className="bg-background border-primary/20 focus:border-primary transition-colors text-xs font-bold"
            value={form.address} 
            onChange={(e) => setForm({ ...form, address: e.target.value })} 
          />
          <Textarea 
            placeholder="YOUR MESSAGE TO THE STUDIO" 
            className="bg-background border-primary/20 focus:border-primary transition-colors text-xs font-bold min-h-[120px]"
            value={form.message} 
            onChange={(e) => setForm({ ...form, message: e.target.value })} 
            rows={4} 
          />
          <div className="text-center pt-8">
            <Button type="submit" size="lg" className="bg-primary text-black font-black px-16 tracking-[0.2em] hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
              SUBMIT ENQUIRY
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactSection;

