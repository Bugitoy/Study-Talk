interface LoaderProps {
  className?: string;
  fullScreen?: boolean;
}

const Loader = ({ className = "", fullScreen = true }: LoaderProps) => {
  const spinnerClasses = "animate-spin rounded-full border-4 border-gray-300 border-t-blue-600";
  
  if (fullScreen) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <div className={`h-8 w-8 ${spinnerClasses} ${className}`}></div>
    </div>
    );
  }
  
  return (
    <div className={`h-8 w-8 ${spinnerClasses} ${className}`}></div>
  );
};

export default Loader; 