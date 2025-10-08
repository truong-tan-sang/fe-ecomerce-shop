import { ChangeEvent } from "react";

interface InputProps {
  type: "text" | "number" | "email" | "password";
  label?: string;
  value: string | number;
  name: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  type,
  name,
  disabled,
  placeholder,
  label,
  value,
  onChange,
  error,
  icon,
  ...props
}) => {
  return (
    <div className="mb-6">
      {label && (
        <label
          htmlFor={label}
          className="mb-1.5 block text-sm font-medium text-[#344054]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-[#667085]">{icon}</span>}
        <input
          type={type}
          name={name}
          id={label}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full rounded-lg border border-[#D0D5DD] px-4 py-2.5 pl-10 text-gray-700 placeholder:text-[#667085] focus:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
            error && "ring-2 ring-red-200"
          }`}
          {...props}
        />
      </div>
      {error && <p className="ml-3 mt-1 block text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
