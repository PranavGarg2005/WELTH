import { useState } from "react";
import { toast } from "sonner";

const useFetch = <T, Args extends any[] = any[]>(cb: (...args: Args) => Promise<T>) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);

    }
    catch (error) {
      setError(error as Error);
      toast.error((error as Error).message)
    }
    finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fn }
};

export default useFetch;