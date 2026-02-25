import { ComponentType } from "react";
import { SiAcura, SiAlfaromeo, SiAstonmartin, SiAudi, SiBentley, SiBmw, SiBugatti, SiCadillac, SiChevrolet, SiChrysler, SiCitroen, SiDacia, SiFerrari, SiFiat, SiFord, SiHonda, SiHyundai, SiInfiniti, SiJaguar, SiJeep, SiKia, SiLamborghini, SiLandrover, SiMaserati, SiMazda, SiMclaren, SiMercedes, SiMini, SiMitsubishi, SiNissan, SiOpel, SiPeugeot, SiPorsche, SiRam, SiRenault, SiRollsroyce, SiSeat, SiSkoda, SiSubaru, SiSuzuki, SiTesla, SiToyota, SiVolkswagen, SiVolvo } from "react-icons/si";

import acuraLogoColor from "@assets/generated_images/Acura_brand_logo_original_6c3bebd7.png";
import alfaRomeoLogoColor from "@assets/generated_images/Alfa_Romeo_logo_original_086a45c9.png";
import astonMartinLogoColor from "@assets/generated_images/Aston_Martin_logo_b013e7bd.png";
import audiLogoColor from "@assets/generated_images/Audi_logo_original_147691ca.png";
import bentleyLogoColor from "@assets/generated_images/Bentley_logo_original_d9a96e45.png";
import bmwLogoColor from "@assets/generated_images/BMW_logo_original_da68f302.png";
import bugattiLogoColor from "@assets/generated_images/Bugatti_logo_original_6db30359.png";
import cadillacLogoColor from "@assets/generated_images/Cadillac_logo_original_fed89930.png";
import chevroletLogoColor from "@assets/generated_images/Chevrolet_logo_original_57f93929.png";
import chryslerLogoColor from "@assets/generated_images/Chrysler_logo_original_ade81f2e.png";
import citroenLogoColor from "@assets/generated_images/Citroen_logo_original_355ef247.png";
import daciaLogoColor from "@assets/generated_images/Dacia_logo_original_b8df5efa.png";
import ferrariLogoColor from "@assets/generated_images/Ferrari_logo_original_ece7e384.png";
import fiatLogoColor from "@assets/generated_images/Fiat_logo_original_3bbafc73.png";
import fordLogoColor from "@assets/generated_images/Ford_logo_original_6f5cf8f4.png";
import hondaLogoColor from "@assets/generated_images/Honda_logo_original_e8c5ec3b.png";
import hyundaiLogoColor from "@assets/generated_images/Hyundai_logo_original_c07927e9.png";
import infinitiLogoColor from "@assets/generated_images/Infiniti_logo_original_f75d7e81.png";
import jaguarLogoColor from "@assets/generated_images/Jaguar_logo_original_9a59d0b8.png";
import jeepLogoColor from "@assets/generated_images/Jeep_logo_original_e52b641b.png";
import kiaLogoColor from "@assets/generated_images/Kia_logo_original_9e22ddfb.png";
import lamborghiniLogoColor from "@assets/generated_images/Lamborghini_logo_original_b578d0d2.png";
import landRoverLogoColor from "@assets/generated_images/Land_Rover_logo_61fcb4ec.png";
import maseratiLogoColor from "@assets/generated_images/Maserati_logo_original_fdd12123.png";
import mazdaLogoColor from "@assets/generated_images/Mazda_logo_original_eec10ee3.png";
import mclarenLogoColor from "@assets/generated_images/McLaren_logo_original_e939cb1a.png";
import mercedesLogoColor from "@assets/generated_images/Mercedes_logo_original_6c294c84.png";
import miniLogoColor from "@assets/generated_images/MINI_logo_original_f0f8fbf8.png";
import mitsubishiLogoColor from "@assets/generated_images/Mitsubishi_logo_original_ecfcc00d.png";
import nissanLogoColor from "@assets/generated_images/Nissan_logo_original_ca5b3ec4.png";
import opelLogoColor from "@assets/generated_images/Opel_logo_original_55520476.png";
import peugeotLogoColor from "@assets/generated_images/Peugeot_logo_original_49276848.png";
import porscheLogoColor from "@assets/generated_images/Porsche_logo_original_20663cc0.png";
import ramLogoColor from "@assets/generated_images/RAM_logo_original_01d5325e.png";
import renaultLogoColor from "@assets/generated_images/Renault_logo_original_5f790e40.png";
import rollsRoyceLogoColor from "@assets/generated_images/Rolls-Royce_logo_b3b6a8b1.png";
import seatLogoColor from "@assets/generated_images/Seat_logo_original_187ae0be.png";
import skodaLogoColor from "@assets/generated_images/Skoda_logo_original_1371d0f2.png";
import subaruLogoColor from "@assets/generated_images/Subaru_logo_original_cb416dff.png";
import suzukiLogoColor from "@assets/generated_images/Suzuki_logo_original_a2a3d37d.png";
import teslaLogoColor from "@assets/generated_images/Tesla_logo_original_1206b5d7.png";
import toyotaLogoColor from "@assets/generated_images/Toyota_logo_original_3d98b809.png";
import volkswagenLogoColor from "@assets/generated_images/Volkswagen_logo_original_3c9ab739.png";
import volvoLogoColor from "@assets/generated_images/Volvo_logo_original_8e608d2c.png";
import buickLogoColor from "@assets/generated_images/Buick_logo_color_feadaa67.png";
import daewooLogoColor from "@assets/generated_images/Daewoo_logo_color_54f95085.png";
import daihatsuLogoColor from "@assets/generated_images/Daihatsu_logo_color_a902adb5.png";
import dodgeLogoColor from "@assets/generated_images/Dodge_logo_color_ef37c49c.png";
import genesisLogoColor from "@assets/generated_images/Genesis_logo_color_faa280dc.png";
import gmcLogoColor from "@assets/generated_images/GMC_logo_color_17710e6b.png";
import hummerLogoColor from "@assets/generated_images/Hummer_logo_color_f0752a0e.png";
import isuzuLogoColor from "@assets/generated_images/Isuzu_logo_color_3cdb4047.png";
import ladaLogoColor from "@assets/generated_images/Lada_logo_color_b35bd85b.png";
import lanciaLogoColor from "@assets/generated_images/Lancia_logo_color_f4fec5bd.png";
import lexusLogoColor from "@assets/generated_images/Lexus_logo_color_5fea4016.png";
import lincolnLogoColor from "@assets/generated_images/Lincoln_logo_color_f90256c5.png";
import lotusLogoColor from "@assets/generated_images/Lotus_logo_color_11110c83.png";
import maybachLogoColor from "@assets/generated_images/Maybach_logo_color_0f4f6bf6.png";
import mgLogoColor from "@assets/generated_images/MG_logo_color_cd9c2803.png";
import roverLogoColor from "@assets/generated_images/Rover_logo_color_0c669a58.png";
import saabLogoColor from "@assets/generated_images/Saab_logo_color_c663d669.png";
import smartLogoColor from "@assets/generated_images/Smart_logo_color_ea825808.png";
import ssangyongLogoColor from "@assets/generated_images/SsangYong_logo_color_691effcf.png";
import uazLogoColor from "@assets/generated_images/UAZ_logo_color_444aca90.png";
import tatraLogoColor from "@assets/generated_images/tatra_truck_company_logo.png";
import manLogoColor from "@assets/generated_images/man_truck_company_logo.png";
import ivecoLogoColor from "@assets/generated_images/iveco_truck_company_logo.png";
import aviaLogoColor from "@assets/generated_images/avia_truck_company_logo.png";
import dafLogoColor from "@assets/generated_images/daf_truck_company_logo.png";
import scaniaLogoColor from "@assets/generated_images/scania_truck_company_logo.png";
import liazLogoColor from "@assets/generated_images/liaz_truck_company_logo.png";
import pragaLogoColor from "@assets/generated_images/praga_truck_company_logo.png";
import ifaLogoColor from "@assets/generated_images/ifa_truck_company_logo.png";
import agmLogoColor from "@assets/generated_images/agm_truck_company_logo.png";
import aroLogoColor from "@assets/generated_images/aro_vehicle_company_logo.png";
import fusoLogoColor from "@assets/generated_images/fuso_truck_company_logo.png";
import jawaLogoColor from "@assets/generated_images/jawa_motorcycle_company_logo.png";
import yamahaLogoColor from "@assets/generated_images/yamaha_motorcycle_company_logo.png";
import harleyDavidsonLogoColor from "@assets/generated_images/harley-davidson_motorcycle_logo.png";
import kawasakiLogoColor from "@assets/generated_images/kawasaki_motorcycle_company_logo.png";
import ktmLogoColor from "@assets/generated_images/ktm_motorcycle_company_logo.png";
import triumphLogoColor from "@assets/generated_images/triumph_motorcycle_company_logo.png";
import ducatiLogoColor from "@assets/generated_images/ducati_motorcycle_company_logo.png";
import apriliaLogoColor from "@assets/generated_images/aprilia_motorcycle_company_logo.png";
import piaggioLogoColor from "@assets/generated_images/piaggio_scooter_company_logo.png";
import kymcoLogoColor from "@assets/generated_images/kymco_scooter_company_logo.png";
import accessLogoColor from "@assets/generated_images/access_motor_company_logo.png";
import adamsLogoColor from "@assets/generated_images/adams_motorcycle_company_logo.png";
import aeonLogoColor from "@assets/generated_images/aeon_motor_company_logo.png";
import bednaLogoColor from "@assets/generated_images/bedna_motorcycle_company_logo.png";
import mbpLogoColor from "@assets/generated_images/mbp_motorcycle_brand_logo.png";
import brixtonLogoColor from "@assets/generated_images/brixton_motorcycle_company_logo.png";
import yukiLogoColor from "@assets/generated_images/yuki_motorcycle_company_logo.png";
import maxusLogoColor from "@assets/generated_images/maxus_commercial_vehicle_logo.png";
import gazLogoColor from "@assets/generated_images/gaz_russian_auto_brand_logo.png";
import ldvLogoColor from "@assets/generated_images/ldv_commercial_vehicle_logo.png";
import kamazLogoColor from "@assets/generated_images/kamaz_truck_manufacturer_logo.png";

export type BrandIconEntry = 
  | { type: "component"; component: ComponentType<{ className?: string }> }
  | { type: "image"; src: string; alt: string };

export const BrandIconRenderer = ({ icon, className = "w-4 h-4" }: { icon?: BrandIconEntry; className?: string }) => {
  if (!icon) return null;
  
  if (icon.type === "component") {
    const Icon = icon.component;
    return <Icon className={className} />;
  }
  
  return (
    <img 
      src={icon.src} 
      alt={icon.alt} 
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
};

export const brandIcons: Record<string, BrandIconEntry> = {
  acura: { type: "image", src: acuraLogoColor, alt: "Acura" },
  "alfa-romeo": { type: "image", src: alfaRomeoLogoColor, alt: "Alfa Romeo" },
  "aston-martin": { type: "image", src: astonMartinLogoColor, alt: "Aston Martin" },
  audi: { type: "image", src: audiLogoColor, alt: "Audi" },
  bentley: { type: "image", src: bentleyLogoColor, alt: "Bentley" },
  bmw: { type: "image", src: bmwLogoColor, alt: "BMW" },
  bugatti: { type: "image", src: bugattiLogoColor, alt: "Bugatti" },
  buick: { type: "image", src: buickLogoColor, alt: "Buick" },
  cadillac: { type: "image", src: cadillacLogoColor, alt: "Cadillac" },
  chevrolet: { type: "image", src: chevroletLogoColor, alt: "Chevrolet" },
  chrysler: { type: "image", src: chryslerLogoColor, alt: "Chrysler" },
  citroen: { type: "image", src: citroenLogoColor, alt: "Citroen" },
  dacia: { type: "image", src: daciaLogoColor, alt: "Dacia" },
  daewoo: { type: "image", src: daewooLogoColor, alt: "Daewoo" },
  daihatsu: { type: "image", src: daihatsuLogoColor, alt: "Daihatsu" },
  dodge: { type: "image", src: dodgeLogoColor, alt: "Dodge" },
  ferrari: { type: "image", src: ferrariLogoColor, alt: "Ferrari" },
  fiat: { type: "image", src: fiatLogoColor, alt: "Fiat" },
  ford: { type: "image", src: fordLogoColor, alt: "Ford" },
  genesis: { type: "image", src: genesisLogoColor, alt: "Genesis" },
  gmc: { type: "image", src: gmcLogoColor, alt: "GMC" },
  honda: { type: "image", src: hondaLogoColor, alt: "Honda" },
  hummer: { type: "image", src: hummerLogoColor, alt: "Hummer" },
  hyundai: { type: "image", src: hyundaiLogoColor, alt: "Hyundai" },
  infiniti: { type: "image", src: infinitiLogoColor, alt: "Infiniti" },
  isuzu: { type: "image", src: isuzuLogoColor, alt: "Isuzu" },
  jaguar: { type: "image", src: jaguarLogoColor, alt: "Jaguar" },
  jeep: { type: "image", src: jeepLogoColor, alt: "Jeep" },
  kia: { type: "image", src: kiaLogoColor, alt: "Kia" },
  lada: { type: "image", src: ladaLogoColor, alt: "Lada" },
  lamborghini: { type: "image", src: lamborghiniLogoColor, alt: "Lamborghini" },
  lancia: { type: "image", src: lanciaLogoColor, alt: "Lancia" },
  "land-rover": { type: "image", src: landRoverLogoColor, alt: "Land Rover" },
  lexus: { type: "image", src: lexusLogoColor, alt: "Lexus" },
  lincoln: { type: "image", src: lincolnLogoColor, alt: "Lincoln" },
  lotus: { type: "image", src: lotusLogoColor, alt: "Lotus" },
  maserati: { type: "image", src: maseratiLogoColor, alt: "Maserati" },
  maybach: { type: "image", src: maybachLogoColor, alt: "Maybach" },
  mazda: { type: "image", src: mazdaLogoColor, alt: "Mazda" },
  mclaren: { type: "image", src: mclarenLogoColor, alt: "McLaren" },
  "mercedes-benz": { type: "image", src: mercedesLogoColor, alt: "Mercedes-Benz" },
  mg: { type: "image", src: mgLogoColor, alt: "MG" },
  mini: { type: "image", src: miniLogoColor, alt: "MINI" },
  mitsubishi: { type: "image", src: mitsubishiLogoColor, alt: "Mitsubishi" },
  nissan: { type: "image", src: nissanLogoColor, alt: "Nissan" },
  opel: { type: "image", src: opelLogoColor, alt: "Opel" },
  peugeot: { type: "image", src: peugeotLogoColor, alt: "Peugeot" },
  porsche: { type: "image", src: porscheLogoColor, alt: "Porsche" },
  ram: { type: "image", src: ramLogoColor, alt: "RAM" },
  renault: { type: "image", src: renaultLogoColor, alt: "Renault" },
  "rolls-royce": { type: "image", src: rollsRoyceLogoColor, alt: "Rolls-Royce" },
  rover: { type: "image", src: roverLogoColor, alt: "Rover" },
  saab: { type: "image", src: saabLogoColor, alt: "Saab" },
  seat: { type: "image", src: seatLogoColor, alt: "SEAT" },
  skoda: { type: "image", src: skodaLogoColor, alt: "Skoda" },
  smart: { type: "image", src: smartLogoColor, alt: "Smart" },
  ssangyong: { type: "image", src: ssangyongLogoColor, alt: "SsangYong" },
  subaru: { type: "image", src: subaruLogoColor, alt: "Subaru" },
  suzuki: { type: "image", src: suzukiLogoColor, alt: "Suzuki" },
  tesla: { type: "image", src: teslaLogoColor, alt: "Tesla" },
  toyota: { type: "image", src: toyotaLogoColor, alt: "Toyota" },
  uaz: { type: "image", src: uazLogoColor, alt: "UAZ" },
  volkswagen: { type: "image", src: volkswagenLogoColor, alt: "Volkswagen" },
  volvo: { type: "image", src: volvoLogoColor, alt: "Volvo" },
  tatra: { type: "image", src: tatraLogoColor, alt: "Tatra" },
  man: { type: "image", src: manLogoColor, alt: "MAN" },
  iveco: { type: "image", src: ivecoLogoColor, alt: "Iveco" },
  avia: { type: "image", src: aviaLogoColor, alt: "Avia" },
  daf: { type: "image", src: dafLogoColor, alt: "DAF" },
  scania: { type: "image", src: scaniaLogoColor, alt: "Scania" },
  liaz: { type: "image", src: liazLogoColor, alt: "Liaz" },
  praga: { type: "image", src: pragaLogoColor, alt: "Praga" },
  ifa: { type: "image", src: ifaLogoColor, alt: "IFA" },
  agm: { type: "image", src: agmLogoColor, alt: "AGM" },
  aro: { type: "image", src: aroLogoColor, alt: "ARO" },
  fuso: { type: "image", src: fusoLogoColor, alt: "Fuso" },
  jawa: { type: "image", src: jawaLogoColor, alt: "Jawa" },
  yamaha: { type: "image", src: yamahaLogoColor, alt: "Yamaha" },
  "harley-davidson": { type: "image", src: harleyDavidsonLogoColor, alt: "Harley-Davidson" },
  kawasaki: { type: "image", src: kawasakiLogoColor, alt: "Kawasaki" },
  ktm: { type: "image", src: ktmLogoColor, alt: "KTM" },
  triumph: { type: "image", src: triumphLogoColor, alt: "Triumph" },
  ducati: { type: "image", src: ducatiLogoColor, alt: "Ducati" },
  aprilia: { type: "image", src: apriliaLogoColor, alt: "Aprilia" },
  piaggio: { type: "image", src: piaggioLogoColor, alt: "Piaggio" },
  kymco: { type: "image", src: kymcoLogoColor, alt: "Kymco" },
  access: { type: "image", src: accessLogoColor, alt: "Access" },
  adams: { type: "image", src: adamsLogoColor, alt: "Adams" },
  aeon: { type: "image", src: aeonLogoColor, alt: "Aeon" },
  bedna: { type: "image", src: bednaLogoColor, alt: "Bedna" },
  mbp: { type: "image", src: mbpLogoColor, alt: "MBP" },
  brixton: { type: "image", src: brixtonLogoColor, alt: "Brixton" },
  yuki: { type: "image", src: yukiLogoColor, alt: "Yuki" },
  maxus: { type: "image", src: maxusLogoColor, alt: "Maxus" },
  gaz: { type: "image", src: gazLogoColor, alt: "GAZ" },
  ldv: { type: "image", src: ldvLogoColor, alt: "LDV" },
  kamaz: { type: "image", src: kamazLogoColor, alt: "Kamaz" },
};
