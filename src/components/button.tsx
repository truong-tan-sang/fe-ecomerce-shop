import { LoaderCircle } from "lucide-react";

type ButtonProps = {
  text: string;
  loading?: boolean;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ text, loading = false, disabled }) => {
  return (
    <button
      className="w-full  
      cursor-pointer 
      rounded-lg border  
      border-neutral-800 bg-neutral-800 
      px-4 py-2 text-white hover:border-gray-700 hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500
        "
      type="submit"
      disabled={disabled}
    >
      {!loading ? (
        text
      ) : (
        <LoaderCircle
          className="inline-block animate-spin text-center"
          color="#fff"
        />
      )}
    </button>
  );
};

export default Button;
