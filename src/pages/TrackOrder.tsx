import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import PageBreadcrumbs from "@/components/ui/PageBreadcrumbs";
import { siteConfig } from "@/config/site.config";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TrackingResult {
  order_number: string;
  ncm_order_id: number | null;
  ncm_status: string | null;
  ncm_tracking_id: string | null;
  status: string;
  created_at: string;
  shipping_address: {
    city?: string;
    district?: string;
  };
}

const NCM_STATUS_STEPS = [
  { status: "Pickup Order Created", label: "Order Created", icon: Package },
  { status: "Sent for Pickup", label: "Pickup Scheduled", icon: Clock },
  { status: "Pickup Complete", label: "Picked Up", icon: Package },
  { status: "Sent for Delivery", label: "In Transit", icon: Truck },
  { status: "Out for Delivery", label: "Out for Delivery", icon: MapPin },
  { status: "Delivered", label: "Delivered", icon: CheckCircle },
];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);

  // Auto-fill order number from URL param
  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) {
      setOrderNumber(orderParam);
    }
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast({
        title: "Order number required",
        description: "Please enter your order number",
        variant: "destructive",
      });
      return;
    }

    if (!phone.trim() || phone.trim().length < 4) {
      toast({
        title: "Phone verification required",
        description: "Please enter the last 4 digits of your phone number",
        variant: "destructive",
      });
      return;
    }

    const phoneLast4 = phone.trim().replace(/\D/g, "").slice(-4);

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("track-guest-order", {
        body: { orderNumber: orderNumber.trim(), phoneLast4 },
      });

      if (error) {
        toast({
          title: "Tracking failed",
          description: "Could not find your order. Please check your details.",
          variant: "destructive",
        });
        setTrackingResult(null);
        return;
      }

      if (data?.error) {
        toast({
          title: data.error === "Phone verification failed" ? "Verification failed" : "Order not found",
          description: data.error === "Phone verification failed"
            ? "Phone number doesn't match our records"
            : "Please check your order number and try again",
          variant: "destructive",
        });
        setTrackingResult(null);
        return;
      }

      setTrackingResult({
        order_number: data.order_number,
        ncm_order_id: data.ncm_order_id,
        ncm_status: data.ncm_status,
        ncm_tracking_id: data.ncm_tracking_id,
        status: data.status || "pending",
        created_at: data.created_at || "",
        shipping_address: data.shipping_address || {},
      });
    } catch (error) {
      console.error("Track order error:", error);
      toast({
        title: "Error",
        description: "Failed to track order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!trackingResult?.ncm_status) return -1;
    return NCM_STATUS_STEPS.findIndex(step => step.status === trackingResult.ncm_status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "processing":
      case "confirmed":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Track Your Order"
        description={`Track your ${siteConfig.name} order status and delivery updates`}
        url="/track-order"
      />
      <Header />
      
      <main className="flex-1 bg-muted/30 py-6 sm:py-12">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <PageBreadcrumbs 
              items={[{ label: 'Track Order' }]} 
              className="mb-4"
            />
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl uppercase tracking-wider mb-2">
                Track Your Order
              </h1>
              <p className="text-muted-foreground">
                Enter your order number and phone to check delivery status
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleTrack} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Order Number *
                    </label>
                    <Input
                      placeholder="e.g., RKN-20260111-1234"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Last 4 Digits of Phone *
                    </label>
                    <Input
                      placeholder="e.g., 5154"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={4}
                      inputMode="numeric"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the last 4 digits of the phone number used during checkout
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    {isLoading ? "Tracking..." : "Track Order"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {trackingResult && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-mono text-lg">
                        {trackingResult.order_number}
                      </CardTitle>
                      <CardDescription>
                        Ordered on {new Date(trackingResult.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(trackingResult.status)}>
                      {trackingResult.status.charAt(0).toUpperCase() + trackingResult.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {trackingResult.ncm_order_id ? (
                    <>
                      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">NCM Tracking ID:</span>
                          <span className="font-mono font-medium">{trackingResult.ncm_tracking_id || trackingResult.ncm_order_id}</span>
                        </div>
                        {trackingResult.ncm_status && (
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Current Status:</span>
                            <Badge variant="outline">{trackingResult.ncm_status}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Tracking Timeline */}
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                        <div className="space-y-6">
                          {NCM_STATUS_STEPS.map((step, index) => {
                            const currentStep = getCurrentStep();
                            const isCompleted = index <= currentStep;
                            const isCurrent = index === currentStep;
                            const StepIcon = step.icon;
                            
                            return (
                              <div key={step.status} className="relative flex items-center gap-4">
                                <div className={`
                                  relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2
                                  ${isCompleted 
                                    ? "bg-primary border-primary text-primary-foreground" 
                                    : "bg-background border-border text-muted-foreground"}
                                  ${isCurrent ? "ring-4 ring-primary/20" : ""}
                                `}>
                                  <StepIcon className="h-4 w-4" />
                                </div>
                                <div className={`flex-1 ${isCompleted ? "" : "opacity-50"}`}>
                                  <p className={`font-medium ${isCurrent ? "text-primary" : ""}`}>
                                    {step.label}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {step.status}
                                  </p>
                                </div>
                                {isCurrent && (
                                  <Badge variant="secondary" className="text-xs">Current</Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Shipment not yet created</p>
                      <p className="text-sm mt-1">
                        Your order is being processed. Tracking will be available once shipped.
                      </p>
                    </div>
                  )}

                  {/* Delivery Address */}
                  {(trackingResult.shipping_address?.city || trackingResult.shipping_address?.district) && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Location
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {trackingResult.shipping_address.city && trackingResult.shipping_address.district && (
                          <span>{trackingResult.shipping_address.city}, {trackingResult.shipping_address.district}</span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Contact Support */}
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      Need help with your order?{" "}
                      <a 
                        href={siteConfig.social.whatsapp} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        Contact us on WhatsApp
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrackOrder;
