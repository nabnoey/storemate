import Skeleton from "@mui/material/Skeleton";

export default function NotificationSkeleton() {
  return (
    <div className="w-full p-4 rounded-lg border border-gray-100 bg-white">
      <Skeleton variant="text" width="35%" height={28} />

      <Skeleton variant="text" width="85%" height={24} />

      <Skeleton variant="text" width="25%" height={20} sx={{ marginTop: 1 }} />
    </div>
  );
}
