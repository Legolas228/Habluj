import React from "react";
import { cn } from "../../utils/cn";

const Textarea = React.forwardRef(({
  className,
  label,
  description,
  error,
  required = false,
  id,
  rows = 4,
  ...props
}, ref) => {
  const generatedId = React.useId();
  const textareaId = id || `textarea-${generatedId}`;
  const descriptionId = `${textareaId}-description`;
  const errorId = `${textareaId}-error`;
  const describedBy = error ? errorId : description ? descriptionId : undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            "text-sm font-medium leading-none",
            error ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />

      {description && !error && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
