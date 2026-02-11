import { useState, useEffect, useCallback } from "react";
import { publicApi } from "../api/apiClient";
import useApiClient from "./useApiClient";

/**
 * Hook for managing parameters, categories, and visualizations.
 * GET requests are public (no auth needed).
 * POST/PUT/DELETE require authentication.
 */
const useParameters = () => {
    const authApi = useApiClient();

    // Parameters state
    const [parameters, setParameters] = useState([]);
    const [isLoadingParams, setIsLoadingParams] = useState(false);
    const [paramsError, setParamsError] = useState(null);

    // Categories state
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    // Visualizations state
    const [visualizations, setVisualizations] = useState([]);
    const [isLoadingVisualizations, setIsLoadingVisualizations] =
        useState(false);

    // --- Parameters ---
    const fetchParameters = useCallback(async () => {
        setIsLoadingParams(true);
        setParamsError(null);
        try {
            const response = await publicApi.get("data/parameters/");
            setParameters(response.data?.parameters || []);
        } catch (err) {
            if (err.response?.status === 404) {
                setParameters([]);
            } else {
                setParamsError(
                    err.response?.data?.message || "Failed to fetch parameters",
                );
            }
        } finally {
            setIsLoadingParams(false);
        }
    }, []);

    const createParameter = useCallback(
        async (data) => {
            const response = await authApi.post("data/parameters/", data);
            await fetchParameters();
            return response.data;
        },
        [authApi, fetchParameters],
    );

    const updateParameter = useCallback(
        async (id, data) => {
            const response = await authApi.put(`data/parameters/${id}/`, data);
            await fetchParameters();
            return response.data;
        },
        [authApi, fetchParameters],
    );

    const deleteParameter = useCallback(
        async (id) => {
            await authApi.delete(`data/parameters/${id}/`);
            await fetchParameters();
        },
        [authApi, fetchParameters],
    );

    // --- Categories ---
    const fetchCategories = useCallback(async () => {
        setIsLoadingCategories(true);
        try {
            const response = await publicApi.get("data/categories/");
            setCategories(response.data?.categories || []);
        } catch {
            // 404 or other error -- treat as empty
            setCategories([]);
        } finally {
            setIsLoadingCategories(false);
        }
    }, []);

    const createCategory = useCallback(
        async (data) => {
            const response = await authApi.post("data/categories/", data);
            await fetchCategories();
            return response.data;
        },
        [authApi, fetchCategories],
    );

    const deleteCategory = useCallback(
        async (id) => {
            await authApi.delete(`data/categories/${id}/`);
            await fetchCategories();
        },
        [authApi, fetchCategories],
    );

    // --- Visualizations ---
    const fetchVisualizations = useCallback(async () => {
        setIsLoadingVisualizations(true);
        try {
            const response = await publicApi.get("data/visualizations/");
            setVisualizations(response.data?.visualizations || []);
        } catch {
            // 404 or other error -- treat as empty
            setVisualizations([]);
        } finally {
            setIsLoadingVisualizations(false);
        }
    }, []);

    const createVisualization = useCallback(
        async (data) => {
            const response = await authApi.post("data/visualizations/", data);
            await fetchVisualizations();
            return response.data;
        },
        [authApi, fetchVisualizations],
    );

    const deleteVisualization = useCallback(
        async (id) => {
            await authApi.delete(`data/visualizations/${id}/`);
            await fetchVisualizations();
        },
        [authApi, fetchVisualizations],
    );

    // Fetch all on mount
    useEffect(() => {
        fetchParameters();
        fetchCategories();
        fetchVisualizations();
    }, [fetchParameters, fetchCategories, fetchVisualizations]);

    return {
        // Parameters
        parameters,
        isLoadingParams,
        paramsError,
        fetchParameters,
        createParameter,
        updateParameter,
        deleteParameter,
        // Categories
        categories,
        isLoadingCategories,
        fetchCategories,
        createCategory,
        deleteCategory,
        // Visualizations
        visualizations,
        isLoadingVisualizations,
        fetchVisualizations,
        createVisualization,
        deleteVisualization,
    };
};

export default useParameters;
