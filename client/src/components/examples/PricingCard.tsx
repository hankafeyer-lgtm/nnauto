import PricingCard from "../PricingCard";

export default function PricingCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <PricingCard
        title="Premium"
        description="Pro aktivní prodejce"
        price="€29"
        period="/měsíc"
        badge="Nejoblíbenější"
        highlighted={true}
        features={[
          "Až 20 aktivních inzerátů",
          "Zvýrazněné inzeráty",
          "Prioritní podpora",
          "Detailní statistiky",
          "Automatické obnovení",
        ]}
        buttonText="Vybrat plán"
      />
    </div>
  );
}
