import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  buttonText: string;
  onSelect: (planTitle: string) => void;
  featureTextColor?: string;
}

export default function PricingCard({
  title,
  description,
  price,
  period,
  features,
  highlighted = false,
  badge,
  buttonText,
  onSelect,
  featureTextColor = "text-sm",
}: PricingCardProps) {
  const handleClick = () => {
    onSelect(title);
  };

  return (
    <Card className={`rounded-xl sm:rounded-2xl shadow-xl transition-all hover:shadow-2xl sm:hover:scale-105 duration-300 ${highlighted ? "border-primary border-2 ring-2 ring-primary/20" : ""}`}>
      <CardHeader className="pb-6 sm:pb-8">
        <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
          <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</CardTitle>
          {badge && (
            <Badge variant="default" className="rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm" data-testid="badge-plan">
              {badge}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm sm:text-base leading-relaxed">{description}</CardDescription>
        <div className="mt-4 sm:mt-6">
          <span className="text-4xl sm:text-5xl font-semibold tracking-tight">{price}</span>
          {period && <span className="text-muted-foreground text-base sm:text-lg ml-2">{period}</span>}
        </div>
      </CardHeader>
      <CardContent className="pb-6 sm:pb-8">
        <ul className="space-y-3 sm:space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 sm:gap-3">
              <Check className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0 mt-0.5" />
              <span className={`${featureTextColor} leading-relaxed`}>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          className="w-full h-12 rounded-lg sm:rounded-xl"
          variant="outline"
          onClick={handleClick}
          data-testid={`button-plan-${title.toLowerCase()}`}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
