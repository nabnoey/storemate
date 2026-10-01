import Skeleton from "@mui/material/Skeleton";

type SkeletonType = "mod-table";

interface SkeletonsProps {
  type: SkeletonType;
  rows?: number;
  columns?: number;
}

export default function OwnerSkeletons({
  type,
  rows = 8,
  columns = 8,
}: SkeletonsProps) {
  if (type === "mod-table") {
    return (
      <>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="py-4 px-2">
                <div
                  className={`flex ${
                    colIndex === 3 || colIndex === 6 || colIndex === 7
                      ? "justify-center"
                      : ""
                  }`}
                >
                  <Skeleton
                    variant="text"
                    animation="wave"
                    width={
                      colIndex === 0
                        ? 150
                        : colIndex === 1
                          ? 100
                          : colIndex === 2
                            ? 130
                            : colIndex === 3
                              ? 80
                              : colIndex === 4
                                ? 120
                                : colIndex === 5
                                  ? 100
                                  : colIndex === 6
                                    ? 80
                                    : 60
                    }
                    height={24}
                  />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }

  return null;
}
