const SignupSkeleton = () => {
  return (
    <div className="w-full max-w-md mx-auto p-8 mt-16 bg-white rounded shadow-md animate-pulse">
      {/* Page title indicator */}
      <div className="flex justify-center mb-8">
        <span className="text-sm text-gray-400 font-medium px-4 py-1 bg-gray-100 rounded-full">
          Signup page coming soon
        </span>
      </div>

      <h2 className="text-2xl font-semibold text-center mb-4"></h2>

      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        </div>
        <div>
          <div className="h-10 bg-gray-200 rounded-md w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SignupSkeleton;