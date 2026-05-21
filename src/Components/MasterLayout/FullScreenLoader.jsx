import loadingStore from "../../Zustand/LoadingStore";

const FullScreenLoader = () => {
  const { globalLoader } = loadingStore();

  if (!globalLoader) return null;

  return (
    <>
      {/* Overlay blocking all clicks */}
      <div className="fixed inset-0 z-50 bg-transparent"></div>

      {/* Loading bar container */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        {/* Animated loading bar */}
        <div
          className="h-[2px] bg-[#FF0000]" // change color to YouTube red or whatever you want
          style={{
            width: "70%",
            animation: "slideLoading 1s linear infinite",
          }}
        />
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes slideLoading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(500%);
          }
        }
      `}</style>
    </>
  );
};

export default FullScreenLoader;
