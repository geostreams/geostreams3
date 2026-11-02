import { createContext, useContext, useMemo, type ReactNode } from "react";
import useParameters from "../hooks/useParameters";
import type { Parameter } from "../types/api";

type ParametersContextValue = ReturnType<typeof useParameters>;

const ParametersContext = createContext<ParametersContextValue | null>(null);

/**
 * Provides parameters, categories, and visualizations to the component tree.
 */
export const ParametersProvider = ({ children }: { children: ReactNode }) => {
    const paramData = useParameters();

    return (
        <ParametersContext.Provider value={paramData}>
            {children}
        </ParametersContext.Provider>
    );
};

const useParametersContext = () => {
    const ctx = useContext(ParametersContext);
    if (!ctx) {
        throw new Error(
            "useParametersContext must be used within a ParametersProvider",
        );
    }
    return ctx;
};

/**
 * Returns the full list of parameter objects.
 */
export const useParametersList = (): Parameter[] => {
    const { parameters } = useParametersContext();
    return parameters;
};

/**
 * Returns a map of parameter name (id) -> display title.
 */
export const useParamNames = (): Record<string, string> => {
    const { parameters } = useParametersContext();
    return useMemo(
        () =>
            parameters.reduce<Record<string, string>>((acc, p) => {
                acc[p.name] = p.title || p.name;
                return acc;
            }, {}),
        [parameters],
    );
};

/**
 * Returns a map of parameter name (id) -> unit string.
 */
export const useParamUnits = (): Record<string, string> => {
    const { parameters } = useParametersContext();
    return useMemo(
        () =>
            parameters.reduce<Record<string, string>>((acc, p) => {
                acc[p.name] = p.unit || "";
                return acc;
            }, {}),
        [parameters],
    );
};
