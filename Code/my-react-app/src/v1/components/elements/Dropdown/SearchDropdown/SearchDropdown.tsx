import React, { useState, useRef, useEffect } from "react";
import styles from "./SearchDropdown.module.css";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CircularProgress } from "@mui/material";
import debounce from "lodash/debounce";
import CloseIcon from "@mui/icons-material/Close";
import { MasjidOption } from "../../../../Types/MasjidTypes";
import { customNavigatorTo } from "../../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../../MyProvider";

interface SearchDropdownProps {
  options: MasjidOption[];
  placeholder: string;
  onSelect: (option: MasjidOption[]) => void;
  error?: boolean;
  selectedValue?: string;
  onInputChange?: (value: string) => void;
  loading?: boolean;
  clearData?: () => void;
  children?: React.ReactNode;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  options,
  placeholder,
  onSelect,
  error = false,
  selectedValue,
  onInputChange,
  loading,
  clearData,
  children,
  onBlur,
  onFocus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigation = useNavigationprop();

  useEffect(() => {
    if (selectedValue) {
      setSearchValue(selectedValue);
    }
  }, [selectedValue]);

  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredOptions([]);
      return;
    }
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    onInputChange && onInputChange(searchValue);
  }, [searchValue]);

  const handleOptionClick = (option: MasjidOption) => {
    onSelect(option);
    setSearchValue(option.masjidName); // Set the input value to the selected option's name
    setIsOpen(false);
    // Ensure the label stays floated since the input now has a value
    const inputElement = document.querySelector(`.${styles.input}`);
    const label = inputElement?.parentNode?.querySelector(
      `.${styles.floatingLabel}`
    );
    label?.classList.add(styles.active);
  };

  const clearInput = () => {
    setSearchValue("");
    // debouncedSearch("");
    const inputElement = document.querySelector(`.${styles.input}`);
    const label = inputElement?.parentNode?.querySelector(
      `.${styles.floatingLabel}`
    );
    label?.classList.remove(styles.active); // Ensure the label moves back down when the input is cleared
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    const label = e.target.parentNode?.querySelector(
      `.${styles.floatingLabel}`
    );
    if (e.target.value) {
      label?.classList.add(styles.active);
    } else {
      label?.classList.remove(styles.active);
    }
  };
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsOpen(true);
    const label = e.target.parentNode?.querySelector(
      `.${styles.floatingLabel}`
    );
    label?.classList.add(styles.active); // Add 'active' class on focus
    onFocus && onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const label = e.target.parentNode?.querySelector(
      `.${styles.floatingLabel}`
    );
    if (e.target.value === "") {
      label?.classList.remove(styles.active); // Only remove 'active' if input is actually empty
    }
    onBlur && onBlur(e);
  };

  useEffect(() => {
    const inputElement = document.querySelector(
      `.${styles.input}`
    ) as HTMLInputElement | null;
    const label = inputElement?.parentNode?.querySelector(
      `.${styles.floatingLabel}`
    ) as HTMLElement | null;
    if (inputElement && inputElement.value) {
      label?.classList.add(styles.active);
    }
  }, []);

  console.log(searchValue);
  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div className={`${styles.inputGroup} ${error ? styles.inputError : ""}`}>
        <label
          htmlFor="searchInput"
          className={`${styles.floatingLabel}  ${
            searchValue ? styles.active : ""
          }`}
        >
          Search & Select Masjid
        </label>
        <FaSearch className={styles.icon} />
        <input
          type="text"
          // placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={styles.input}
          disabled={!!selectedValue}
        />
        {selectedValue && (
          <span
            className={styles.clearIcon}
            onClick={() => {
              clearData && clearData();
              clearInput();
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </span>
        )}
        {isOpen ? (
          <FaChevronUp
            className={styles.dropdownIcon}
            onClick={() => setIsOpen(false)}
          />
        ) : (
          <FaChevronDown
            className={styles.dropdownIcon}
            onClick={() => setIsOpen(true)}
          />
        )}
      </div>
      <div
        className={`${styles.dropdown} ${isOpen ? styles.open : styles.close}`}
      >
        <div className={styles.optionsContainer}>
          {loading ? (
            <div className={styles.loading}>
              <CircularProgress size={20} color="inherit" />
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option._id}
                className={`${styles.dropdownOption} ${
                  highlightedIndex === index ? styles.highlighted : ""
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option.masjidName}
                <div style={{ fontSize: "10px" }}>{option.address}</div>
              </div>
            ))
          ) : (
            <div className={styles.noOption}>
              {searchValue ? "No Matching Masjid Found" : "Start Typing..."}
            </div>
          )}
        </div>
        {/* Always visible footer */}
        <div className={styles.footer}>
          <a
            className={styles.addMasjidLink}
            onClick={() =>
              navigation
                ? navigation("/add-masjid")
                : customNavigatorTo("/add-masjid")
            }
          >
            Couldn’t Find Masjid Name? Add Masjid Now
          </a>
        </div>
      </div>
      {children}
    </div>
  );
};

export default SearchDropdown;
