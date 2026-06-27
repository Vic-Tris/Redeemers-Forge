import { useListPlans, useCreateCheckout } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FEATURES = {
  free: [
    "Access to free stories & devotionals",
    "Watch public videos",
    "Browse the book library",
    "Basic community access",
  ],
  premium: [
    "Everything in Free",
    "Unlimited premium stories & devotionals",
    "Full video sermon library",
    "Exclusive book downloads",
    "Full community & prayer wall access",
    "Ad-free experience",
    "Early access to new content",
    "Monthly live Q&A with authors",
  ],
};

export default function Premium() {
  const { data: plans, isLoading } = useListPlans();
  const checkoutMutation = useCreateCheckout();
  const { toast } = useToast();

  const handleSubscribe = (planId: string) => {
    checkoutMutation.mutate(
      { data: { planId } },
      {
        onSuccess: (data) => {
          if (data.url) {
            window.open(data.url, "_blank");
          } else {
            toast({ title: "Subscription coming soon!", description: "Payment processing will be available shortly." });
          }
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to start checkout. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
          <Crown className="w-4 h-4" /> Premium Membership
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
          Invest in Your Faith
        </h1>
        <p className="text-lg text-muted-foreground font-serif italic max-w-2xl mx-auto">
          Unlock the full Redeemer's Forge experience — unlimited content, community, and spiritual growth resources.
        </p>
      </div>

      {/* Plans */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[500px] rounded-xl" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Free Plan */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Star className="w-5 h-5" />
                <span className="font-semibold text-sm uppercase tracking-wider">Free</span>
              </div>
              <CardTitle className="text-4xl font-serif font-bold">$0</CardTitle>
              <p className="text-muted-foreground text-sm">Forever free — always</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {FEATURES.free.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-border" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plans */}
          <div className="space-y-4">
            {plans?.map(plan => (
              <Card key={plan.id} className="border-secondary/40 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-secondary mb-2">
                      <Flame className="w-5 h-5" />
                      <span className="font-semibold text-sm uppercase tracking-wider">Premium</span>
                    </div>
                    {plan.name.toLowerCase().includes("year") && (
                      <span className="rounded-full bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1">
                        Best Value
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-4xl font-serif font-bold">
                    ${plan.price}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      / {plan.interval}
                    </span>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.name}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {FEATURES.premium.map(f => (
                      <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                        <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? "Loading..." : `Subscribe — $${plan.price}/${plan.interval}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      <section className="grid sm:grid-cols-3 gap-6">
        {[
          { quote: "The Redeemer's Forge has transformed my morning devotional time.", name: "Sarah M.", location: "Texas" },
          { quote: "The video sermons are profound. Worth every penny of the subscription.", name: "James R.", location: "Ohio" },
          { quote: "I love the community. Real believers sharpeningone another daily.", name: "Grace T.", location: "Georgia" },
        ].map(t => (
          <Card key={t.name} className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <p className="font-serif italic text-foreground text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
