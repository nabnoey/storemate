import LottiePackage from "lottie-react";
import defaultAnimation from "../../assets/Shop.json";

const Lottie = (LottiePackage as any).default || LottiePackage;

interface LoadingProps {
  animation?: any;
  fullScreen?: boolean;
  size?: number;
}

const Loading: React.FC<LoadingProps> = ({
  animation,
  fullScreen = true,
  size = 300,
}) => {
  const animationData = animation || defaultAnimation;

  return (
    <div
      data-test="loading-screen"
      className={`flex items-center justify-center ${
        fullScreen
          ? "fixed inset-0 z-[100] bg-white/90 backdrop-blur-3xl"
          : "w-full py-10"
      }`}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ height: size, width: size }}
      />
    </div>
  );
};

export default Loading;
