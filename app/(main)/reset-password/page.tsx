import type { Metadata } from "next";
import ResetPasswordClient from "./reset-password-client";

const TITLE = "Nastavení nového hesla | NNAuto";
const DESCRIPTION =
  "Nastavte si nové heslo k účtu na NNAuto pomocí odkazu z e-mailu pro obnovení hesla.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function ResetPassword() {
  return <ResetPasswordClient />;
}
