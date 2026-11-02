import { useState, useEffect, useCallback } from "react";
import { publicApi, getErrorMessage, getErrorStatus } from "../api/apiClient";
import type {
    Category,
    CategoryInput,
    CategoriesResponse,
    Parameter,
    ParameterInput,
    ParametersResponse,
    Visualization,
    VisualizationInput,
    VisualizationsResponse,
} from "../types/api";
import useApiClient from "./useApiClient";

/**
 * Hook for managing parameters, categories, and visualizations.
 * GET requests are public (no auth needed).
 * POST/PUT/DELETE require authentication.
 */
const useParameters = () => {
    const authApi = useApiClient();

    // Parameters state
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [isLoadingParams, setIsLoadingParams] = useState(false);
    const [paramsError, setParamsError] = useState<string | null>(null);

    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    // Visualizations state
    const [visualizations, setVisualizations] = useState<Visualization[]>([]);
    const [isLoadingVisualizations, setIsLoadingVisualizations] =
        useState(false);

    // --- Parameters ---
    const fetchParameters = useCallback(async () => {
        setIsLoadingParams(true);
        setParamsError(null);
        try {
            const response =
                await publicApi.get<ParametersResponse>("data/parameters/");
            setParameters(response.data?.parameters || []);
        } catch (err) {
            if (getErrorStatus(err) === 404) {
                setParameters([]);
            } else {
                setParamsError(
                    getErrorMessage(err, "Failed to fetch parameters"),
                );
            }
        } finally {
            setIsLoadingParams(false);
        }
    }, []);

    const createParameter = useCallback(
        async (data: ParameterInput) => {
            const response = await authApi.post<Parameter>(
                "data/parameters/",
                data,
            );
            await fetchParameters();
            return response.data;
        },
        [authApi, fetchParameters],
    );

    const updateParameter = useCallback(
        async (id: number, data: ParameterInput) => {
            const response = await authApi.put<Parameter>(
                `data/parameters/${id}/`,
                data,
            );
            await fetchParameters();
            return response.data;
        },
        [authApi, fetchParameters],
    );

    const deleteParameter = useCallback(
        async (id: number) => {
            await authApi.delete(`data/parameters/${id}/`);
            await fetchParameters();
        },
        [authApi, fetchParameters],
    );

    // --- Categories ---
    const fetchCategories = useCallback(async () => {
        setIsLoadingCategories(true);
        try {
            const response =
                await publicApi.get<CategoriesResponse>("data/categories/");
            setCategories(response.data?.categories || []);
        } catch {
            // 404 or other error -- treat as empty
            setCategories([]);
        } finally {
            setIsLoadingCategories(false);
        }
    }, []);

    const createCategory = useCallback(
        async (data: CategoryInput) => {
            const response = await authApi.post<Category>(
                "data/categories/",
                data,
            );
            await fetchCategories();
            return response.data;
        },
        [authApi, fetchCategories],
    );

    const deleteCategory = useCallback(
        async (id: number) => {
            await authApi.delete(`data/categories/${id}/`);
            await fetchCategories();
        },
        [authApi, fetchCategories],
    );

    // --- Visualizations ---
    const fetchVisualizations = useCallback(async () => {
        setIsLoadingVisualizations(true);
        try {
            const response = await publicApi.get<VisualizationsResponse>(
                "data/visualizations/",
            );
            setVisualizations(response.data?.visualizations || []);
        } catch {
            // 404 or other error -- treat as empty
            setVisualizations([]);
        } finally {
            setIsLoadingVisualizations(false);
        }
    }, []);

    const createVisualization = useCallback(
        async (data: VisualizationInput) => {
            const response = await authApi.post<Visualization>(
                "data/visualizations/",
                data,
            );
            await fetchVisualizations();
            return response.data;
        },
        [authApi, fetchVisualizations],
    );

    const deleteVisualization = useCallback(
        async (id: number) => {
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
