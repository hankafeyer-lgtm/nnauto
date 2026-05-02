import type { Metadata } from "next";
import ForgotPasswordClient from "./forgot-password-client";

const TITLE = "Zapomenuté heslo | NNAuto";
const DESCRIPTION =
  "Obnovte si heslo k účtu na NNAuto. Zadejte svůj e-mail a pošleme vám nové heslo.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function ForgotPassword() {
  return <ForgotPasswordClient />;
}
