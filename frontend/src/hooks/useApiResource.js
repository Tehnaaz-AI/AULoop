import { useEffect, useState } from "react";

export function useApiResource(loader, deps = [], initialData = undefined) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    loader()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || err.message || "Request failed");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, deps);

  return { data: data ?? initialData, setData, loading, error };
}
