import Skeleton from "@mui/material/Skeleton";

export default function Skeletons() {
  return (
    <div className="bg-white rounded-xl p-4 shadow mb-4">
      <Skeleton variant="text" width={180} height={30} />
      <Skeleton variant="text" width={120} />
      <Skeleton
        variant="rectangular"
        height={80}
        sx={{ borderRadius: 2, marginTop: 2 }}
      />
      <Skeleton width="40%" sx={{ marginTop: 2 }} />
    </div>
  );
}