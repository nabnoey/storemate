import { useNavigation } from "react-router-dom";
import Loading from "./Loading";

const RouteLoader = () => {
  const navigation = useNavigation();

  if (navigation.state === "loading") {
    return <Loading />;
  }

  return null;
};

export default RouteLoader;