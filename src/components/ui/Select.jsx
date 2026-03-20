// components/ui/Select.jsx - Shadcn style Select
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "./Button";
import Input from "./Input";

const Select = React.forwardRef(({
    className,
    options = [],
    value,
    defaultValue,
    placeholder = "Select an option",
    multiple = false,
    disabled = false,
    required = false,
    label,
    description,
    error,
    searchable = false,
    clearable = false,
    loading = false,
    id,
    name,
    onChange,
    onOpenChange,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);

    const generatedId = React.useId();
    const selectId = id || `select-${generatedId}`;
    const listboxId = `${selectId}-listbox`;
    const descriptionId = `${selectId}-description`;
    const errorId = `${selectId}-error`;
    const describedBy = error ? errorId : description ? descriptionId : undefined;

    // Filter options based on search
    const filteredOptions = useMemo(() => (searchable && searchTerm
        ? options?.filter(option =>
            option?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            (option?.value && option?.value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase()))
        )
        : options), [options, searchable, searchTerm]);

    // Get selected option(s) for display
    const getSelectedDisplay = () => {
        if (!value) return placeholder;

        if (multiple) {
            const selectedOptions = options?.filter(opt => value?.includes(opt?.value));
            if (selectedOptions?.length === 0) return placeholder;
            if (selectedOptions?.length === 1) return selectedOptions?.[0]?.label;
            return `${selectedOptions?.length} items selected`;
        }

        const selectedOption = options?.find(opt => opt?.value === value);
        return selectedOption ? selectedOption?.label : placeholder;
    };

    const handleToggle = () => {
        if (!disabled) {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            onOpenChange?.(newIsOpen);
            if (!newIsOpen) {
                setSearchTerm("");
                setHighlightedIndex(-1);
            } else {
                setHighlightedIndex(getInitialHighlightedIndex());
            }
        }
    };

    const handleOptionSelect = (option) => {
        if (multiple) {
            const newValue = value || [];
            const updatedValue = newValue?.includes(option?.value)
                ? newValue?.filter(v => v !== option?.value)
                : [...newValue, option?.value];
            onChange?.(updatedValue);
        } else {
            onChange?.(option?.value);
            setIsOpen(false);
            onOpenChange?.(false);
            setHighlightedIndex(-1);
        }
    };

    const handleClear = (e) => {
        e?.stopPropagation();
        onChange?.(multiple ? [] : '');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e?.target?.value);
    };

    const isSelected = (optionValue) => {
        if (multiple) {
            return value?.includes(optionValue) || false;
        }
        return value === optionValue;
    };

    const hasValue = multiple ? value?.length > 0 : value !== undefined && value !== '';
    const activeOptionId = highlightedIndex >= 0 ? `${selectId}-option-${highlightedIndex}` : undefined;
    const getInitialHighlightedIndex = React.useCallback((opts = filteredOptions) => {
        if (!opts?.length) return -1;
        if (multiple) return 0;
        const selectedIndex = opts.findIndex((opt) => opt?.value === value);
        return selectedIndex >= 0 ? selectedIndex : 0;
    }, [filteredOptions, multiple, value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
                onOpenChange?.(false);
                setSearchTerm("");
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onOpenChange]);

    useEffect(() => {
        if (!isOpen) return;
        setHighlightedIndex(getInitialHighlightedIndex(filteredOptions));
    }, [filteredOptions, getInitialHighlightedIndex, isOpen]);

    const handleButtonKeyDown = (event) => {
        if (disabled) return;

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                onOpenChange?.(true);
                setHighlightedIndex(getInitialHighlightedIndex());
                return;
            }
            const delta = event.key === "ArrowDown" ? 1 : -1;
            const nextIndex = Math.max(0, Math.min((filteredOptions?.length || 1) - 1, highlightedIndex + delta));
            setHighlightedIndex(nextIndex);
            return;
        }

        if (event.key === "Home" && isOpen) {
            event.preventDefault();
            if (filteredOptions?.length) {
                setHighlightedIndex(0);
            }
            return;
        }

        if (event.key === "End" && isOpen) {
            event.preventDefault();
            if (filteredOptions?.length) {
                setHighlightedIndex(filteredOptions.length - 1);
            }
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                onOpenChange?.(true);
                setHighlightedIndex(getInitialHighlightedIndex());
                return;
            }
            const option = filteredOptions?.[highlightedIndex];
            if (option && !option.disabled) {
                handleOptionSelect(option);
            }
            return;
        }

        if (event.key === "Escape" && isOpen) {
            event.preventDefault();
            setIsOpen(false);
            onOpenChange?.(false);
            setHighlightedIndex(-1);
        }
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {label && (
                <label
                    htmlFor={selectId}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block",
                        error ? "text-destructive" : "text-foreground"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    ref={ref}
                    id={selectId}
                    type="button"
                    className={cn(
                        "flex h-11 w-full items-center justify-between rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus:ring-destructive",
                        !hasValue && "text-muted-foreground"
                    )}
                    onClick={handleToggle}
                    onKeyDown={handleButtonKeyDown}
                    disabled={disabled}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={listboxId}
                    aria-activedescendant={isOpen ? activeOptionId : undefined}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    {...props}
                >
                    <span className="truncate">{getSelectedDisplay()}</span>

                    <div className="flex items-center gap-1">
                        {loading && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}

                        {clearable && hasValue && !loading && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4"
                                onClick={handleClear}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}

                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </div>
                </button>

                {/* Hidden native select for form submission */}
                <select
                    name={name}
                    value={value || ''}
                    onChange={() => { }} // Controlled by our custom logic
                    className="sr-only"
                    tabIndex={-1}
                    multiple={multiple}
                    required={required}
                >
                    <option value="">Select...</option>
                    {options?.map(option => (
                        <option key={option?.value} value={option?.value}>
                            {option?.label}
                        </option>
                    ))}
                </select>

                {/* Dropdown */}
                {isOpen && (
                    <div
                        id={listboxId}
                        role="listbox"
                        className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-md"
                    >
                        {searchable && (
                            <div className="p-2 border-b">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search options..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-8"
                                        aria-label="Search options"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="py-1 max-h-60 overflow-auto">
                            {filteredOptions?.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    {searchTerm ? 'No options found' : 'No options available'}
                                </div>
                            ) : (
                                filteredOptions?.map((option, optionIndex) => (
                                    <div
                                        id={`${selectId}-option-${optionIndex}`}
                                        key={option?.value}
                                        role="option"
                                        aria-selected={isSelected(option?.value)}
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                                            isSelected(option?.value) && "bg-primary text-primary-foreground",
                                            highlightedIndex === optionIndex && "bg-accent text-accent-foreground",
                                            option?.disabled && "pointer-events-none opacity-50"
                                        )}
                                        tabIndex={-1}
                                        onClick={() => !option?.disabled && handleOptionSelect(option)}
                                        onMouseEnter={() => setHighlightedIndex(optionIndex)}
                                    >
                                        <span className="flex-1">{option?.label}</span>
                                        {multiple && isSelected(option?.value) && (
                                            <Check className="h-4 w-4" />
                                        )}
                                        {option?.description && (
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {option?.description}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            {description && !error && (
                <p id={descriptionId} className="text-sm text-muted-foreground mt-1">
                    {description}
                </p>
            )}
            {error && (
                <p id={errorId} className="text-sm text-destructive mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
});

Select.displayName = "Select";

export default Select;
