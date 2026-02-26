// import { useState } from "react";
// import { Check, ChevronsUpDown } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// interface ModelComboboxProps {
//   models: string[];
//   value: string;
//   onValueChange: (value: string) => void;
//   disabled?: boolean;
//   placeholder: string;
//   emptyMessage: string;
//   className?: string;
//   testId?: string;
// }

// export function ModelCombobox({
//   models,
//   value,
//   onValueChange,
//   disabled = false,
//   placeholder,
//   emptyMessage,
//   className,
//   testId = "combobox-model",
// }: ModelComboboxProps) {
//   const [open, setOpen] = useState(false);
//   const [searchValue, setSearchValue] = useState("");

//   // Find the display label for the current value
//   const selectedModel = models.find(
//     (model) => model.toLowerCase().replace(/\s+/g, "-") === value
//   );

//   return (
//     <Popover open={open} onOpenChange={setOpen} modal={true}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className={cn(
//             "justify-between h-12 rounded-xl text-black dark:text-white",
//             className
//           )}
//           disabled={disabled}
//           data-testid={testId}
//         >
//           <span className={cn(!selectedModel && "text-muted-foreground")}>
//             {selectedModel || placeholder}
//           </span>
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[100]" align="start">
//         <Command>
//           <CommandInput
//             placeholder={placeholder}
//             value={searchValue}
//             onValueChange={setSearchValue}
//             data-testid={`${testId}-input`}
//           />
//           <CommandList>
//             <CommandEmpty>{emptyMessage}</CommandEmpty>
//             <CommandGroup>
//               <CommandItem
//                 value="all-models-clear"
//                 onSelect={() => {
//                   onValueChange("");
//                   setOpen(false);
//                   setSearchValue("");
//                 }}
//                 data-testid={`${testId}-option-all`}
//               >
//                 <Check
//                   className={cn(
//                     "mr-2 h-4 w-4",
//                     !value ? "opacity-100" : "opacity-0"
//                   )}
//                 />
//                 <span className="font-medium">{placeholder}</span>
//               </CommandItem>
//               {models.map((model) => {
//                 const modelValue = model.toLowerCase().replace(/\s+/g, "-");
//                 return (
//                   <CommandItem
//                     key={modelValue}
//                     value={model}
//                     onSelect={() => {
//                       onValueChange(modelValue);
//                       setOpen(false);
//                       setSearchValue("");
//                     }}
//                     data-testid={`${testId}-option-${modelValue}`}
//                   >
//                     <Check
//                       className={cn(
//                         "mr-2 h-4 w-4",
//                         value === modelValue ? "opacity-100" : "opacity-0"
//                       )}
//                     />
//                     {model}
//                   </CommandItem>
//                 );
//               })}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ModelComboboxProps {
  models: string[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  emptyMessage: string;
  className?: string;
  testId?: string;
}

export function ModelCombobox({
  models,
  value,
  onValueChange,
  disabled = false,
  placeholder,
  emptyMessage,
  className,
  testId = "combobox-model",
}: ModelComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [canType, setCanType] = useState(false);

  // Find the display label for the current value
  const selectedModel = models.find(
    (model) => model.toLowerCase().replace(/\s+/g, "-") === value,
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (next) {
          // ✅ відкрили: не даємо інпуту одразу фокуситись
          setCanType(false);
        } else {
          // ✅ закрили: прибираємо пошук і прапорець
          setSearchValue("");
          setCanType(false);
        }
      }}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button
          onPointerDown={(e) => e.preventDefault()}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-12 rounded-xl text-black dark:text-white",
            className,
          )}
          disabled={disabled}
          data-testid={testId}
        >
          <span className={cn(!selectedModel && "text-muted-foreground")}>
            {selectedModel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-[100]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()} // ✅ НЕ фокусимо інпут автоматично
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            readOnly={!canType} // ✅ до кліку не вводимо
            onPointerDown={() => setCanType(true)} // ✅ клікнув у поле — можна вводити
            onFocus={(e) => {
              // ✅ якщо якийсь браузер все одно сфокусив — прибираємо фокус
              if (!canType) (e.target as HTMLInputElement).blur();
            }}
            data-testid={`${testId}-input`}
          />

          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-models-clear"
                onSelect={() => {
                  onValueChange("");
                  setOpen(false);
                  setSearchValue("");
                  setCanType(false);
                }}
                data-testid={`${testId}-option-all`}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="font-medium">{placeholder}</span>
              </CommandItem>
              {models.map((model) => {
                const modelValue = model.toLowerCase().replace(/\s+/g, "-");
                return (
                  <CommandItem
                    key={modelValue}
                    value={model}
                    onSelect={() => {
                      onValueChange(modelValue);
                      setOpen(false);
                      setSearchValue("");
                      setCanType(false);
                    }}
                    data-testid={`${testId}-option-${modelValue}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === modelValue ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {model}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
