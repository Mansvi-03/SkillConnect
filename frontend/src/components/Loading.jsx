const Loading = () => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="loading-spinner"></div>

        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading SkillConnect...
        </p>
      </div>
    </div>
  );
};

export default Loading;
