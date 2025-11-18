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
    <div className="mb-6 w-full">
      {label && (
        <label
          htmlFor={label}
          className="mb-1.5 block text-sm font-medium text-[#344054]"
        >
          {label}
        </label>
      )}
      <div className="relative flex w-full items-center">
        {icon && <span className="absolute left-3 text-[#9D9D9D]">{icon}</span>}
        <input
          type={type}
          name={name}
          id={label}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full rounded-none border-0 border-b border-[#9D9D9D] bg-transparent px-4 py-2.5 ${icon ? "pl-10" : "pl-4"} text-[#9D9D9D] placeholder:text-[#9D9D9D] focus:border-[#9D9D9D] focus:bg-transparent focus:outline-none focus:ring-0 ${
            error && "border-b-2 border-red-600"
          }`}
          {...props}
        />
      </div>
      {error && <p className="ml-3 mt-1 block text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
