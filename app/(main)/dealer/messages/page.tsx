import type { Metadata } from "next";
import DealerMessagesClient from "./messages-client";

const TITLE = "Zprávy | NNAuto Dealer";
const DESCRIPTION =
  "Sjednocená schránka pro komunikaci s kupujícími – chat, e-mail, WhatsApp, Telegram.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function DealerMessagesRoute() {
  return <DealerMessagesClient />;
}
