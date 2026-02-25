import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, XCircle, Sparkles } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = variant === "destructive" ? XCircle : variant === "success" ? CheckCircle2 : Sparkles;
        const iconColor = variant === "destructive" ? "text-red-500" : variant === "success" ? "text-green-500" : "text-[#B8860B]";
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
