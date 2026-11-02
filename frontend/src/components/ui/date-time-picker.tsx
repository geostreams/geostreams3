import { useEffect, useState, type KeyboardEvent } from "react";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const FORMAT = "YYYY-MM-DD HH:mm";

/** Parses typed text as a UTC date and time; null when it is not a valid one. */
const parseTyped = (text: string): Dayjs | null => {
    const parsed = dayjs.utc(text.trim(), FORMAT, true);
    return parsed.isValid() ? parsed : null;
};

interface DateTimePickerProps {
    /** Id for the typed field, so a Label can point at it. */
    id?: string;
    /** The selected moment; shown and edited in UTC. */
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
    className?: string;
    disabled?: boolean;
}

/**
 * Date and time in UTC: type it as `YYYY-MM-DD HH:mm` (Enter or leaving the
 * field applies it), or open the calendar and pick a day and a time. The
 * value is a UTC dayjs, so `toISOString()` gives the timestamp to send.
 */
const DateTimePicker = ({
    id,
    value,
    onChange,
    className,
    disabled,
}: DateTimePickerProps) => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(value ? value.utc().format(FORMAT) : "");
    const [invalid, setInvalid] = useState(false);
    const valueKey = value?.valueOf() ?? null;

    // Follow outside changes (calendar picks, form resets).
    useEffect(() => {
        setText(value ? value.utc().format(FORMAT) : "");
        setInvalid(false);
    }, [valueKey]);

    const commit = () => {
        if (text.trim() === "") {
            setInvalid(false);
            onChange(null);
            return;
        }
        const parsed = parseTyped(text);
        setInvalid(parsed === null);
        if (parsed) onChange(parsed);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            // Apply the text without submitting the surrounding form.
            event.preventDefault();
            commit();
        }
    };

    const base = value ? value.utc() : dayjs.utc();
    // The calendar works in local dates; carry the UTC day over as a local one.
    const selectedDay = value
        ? new Date(base.year(), base.month(), base.date())
        : undefined;

    const pickDay = (day: Date | undefined) => {
        if (!day) return;
        onChange(
            dayjs
                .utc()
                .year(day.getFullYear())
                .month(day.getMonth())
                .date(day.getDate())
                .hour(value ? base.hour() : 0)
                .minute(value ? base.minute() : 0)
                .second(0)
                .millisecond(0),
        );
    };

    const pickTime = (time: string) => {
        const [hour, minute] = time.split(":").map(Number);
        if (Number.isNaN(hour) || Number.isNaN(minute)) return;
        onChange(base.hour(hour).minute(minute).second(0).millisecond(0));
    };

    return (
        <div className={cn("flex gap-2", className)}>
            <Input
                id={id}
                value={text}
                disabled={disabled}
                placeholder="YYYY-MM-DD HH:mm"
                autoComplete="off"
                aria-invalid={invalid}
                aria-describedby={id ? `${id}-hint` : undefined}
                onChange={(e) => setText(e.target.value)}
                onBlur={commit}
                onKeyDown={onKeyDown}
            />
            {id && (
                <span id={`${id}-hint`} className="sr-only">
                    Date and time in UTC, as year-month-day hour:minute
                </span>
            )}
            <Popover open={open} onOpenChange={setOpen} modal>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={disabled}
                        aria-label="Open calendar"
                    >
                        <CalendarIcon aria-hidden />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDay}
                        defaultMonth={selectedDay}
                        onSelect={pickDay}
                    />
                    <div className="flex items-center gap-2 border-t p-3">
                        <label
                            htmlFor={id ? `${id}-time` : undefined}
                            className="text-sm"
                        >
                            Time (UTC)
                        </label>
                        <Input
                            id={id ? `${id}-time` : undefined}
                            type="time"
                            className="w-auto"
                            value={value ? base.format("HH:mm") : ""}
                            onChange={(e) => pickTime(e.target.value)}
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="ml-auto"
                            onClick={() => setOpen(false)}
                        >
                            Done
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default DateTimePicker;
