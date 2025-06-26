"use client"

import { useState, useEffect } from "react"

export function useApi<T>(apiCall: (token: string | null) => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        const result = await apiCall(token);
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "An error occurred")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const result = await apiCall(token);
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

export function usePaginatedApi<T>(
  apiCall: (page: number, size: number) => Promise<{ content: T[]; totalElements: number; totalPages: number }>,
  initialPage = 0,
  pageSize = 10,
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchData = async (pageNum: number) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall(pageNum, pageSize)
      setData(result.content)
      setTotalElements(result.totalElements)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(page)
  }, [page])

  const goToPage = (newPage: number) => {
    setPage(newPage)
  }

  const refetch = () => {
    fetchData(page)
  }

  return {
    data,
    loading,
    error,
    page,
    totalElements,
    totalPages,
    goToPage,
    refetch,
  }
}
