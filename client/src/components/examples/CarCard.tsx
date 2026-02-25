import CarCard from "../CarCard";
import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";

export default function CarCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <CarCard
        id="1"
        image={sedanImage}
        title="Toyota Camry 2.5 Hybrid"
        price={25500}
        year={2021}
        mileage={45000}
        fuel="Hybrid"
        transmission="Automatická"
        location="Praha"
        datePosted="před 2 dny"
        condition="Ojeté"
      />
    </div>
  );
}
