import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { cn } from "@/lib/utils";

export interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    /** Id for the trigger, so a Label can point at it. */
    id?: string;
    options: ComboboxOption[];
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    required?: boolean;
}

/**
 * Searchable single-select: a button that opens a filterable list. Arrow keys
 * move through the options, Enter picks one, Escape closes the list.
 */
const Combobox = ({
    id,
    options,
    value,
    onChange,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyMessage = "No matches.",
    required,
}: ComboboxProps) => {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-required={required}
                    className="w-full justify-between font-normal"
                >
                    <span
                        className={cn(
                            "truncate",
                            !selected && "text-muted-foreground",
                        )}
                    >
                        {selected?.label ?? placeholder}
                    </span>
                    <ChevronsUpDown aria-hidden className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-0"
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    keywords={[option.value]}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                    <Check
                                        aria-hidden
                                        className={cn(
                                            "ml-auto",
                                            option.value === value
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default Combobox;
