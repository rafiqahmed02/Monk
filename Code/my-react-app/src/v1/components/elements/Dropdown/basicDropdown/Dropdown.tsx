import React, { useState, useRef, useEffect } from "react";
import styles from "./Dropdown.module.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// Updated interface to make `value` optional
interface DropdownOption {
  label: string; // What is shown in the UI
  value?: string; // The actual value to use (optional)
  disabled?: boolean;
}

interface DropdownProps {
  label: string; // Label to display for the dropdown
  placeholder: string;
  options: DropdownOption[]; // Array of options with label and (optional) value
  onSelect: (value: string) => void; // Callback to handle option selection
  error?: boolean;
  selectedValue?: string; // Selected value for controlled component behavior
  toastMessage?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  options,
  onSelect,
  error,
  selectedValue,
  toastMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null); // Display label for selected option
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null); // Track the currently highlighted option index
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown open/close
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    const label = dropdownRef.current?.querySelector(`.${styles.labelText}`);
    if (!isOpen) {
      label?.classList.add(`${styles.active}`);
    } else if (!selectedLabel) {
      label?.classList.remove(`${styles.active}`);
    }
  };

  // Ensuring the label repositions itself only if the dropdown is empty
  const handleBlur = () => {
    const label = dropdownRef.current?.querySelector(`.${styles.labelText}`);
    // Ensure label is not active when there's no selection
    if (!selectedLabel && !isOpen) {
      label?.classList.remove(`.${styles.active}`);
    }
  };

  // Handle option selection
  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) {
      toast.dismiss();
      toast(
        <div className={styles.customToast}>
          <WarningAmberIcon color="warning" />
          <span>{toastMessage}</span>
        </div>
      );
    } else {
      const optionValue = option.value || option.label; // Default to label if value is not provided
      setSelectedLabel(option.label);
      setIsOpen(false);
      onSelect(optionValue); // Return the appropriate value to parent
      const label = dropdownRef.current?.querySelector(`${styles.labelText}`);
      label?.classList.add(`${styles.active}`); // Ensure label stays floated
    }
  };

  // Handle key navigation: ArrowUp, ArrowDown, Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true); // Open dropdown when navigating with arrows
      setHighlightedIndex((prevIndex) =>
        prevIndex === null || prevIndex === options.length - 1
          ? 0
          : prevIndex + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true); // Open dropdown when navigating with arrows
      setHighlightedIndex((prevIndex) =>
        prevIndex === null || prevIndex === 0
          ? options.length - 1
          : prevIndex - 1
      );
    } else if (e.key === "Enter" && highlightedIndex !== null) {
      e.preventDefault();
      handleOptionClick(options[highlightedIndex]); // Select highlighted option on Enter
    } else if (e.key === "Escape") {
      setIsOpen(false); // Close dropdown on Escape key
      setHighlightedIndex(null); // Reset highlighted index
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        const label = dropdownRef.current?.querySelector(
          `.${styles.labelText}`
        );
        if (!selectedLabel) {
          console.log(label);
          label?.classList.remove(`${styles.active}`); // Remove 'active' only if there is no selected label
        }
        setHighlightedIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedLabel]);

  // Find the selected label based on the selected value, if provided
  useEffect(() => {
    if (selectedValue !== undefined) {
      const selectedOption = options.find(
        (option) => (option.value || option.label) === selectedValue
      );
      if (selectedOption) {
        setSelectedLabel(selectedOption.label);
      }
    }
  }, [selectedValue, options]);

  return (
    <div
      className={styles.dropdownContainer}
      ref={dropdownRef}
      tabIndex={0} // Make div focusable
      onKeyDown={handleKeyDown} // Listen for keydown events
    >
      <div
        className={`${styles.dropdownLabel} ${error ? styles.inputError : ""}`}
        onClick={toggleDropdown}
        tabIndex={0} // Make this div focusable
      >
        <div
          className={`${styles.labelText}  ${
            selectedLabel ? styles.active : ""
          }`}
        >
          {label}
        </div>
        <p style={selectedLabel ? { color: "black" } : { color: "grey" }}>
          {selectedLabel}
        </p>
        {isOpen ? (
          <FaChevronUp className={styles.dropdownIcon} />
        ) : (
          <FaChevronDown className={styles.dropdownIcon} />
        )}
      </div>

      <div
        className={`${styles.dropdown} ${isOpen ? styles.open : styles.close}`}
        role="listbox"
        aria-expanded={isOpen} // Use ARIA to indicate the open state
      >
        {options.map((option, index) => (
          <div
            key={index}
            className={`${styles.dropdownOption} ${
              highlightedIndex === index ? styles.highlighted : ""
            } ${option.disabled ? styles.disabled : ""}`}
            onClick={() => handleOptionClick(option)}
            role="option"
            aria-selected={highlightedIndex === index} // Indicate which option is highlighted
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
